import express , { type Express, type NextFunction} from "express"
import cors from "cors"
import type { Response,Request } from "express"
import "./database/index.js"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/userRoutes.js"
import { corsUrl, environment, port } from "./config.js"
import todoRoutes from "./routes/todoRoutes.js"
import { errorHandler, notFound } from "./middleware/errorMiddleware.js"
import logger from "./core/logger.js"
import { ApiError, ErrorTypes } from "./core/ApiError.js"
// import { InternalError } from "./core/CustomError.js"

const PORT = port ?? 4000

export const app:Express = express()

app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }))

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/users", userRoutes)
app.use("/api/todo", todoRoutes)
app.use(notFound)

// app.use(errorHandler)
app.use((err:Error,req:Request,_res:Response,next:NextFunction)=>{
  if(err instanceof ApiError){
    ApiError.handleError(err,_res)
    if (err.type === ErrorTypes.INTERNAL){
      logger.error(
        `500 -${err.message} - ${req.originalUrl} - ${req.ip}`
      )
    }
    else{
      logger.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.ip}`
      )
      logger.error(err.stack)
    }
    if(environment === 'development'){
       _res.status(500)
      .json({
        message:err.message,
        stack:err.stack
      })
    }
    // ApiError.handleError(new InternalError(),_res)
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  logger.info(`server is running on port ${PORT}`)
})
