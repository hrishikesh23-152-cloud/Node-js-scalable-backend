import dotenv from "dotenv"
// import { exitOnError } from "winston"

dotenv.config()

export const environment = process.env.NODE_ENV
export const port = process.env.PORT

export const db = {
  
  db_uri:process.env.DB_URI,
  // password: process.env.DB_USER_PWD || "",
  minPoolSize:parseInt(process.env.DB_MIN_POOL_SIZE ?? "5"),
  maxPoolSize:parseInt(process.env.DB_MAX_POOL_SIZE ?? "10")
}

export const tokenInfo = {
  token_secret:process.env.TOKEN_SECRET as string,
  token_issuer:process.env.TOKEN_ISSUER as string,
  token_audience:process.env.TOKEN_AUDIENCE as string,
  token_algorithm:process.env.TOKEN_ALGORITHM,
  access_token_validity:Number(process.env.ACCESS_TOKEN_VALIDITY_SEC) ?? 3600,
  refresh_token_validity:Number(process.env.REFRESH_TOKEN_VALIDITY_SEC) ?? 86400,
}

export const corsUrl = process.env.CORS_URL

export const redisConfig = {
  redis_host:process.env.REDIS_HOST,
  redis_port:Number(process.env.REDIS_PORT),
  redis_password:process.env.REDIS_PASSWORD
}
export const cacheConfig = {
  cache_ttl:process.env.CACHING_TTL
}