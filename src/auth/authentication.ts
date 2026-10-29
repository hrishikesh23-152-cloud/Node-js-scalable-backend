
import type { RequestHandler } from "express";
import { Types } from "mongoose";
import { tokenInfo } from "../config.js";
import { UnauthorizedError } from "../core/CustomError.js";
import jwt from "../core/jwt.js";
import User from "../models/userModel.js";
import { KeyModel } from "../models/KeyStoremodel.js";
import type { PublicRequest } from "../types/apiReq.js";
import { validateTokenData } from "./utils.js";
import logger from "../core/logger.js";

const authMiddleware: RequestHandler = async (req, _res, next) => {
  const authReq = req as PublicRequest;

  console.log("[AUTH]", req.method, req.originalUrl);
  logger.info(`[AUTH] Middleware called for ${req.method} ${req.originalUrl}`);

  const authHeader = req.get("authorization")?.trim();
  let bearerToken: string | undefined;
  if (authHeader) {
    const match = /^Bearer\s+(\S+)$/i.exec(authHeader);
    if (match?.[1]) {
      bearerToken = match[1];
    } else if (!authHeader.includes(" ")) {
      bearerToken = authHeader;
    }
  }

  const accessToken = bearerToken ?? authReq.cookies?.accessToken;

  if (!accessToken) {
    logger.warn(`[AUTH] Missing access token for ${req.method} ${req.originalUrl}`);
    return next(
      new UnauthorizedError("Access token is missing")
    );
  }

  authReq.accessToken = accessToken;

  try {
    const payload = await jwt.validate(
      accessToken,
      tokenInfo.token_secret
    );

    validateTokenData(payload);

    if (!Types.ObjectId.isValid(payload.sub)) {
      return next(new UnauthorizedError("Invalid token subject"));
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return next(new UnauthorizedError("User doesn't exist"));
    }

    const keyStore = await KeyModel.findOne({
      client: user._id,
      primaryKey: payload.prm,
      status: true,
    });

    if (!keyStore) {
      return next(
        new UnauthorizedError("Invalid or revoked access token")
      );
    }

    authReq.user = user;
    (req as any).user = user;
    authReq.keystore = keyStore;

    return next();
  } catch (error) {
    console.error(
      "[AUTH FAILURE]",
      error instanceof Error ? error.message : error
    );

    if (error instanceof UnauthorizedError) {
      return next(error);
    }

    return next(new UnauthorizedError("Invalid access token"));
  }
};

export default authMiddleware;
