import express, {type Router} from "express"
import {
  createTodo,
  getTodos,
  editTodo,
  deleteTodo,
} from "../controllers/todoController.js"
import {protect}  from "../middleware/authMiddleware.js"
import apiKey from "../auth/apiKey.js"

import { Permissions } from "../models/ApiKeymode.js"
import { permission1 } from "../middleware/permission.js"


const router:Router = express.Router()
router.use(apiKey);
router.use(permission1(Permissions.GENERAL))
router.route("/").post(protect, createTodo).get(protect, getTodos)
router.route("/:id").put(protect, editTodo).delete(protect, deleteTodo)

export default router
