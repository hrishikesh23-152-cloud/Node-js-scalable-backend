import express, {type Router} from "express"
import {
  createTodo,
  getTodos,
  editTodo,
  deleteTodo,
} from "../controllers/todoController.js"
// import {protect}  from "../middleware/authMiddleware.js"
import apiKey from "../auth/apiKey.js"
import authMiddleware from "../auth/authentication.js"
import { Permissions } from "../models/ApiKeymode.js"
import { permission1 } from "../middleware/permission.js"


const router:Router = express.Router()
router.use(apiKey);
router.use(permission1(Permissions.GENERAL))
router.route("/").post(authMiddleware, createTodo).get(authMiddleware, getTodos)
router.route("/:id").put(authMiddleware, editTodo).delete(authMiddleware, deleteTodo)

export default router
