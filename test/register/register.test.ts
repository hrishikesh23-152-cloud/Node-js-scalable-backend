
import {
    it,
    describe,
    expect,
    beforeAll,
    afterAll,
} from "vitest";
import decode from "../../src/core/jwt.js"
import { app } from "../../src/server.js";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Role, { RoleCode } from "../../src/models/rolemodel.js";
import { getRole } from "../../src/controllers/rolecontroller.js";
import JWT from "jsonwebtoken";
import { tokenInfo } from "../../src/config.js";

let mongo: MongoMemoryServer;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();

    const mongoUri = mongo.getUri();
    await mongoose.connect(mongoUri);

    await Role.create({
        code: "USER",
        status: true,
    });
});

afterAll(async () => {
    await mongoose.connection.close();

    if (mongo) {
        await mongo.stop();
    }
});

describe("Tests the register functionality", () => {
    const endpoint = "/api/users/register";

    it("rejects unauthenticated requests to the todo endpoint", async () => {
        await request(app)
            .get("/api/todo")
            .expect(401);
    });

    it("rejects unauthenticated requests to the logout endpoint", async () => {
        await request(app)
            .get("/api/users/logout")
            .expect(401);
    });

    const userPayload = {
        name: "john",
        email: "john@gmail.com",
        password: "john2027",
    };

    it("should register a user", async () => {
        const role = await getRole(RoleCode.USER);

        const res = await request(app)
            .post(endpoint)
            .send({
                ...userPayload,
                roles: [role],
            })
            .expect(201);

        expect(res.body).toMatchObject({
            name: "john",
            email: "john@gmail.com",
            roles: [String(role)],
        });

        expect(res.body._id).toBeDefined();
    });

    it("returns 400 with invalid email", async () => {
        await request(app)
            .post(endpoint)
            .send({
                name: "john",
                email: "vbghhd",
                password: "123456",
            })
            .expect(400);
    });

    it("returns 400 with missing email and password", async () => {
        await request(app)
            .post(endpoint)
            .send({})
            .expect(400);
    });

    it("disallows duplicate emails", async () => {
        await request(app)
            .post(endpoint)
            .send({
                name: "abc",
                email: "abc@gmail.com",
                password: "abc2027",
            })
            .expect(201);

        await request(app)
            .post(endpoint)
            .send({
                name: "xyz",
                email: "abc@gmail.com",
                password: "abc2027",
            })
            .expect(400);
    });

    it("should set accessToken and refreshToken cookies on successful registration", async () => {
        const res = await request(app)
            .post(endpoint)
            .send({
                name: "cookieuser",
                email: "cookieuser@gmail.com",
                password: "cookie2027",
            })
            .expect(201);
        expect(res.headers["set-cookie"]).toBeDefined();

        const cookies: string[] = Array.isArray(
            res.headers["set-cookie"]
        )
            ? res.headers["set-cookie"]
            : [];

        expect(
            cookies.some((cookie: string) =>
                cookie.startsWith("accessToken=")
            )
        ).toBe(true);

        expect(
            cookies.some((cookie: string) =>
                cookie.startsWith("refreshToken=")
            )
        ).toBe(true);
    });

    it("should generate tokens with the correct payload", async () => {
        const res = await request(app)
            .post(endpoint)
            .send({
                name: "tokenuser",
                email: "tokenuser@gmail.com",
                password: "token2027",
            })
            .expect(201);

        const cookies: string[] = Array.isArray(
            res.headers["set-cookie"]
        )
            ? res.headers["set-cookie"]
            : [];

        const accessTokenCookie = String(cookies.find(
            (cookie: string) =>
                cookie.startsWith("accessToken=")
        ));

        const refreshTokenCookie = String(cookies.find(
            (cookie: string) =>
                cookie.startsWith("refreshToken=")
        ));

        expect(accessTokenCookie).toBeDefined();
        expect(refreshTokenCookie).toBeDefined();

        const accessToken = String(accessTokenCookie)?.split(";")[0]?.split("=")[1];
        // .split(";")[0]
        // .split("=")[1];

        const refreshToken = String(refreshTokenCookie)?.split(";")[0]?.split("=")[1];
        // .split(";")[0]
        // .split("=")[1];

        const decodedAccessToken = await JWT.decode(String(accessToken));
        const decodedRefreshToken = await JWT.decode(String(refreshToken));

        expect(decodedAccessToken).toBeDefined();
        expect(decodedAccessToken).not.toBeNull();

        expect(decodedRefreshToken).toBeDefined();
        expect(decodedRefreshToken).not.toBeNull();

        expect(
            (decodedAccessToken as JWT.JwtPayload).sub
        ).toBeDefined();

        expect(
            (decodedAccessToken as JWT.JwtPayload).iss
        ).toBe(tokenInfo.token_issuer);

        expect(
            (decodedAccessToken as JWT.JwtPayload).aud
        ).toBe(tokenInfo.token_audience);

        expect(
            (decodedRefreshToken as JWT.JwtPayload).sub
        ).toBeDefined();

        expect(
            (decodedRefreshToken as JWT.JwtPayload).iss
        ).toBe(tokenInfo.token_issuer);

        expect(
            (decodedRefreshToken as JWT.JwtPayload).aud
        ).toBe(tokenInfo.token_audience);
    });
});
