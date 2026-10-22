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
import role from "../middleware/role.js"
import { RoleCode } from "../models/rolemodel.js"
import authorization from "../auth/authorization.js"

const router:Router = express.Router()
router.use(apiKey);
router.use(permission1(Permissions.GENERAL))
router.use(authMiddleware)
router.route("/").post(role(RoleCode.USER),authorization , createTodo).get(role(RoleCode.USER) , authorization, getTodos)
router.route("/:id").put( editTodo).delete( deleteTodo)

export default router
