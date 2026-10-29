import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { describe, expect, it } from "vitest";
import authMiddleware from "../../src/auth/authentication.js";
import { ApiError } from "../../src/core/ApiError.js";

const createApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(authMiddleware);
  app.get("/protected", (_req, res) => res.status(200).json({ protected: true }));
  app.use((error: ApiError, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(error.statusCode).json({ message: error.message });
  });
  return app;
};

describe("authentication middleware", () => {
  it("rejects requests without an access token", async () => {
    const response = await request(createApp()).get("/protected").expect(401);

    expect(response.body.message).toContain("Access token is missing");
  });

  it("rejects an invalid access token", async () => {
    const response = await request(createApp())
      .get("/protected")
      .set("Cookie", "accessToken=invalid")
      .expect(401);

    expect(response.body.message).toBe("Invalid access token");
  });
});
