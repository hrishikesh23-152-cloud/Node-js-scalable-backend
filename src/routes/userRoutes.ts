import express, { type Router } from "express"
import {
  getAllUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/userController.js"
import { validateRequest, ValidSource } from "../middleware/Validator.js"
import { RefreshTokenSchema, userLoginSchema, userRegisterSchema } from "../validation/userSchema.js"
import role from "../middleware/role.js"
import { RoleCode } from "../models/rolemodel.js"
import authorization from "../auth/authorization.js"
import authMiddleware from "../auth/authentication.js"
import { notFound } from "../middleware/errorMiddleware.js"

const router: Router = express.Router()

// Public authentication routes
router.route("/login").post(validateRequest(userLoginSchema, ValidSource.BODY), loginUser)
router.route("/register").post(validateRequest(userRegisterSchema, ValidSource.BODY), registerUser)
router.route("/refresh").post(validateRequest(RefreshTokenSchema, ValidSource.BODY), refreshAccessToken)

// Protected routes require authentication
router.use(authMiddleware)

// Logout endpoint for authenticated users (supports both GET and POST)
router.route("/logout").get(logoutUser).post(logoutUser)

// Admin-only route to get all users
router.route("/datas").get(role(RoleCode.ADMIN), authorization, getAllUser)
// router.route("/all").get(role(RoleCode.ADMIN), authorization, getAllUser)
// router.route("/getalluser").get(role(RoleCode.ADMIN), authorization, getAllUser)
// router.route("/").get(role(RoleCode.ADMIN), authorization, getAllUser)
router.use(notFound)
export default router;
