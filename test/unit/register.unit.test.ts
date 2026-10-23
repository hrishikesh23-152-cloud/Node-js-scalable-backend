import {it,describe,expect,vi} from "vitest";
import request from "supertest";
import { app } from "../../src/server.js";
import UserModelMock from "../../src/models/__mocks__/userModel.js";
import mongoose from "mongoose";
import {RoleCode} from "../../src/models/__mocks__/rolemodel.js";
import roleModelMock from "../../src/models/__mocks__/rolemodel.js";    
import {KeyModel} from "../../src/models/__mocks__/KeyStoremodel.js";
import { tokenInfo } from "../../src/config.js";
import JWT from 'jsonwebtoken';

vi.mock("../../src/models/userModel.js")
vi.mock("../../src/models/rolemodel.js")
vi.mock("../../src/models/KeyStoremodel.js")
describe("Register API", () => {
    const endpoint = "/api/users/register";

    const userPayload = {
        name: "john1",
        email: "john1@gmail.com",
        password: "john12027",
    };

    it("should register a user", async () => {
        const mongoId = new mongoose.Types.ObjectId();
        roleModelMock.findOne.mockResolvedValue({
            _id: mongoId,
            code: RoleCode.USER,
            status: true,
        });
        UserModelMock.create.mockResolvedValue({
            _id: mongoId,
             name: userPayload.name,
            email: userPayload.email,
           
            // password: userPayload.password,
            // role: [mongoId],
        });
        KeyModel.create.mockResolvedValue({
            _id: mongoId,
            client:mongoId,
            primaryKey:"primaryKey",
            secondaryKey:"secondaryKey",
            // status:true
        });
        const res = await request(app)
            .post(endpoint)
            .send(userPayload)

        expect(res.status).toBe(201);
        expect(res.body._id).toBeDefined();
        expect(res.body).toMatchObject({
            name: userPayload.name,
            email: userPayload.email,
            // roles: [String(mongoId)],
        
        });
        expect(UserModelMock.findOne).toHaveBeenCalledWith({ email: userPayload.email });
        expect(roleModelMock.findOne).toHaveBeenCalledWith({ code: RoleCode.USER, status: true });
        expect(KeyModel.create).toHaveBeenCalled();
    });
     // 2. Duplicate email
  it("should not register if user already exists", async () => {
    UserModelMock.findOne.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      name: userPayload.name,
      email: userPayload.email,
    });

    const res = await request(app)
      .post(endpoint)
      .send(userPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already Exists");

    expect(UserModelMock.create).not.toHaveBeenCalled();
    expect(roleModelMock.findOne).not.toHaveBeenCalled();
    expect(KeyModel.create).not.toHaveBeenCalled();
  });
    // 3. Invalid email
  it("should return 400 with an invalid email", async () => {
    const invalidPayload = {
      ...userPayload,
      email: "invalid-email",
    };

    const res = await request(app)
      .post(endpoint)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email");

    expect(UserModelMock.findOne).not.toHaveBeenCalled();
    expect(UserModelMock.create).not.toHaveBeenCalled();
    expect(KeyModel.create).not.toHaveBeenCalled();
  });
  // 4. Invalid password
  it("should return 400 with an invalid password", async () => {
    const invalidPayload = {
      ...userPayload,
      password: "123",
    };

    const res = await request(app)
      .post(endpoint)
      .send(invalidPayload);

    expect(res.status).toBe(400);

    expect(res.body.message).toBe(
      "Password must be at least 6 characters"
    );

    expect(UserModelMock.findOne).not.toHaveBeenCalled();
    expect(UserModelMock.create).not.toHaveBeenCalled();
    expect(KeyModel.create).not.toHaveBeenCalled();
  });
    // 5. Missing email and password
  it("should return 400 with missing email and password", async () => {
    const invalidPayload = {
      name: userPayload.name,
    };

    const res = await request(app)
      .post(endpoint)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);

    expect(UserModelMock.findOne).not.toHaveBeenCalled();
    expect(UserModelMock.create).not.toHaveBeenCalled();
    expect(KeyModel.create).not.toHaveBeenCalled();
  });
  // 6. No cookies when registration fails
  it("should not set cookies if registration fails due to duplicate email", async () => {
    UserModelMock.findOne.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      name: "Existing User",
      email: userPayload.email,
    });

    const res = await request(app)
      .post(endpoint)
      .send(userPayload);

    expect(res.status).toBe(400);
    expect(res.headers["set-cookie"]).toBeUndefined();

    expect(UserModelMock.create).not.toHaveBeenCalled();
    expect(KeyModel.create).not.toHaveBeenCalled();
  });
    // 7. Access and refresh cookies on successful registration
  it("should set accessToken and refreshToken cookies on successful registration", async () => {
    const userId = new mongoose.Types.ObjectId();
    const roleId = new mongoose.Types.ObjectId();

    UserModelMock.findOne.mockResolvedValue(null);

    roleModelMock.findOne.mockResolvedValue({
      _id: roleId,
      code: RoleCode.USER,
      status: true,
    });

    UserModelMock.create.mockResolvedValue({
      _id: userId,
      name: userPayload.name,
      email: userPayload.email,
      roles: [roleId],
    });

    KeyModel.create.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      client: userId,
      primaryKey: "primaryKey",
      secondaryKey: "secondaryKey",
    });

    const res = await request(app)
      .post(endpoint)
      .send(userPayload);

    expect(res.status).toBe(201);
    expect(res.headers["set-cookie"]).toBeDefined();

    const cookies: string[] = Array.isArray(res.headers["set-cookie"])
      ? res.headers["set-cookie"]
      : [];

    expect(
      cookies.some((cookie) => cookie.startsWith("accessToken="))
    ).toBe(true);

    expect(
      cookies.some((cookie) => cookie.startsWith("refreshToken="))
    ).toBe(true);
  });
   // 8. JWT payload verification
  it("should generate tokens with the correct payload", async () => {
    const userId = new mongoose.Types.ObjectId();
    const roleId = new mongoose.Types.ObjectId();

    UserModelMock.findOne.mockResolvedValue(null);

    roleModelMock.findOne.mockResolvedValue({
      _id: roleId,
      code: RoleCode.USER,
      status: true,
    });

    UserModelMock.create.mockResolvedValue({
      _id: userId,
      name: userPayload.name,
      email: userPayload.email,
      roles: [roleId],
    });

    KeyModel.create.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      client: userId,
      primaryKey: "primaryKey",
      secondaryKey: "secondaryKey",
    });

    const res = await request(app)
      .post(endpoint)
      .send(userPayload);

    expect(res.status).toBe(201);

    const cookies: string[] = Array.isArray(res.headers["set-cookie"])
      ? res.headers["set-cookie"]
      : [];

    const accessTokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );

    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.startsWith("refreshToken=")
    );

    expect(accessTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();

    const accessToken = String(accessTokenCookie)?.split(";")[0]?.split("=")[1];
     
      

    const refreshToken = String(refreshTokenCookie)?.split(";")[0]?.split("=")[1];
     
      

    const decodedAccessToken: any = await JWT.decode(String(accessToken));
    const decodedRefreshToken: any = await JWT.decode(String(refreshToken));

    expect(decodedAccessToken.sub).toBe(userId.toString());
    expect(decodedAccessToken.iss).toBe(tokenInfo.token_issuer);
    expect(decodedAccessToken.aud).toBe(tokenInfo.token_audience);

    expect(decodedRefreshToken.sub).toBe(userId.toString());
    expect(decodedRefreshToken.iss).toBe(tokenInfo.token_issuer);
    expect(decodedRefreshToken.aud).toBe(tokenInfo.token_audience);
});
})