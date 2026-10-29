import express , { type Express } from "express"
import cors from "cors"
import "./database/index.js"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/userRoutes.js"
import { corsUrl, port } from "./config.js"
import todoRoutes from "./routes/todoRoutes.js"
import { errorHandler, notFound } from "./middleware/errorMiddleware.js"
import logger from "./core/logger.js"

const PORT = port ?? 4000

export const app:Express = express()
logger.info("SERVER FILE LOADED");
app.use(cors({ origin: corsUrl, credentials: true, optionsSuccessStatus: 200 }))

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/todo", todoRoutes);
app.use("/api/todos", todoRoutes);
app.use(notFound)
app.use(errorHandler)

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    logger.info(`server is running on port ${PORT}`)
  })
}
