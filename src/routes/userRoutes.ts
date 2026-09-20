import express from "express"
import {
  getAllUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/userController.js"
import { validateRequest, ValidSource } from "../middleware/Validator.js"
import { RefreshTokenSchema, userLoginSchema, userRegisterSchema } from "../validation/userSchema.js"

const router:any = express.Router()

router.route('/datas').get(getAllUser)
router.route("/login").post(validateRequest(userLoginSchema,ValidSource.BODY) , loginUser)
router.route("/register").post( validateRequest(userRegisterSchema,ValidSource.BODY) , registerUser)
router.route("/logout").get(logoutUser)
router.route("/refresh").post(validateRequest(RefreshTokenSchema,ValidSource.BODY),refreshAccessToken)

export default router;
