import express from "express"
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userController.js"

const router:any = express.Router()

router.route("/login").post(loginUser)
router.route("/register").post(registerUser)
router.route("/logout").get(logoutUser)

export default router;