import { Types } from "mongoose"
import { tokenInfo } from "../config.js"
import { BadRequestError, InternalError } from "../core/CustomError.js"
import JWT, { JwtPayload} from "../core/jwt.js"
import type { UserDoc } from "../models/userModel.js"

export enum Header {
  API_KEY = "x-api-key",
}

export async function createTokens(
  user: UserDoc,
  accessTokenKey: string,
  refreshTokenKey: string
) {
  const accessToken = await JWT.encode(
    new JwtPayload(
      tokenInfo.token_issuer,
      tokenInfo.token_audience,
      user._id.toString(),
      accessTokenKey,
      tokenInfo.access_token_validity
    ),
    tokenInfo.token_secret
  )

  if (!accessToken) throw new InternalError()

  const refreshToken = await JWT.encode(
    new JwtPayload(
      tokenInfo.token_issuer,
      tokenInfo.token_audience,
      user._id.toString(),
      refreshTokenKey,
      tokenInfo.refresh_token_validity
    ),
    tokenInfo.token_secret
  )

  if (!refreshToken) throw new InternalError()

  return { accessToken, refreshToken }
}

export const getAccessToken = (authorization?: string):string => {
  if (!authorization) throw new BadRequestError("Invalid Authorization")
  if (!authorization.startsWith("Bearer")){
    throw new BadRequestError("Invalid Authorization")
  }
  
  return String(authorization.split(" ")[1]) 
}


export const validateTokenData = (payload: JwtPayload): boolean => {
  if (
    !payload ||
    typeof payload.iss !== "string" ||
    typeof payload.aud !== "string" ||
    typeof payload.sub !== "string" ||
    typeof payload.prm !== "string" ||
    payload.iss !== tokenInfo.token_issuer ||
    payload.aud !== tokenInfo.token_audience ||
    !Types.ObjectId.isValid(payload.sub)
  ) {
    throw new BadRequestError("Invalid token claims");
  }

  return true;
};
