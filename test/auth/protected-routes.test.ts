import type { Express } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

process.env.TOKEN_SECRET = "test-token-secret";
process.env.TOKEN_ISSUER = "test-issuer";
process.env.TOKEN_AUDIENCE = "test-audience";
process.env.ACCESS_TOKEN_VALIDITY_SEC = "3600";
process.env.REFRESH_TOKEN_VALIDITY_SEC = "86400";

let mongo: MongoMemoryServer;
let app: Express;
let userAccessToken: string;
let anotherUserAccessToken: string;
let adminAccessToken: string;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  const [
    server,
    { default: Role, RoleCode },
    { default: User },
    { KeyModel },
    { createTokens },
  ] = await Promise.all([
    import("../../src/server.js"),
    import("../../src/models/rolemodel.js"),
    import("../../src/models/userModel.js"),
    import("../../src/models/KeyStoremodel.js"),
    import("../../src/auth/utils.js"),
  ]);
  app = server.app;

  const [userRole, adminRole] = await Promise.all([
    Role.create({ code: RoleCode.USER, status: true }),
    Role.create({ code: RoleCode.ADMIN, status: true }),
  ]);

  const createSession = async (roleId: mongoose.Types.ObjectId, email: string) => {
    const user = await User.create({
      name: email,
      email,
      password: "test-password",
      roles: [roleId],
    });
    const primaryKey = `${email}-access-key`;
    const secondaryKey = `${email}-refresh-key`;
    await KeyModel.create({ client: user._id, primaryKey, secondaryKey, status: true });
    return (await createTokens(user, primaryKey, secondaryKey)).accessToken;
  };

  [userAccessToken, anotherUserAccessToken, adminAccessToken] = await Promise.all([
    createSession(userRole._id, "user@example.test"),
    createSession(userRole._id, "another-user@example.test"),
    createSession(adminRole._id, "admin@example.test"),
  ]);
}, 300_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

const getWithAuth = (path: string, token: string) =>
  request(app)
    .get(path)
    .set("Cookie", `accessToken=${token}`);

describe("protected routes", () => {
  it("accepts a valid Bearer access token for Postman-style requests", async () => {
    await request(app)
      .get("/api/todo")
      .set("Authorization", `Bearer ${anotherUserAccessToken}`)
      .expect(200);
  });

  it("rejects todo reads without authentication", async () => {
    await request(app).get("/api/todo").expect(401);
  });

  it("rejects todo creation without authentication", async () => {
    await request(app)
      .post("/api/todo")
      .send({ title: "Unauthorized", description: "Should not be created" })
      .expect(401);
  });

  it("rejects todo updates without authentication", async () => {
    await request(app)
      .put("/api/todo/507f1f77bcf86cd799439011")
      .send({
        title: "Unauthorized",
        description: "Should not be updated",
        status: "in-progress",
      })
      .expect(401);
  });

  it("rejects todo deletion without authentication", async () => {
    await request(app)
      .delete("/api/todo/507f1f77bcf86cd799439011")
      .expect(401);
  });

  it("revokes todo access after logout", async () => {
    await getWithAuth("/api/users/logout", userAccessToken).expect(200);

    await getWithAuth("/api/todo", userAccessToken).expect(401);
  });

  it("denies the user-list route to non-admin users", async () => {
    await getWithAuth("/api/users/datas?page=1&limit=10", anotherUserAccessToken).expect(403);
  });

  it("allows admins to list users without exposing password hashes", async () => {
    const response = await getWithAuth(
      "/api/users/datas?page=1&limit=10",
      adminAccessToken
    ).expect(200);

    expect(response.body.Data).toHaveLength(3);
    expect(response.body.Data.every((user: { password?: string }) => !user.password)).toBe(true);
  });

  it("supports logout via POST and revokes access", async () => {
    // Authenticate another user and test POST /api/users/logout
    await request(app)
      .post("/api/users/logout")
      .set("Authorization", `Bearer ${anotherUserAccessToken}`)
      .expect(200);

    // Subsequent call to /api/todo should be rejected
    await request(app)
      .get("/api/todo")
      .set("Authorization", `Bearer ${anotherUserAccessToken}`)
      .expect(401);
  });

  it("allows registered admin users to access /api/users/datas and /api/users", async () => {
    const adminReg = await request(app)
      .post("/api/users/register")
      .send({
        name: "SuperAdmin",
        email: "superadmin@example.test",
        password: "adminPassword123",
        role: "ADMIN",
      })
      .expect(201);

    const cookies: string[] = Array.isArray(adminReg.headers["set-cookie"])
      ? adminReg.headers["set-cookie"]
      : [];
    const tokenCookie = cookies.find((c) => c.startsWith("accessToken="));
    const token = tokenCookie?.split(";")[0]?.split("=")[1];

    // Access via /api/users/datas
    const res1 = await request(app)
      .get("/api/users/datas")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(res1.body.Data).toBeDefined();

    // Access via /api/users
    const res2 = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(res2.body.Data).toBeDefined();
  });

  it("allows authenticated users to create and fetch their todos without an API key", async () => {
    // Register a normal user
    const regRes = await request(app)
      .post("/api/users/register")
      .send({
        name: "TodoUser",
        email: "todouser@example.test",
        password: "userPassword123",
      })
      .expect(201);

    const cookies: string[] = Array.isArray(regRes.headers["set-cookie"])
      ? regRes.headers["set-cookie"]
      : [];
    const token = cookies.find((c) => c.startsWith("accessToken="))?.split(";")[0]?.split("=")[1];

    // Create a todo
    await request(app)
      .post("/api/todo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Todo",
        description: "Testing todo route with auth middleware",
      })
      .expect(201);

    // Get todos
    const getRes = await request(app)
      .get("/api/todo")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(getRes.body.Data).toHaveLength(1);
    expect(getRes.body.Data[0].title).toBe("Test Todo");
  });
});
