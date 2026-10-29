import type { ErrorRequestHandler, Request, Response, NextFunction } from "express"
import { NotFoundError } from "../core/CustomError.js"
import { ApiError } from "../core/ApiError.js"
import logger from "../core/logger.js"

const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err)
  }

  let statusCode = err instanceof ApiError
    ? err.statusCode
    : res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message
  if (err.name === "CastError") {
    message = "Resource Not Found"
    statusCode = 404
  }

  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.ip}`)

  return res.status(statusCode).json({
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  })
}

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Not Found: ${req.originalUrl}`)

  next(error)
}

export { errorHandler, notFound }
