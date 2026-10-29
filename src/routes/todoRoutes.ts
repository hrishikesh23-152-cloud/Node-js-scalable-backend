
import express, { type Router } from "express";
import {
  createTodo,
  getTodos,
  editTodo,
  deleteTodo,
} from "../controllers/todoController.js";
import authMiddleware from "../auth/authentication.js";
import role from "../middleware/role.js";
import { RoleCode } from "../models/rolemodel.js";
import authorization from "../auth/authorization.js";
import logger from "../core/logger.js";
import { notFound } from "../middleware/errorMiddleware.js";

const router: Router = express.Router();

// 1. Log incoming todo requests
router.use((req, _res, next) => {
  logger.info(`TODO ROUTER REACHED: ${req.method} ${req.originalUrl}`);
  next();
});

// 2. Authentication must run before all todo endpoints.
router.use(authMiddleware);

// 3. Authorization and controllers (both USER and ADMIN can manage todos).
router.route("/")
  .post(role(RoleCode.USER, RoleCode.ADMIN), authorization, createTodo)
  .get(role(RoleCode.USER, RoleCode.ADMIN), authorization, getTodos);

router.route("/:id")
  .put(role(RoleCode.USER, RoleCode.ADMIN), authorization, editTodo)
  .delete(role(RoleCode.USER, RoleCode.ADMIN), authorization, deleteTodo);

router.use(notFound)

export default router;
