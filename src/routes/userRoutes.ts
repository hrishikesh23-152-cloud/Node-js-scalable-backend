import express from "express"
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userController.js"
import { validateRequest, ValidSource } from "../middleware/Validator.js"
import { userLoginSchema, userRegisterSchema } from "../validation/userSchema.js"

const router:any = express.Router()

router.route("/login").post(validateRequest(userLoginSchema,ValidSource.BODY) , loginUser)
router.route("/register").post( validateRequest(userRegisterSchema,ValidSource.BODY) , registerUser)
router.route("/logout").get(logoutUser)

export default router;