import User from "../models/userModel.js"
import asyncHandler from "express-async-handler"
// import generateToken from "../utils/generateToken.js"
import type { ProtectedRequest } from "../types/types.js";
import type { Response,RequestHandler, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../core/CustomError.js";
import crypto from "crypto"
import { create } from "./Keystorecontroller.js";
import { createTokens, getAccessToken, validateTokenData } from "../auth/utils.js";
import { environment, tokenInfo } from "../config.js";
import type { PublicRequest } from "../types/apiReq.js";
import jwt from "../core/jwt.js";
import { validate } from "zod";
import { Types } from "mongoose";
import { KeyModel } from "../models/KeyStoremodel.js";
import { getRole } from "./rolecontroller.js";
import { RoleCode } from "../models/rolemodel.js";
const loginUser:RequestHandler = asyncHandler(async (req:ProtectedRequest, res:Response) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (user && (await user?.matchPassword(password))) {
    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex")
    await create(user,accessTokenKey,refreshTokenKey)
    const tokens = await createTokens(user,accessTokenKey,refreshTokenKey);

    res.cookie("accessToken",tokens.accessToken,{
      httpOnly:true,
      secure: environment === "production",
      sameSite:"strict",
      maxAge:24*60*60*1000 
    })
     res.cookie("refreshToken",tokens.refreshToken,{
      httpOnly:true,
      secure: environment === "production",
      sameSite:"strict",
      maxAge:30*24*60*60*1000 
    })
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    
    })
  } else {
    res.status(401)
    throw new BadRequestError(" Invalid email or password")
  }
})


const registerUser: RequestHandler = asyncHandler(async (req:ProtectedRequest, res:Response) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new BadRequestError("User already Exists");
    }

    const roleA = await getRole(RoleCode.USER);

    const user = await User.create({
        name,
        email,
        password,
        roles: [roleA],
    });

    if (!user) {
        res.status(400);
        throw new BadRequestError("Invalid User Credentials");
    }

    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");

    await create(user, accessTokenKey, refreshTokenKey);

    const tokens = await createTokens(
        user,
        accessTokenKey,
        refreshTokenKey
    );

    res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: environment === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: environment === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

     res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: [roleA],
    });
});


const getAllUser:RequestHandler = asyncHandler(async (req,res) => {

  const {page,limit} = req.query;
  let skip = (Number(page)-1)*Number(limit);
  const users = await User.find()
                .skip(skip)
                .limit(Number(limit))
  const total = await User.countDocuments();
  if(users){
     res.status(200)
    .json({
      Data:users,
      pageNo:page,
      remainingPages:Number(total/Number(limit))-Number(page),
      totalPages:Number(total/Number(limit))
    })
  }
  else{
    throw new NotFoundError("Users record not found")
  }
})

export const refreshAccessToken = async (req:PublicRequest,_res:Response,next:NextFunction)=>{
  req.accessToken =String(req.cookies.accessToken)

  const accesspayload = await jwt.decode(req.accessToken)
  validateTokenData(accesspayload);

  const user = await User.findOne(new Types.ObjectId(accesspayload.sub));
  if(!user){
    throw new BadRequestError("User not registered")
  }
  req.user = user ;
  const refreshTokenPayload = await jwt.validate(
    req.body.refreshToken , tokenInfo.token_secret
  );
  validateTokenData(refreshTokenPayload);
  if(accesspayload.sub !== refreshTokenPayload.sub){
    throw new BadRequestError("Invalid access token")
  }
  const KeyStore = await KeyModel.findOne({
    client:req.user,
    primaryKey:accesspayload.prm,
    secondaryKey:refreshTokenPayload.prm
  })

  if(!KeyStore){
    throw new BadRequestError("Invalid accessToken")
  }
  await KeyModel.deleteOne({
    client:req.user,
    primaryKey:accesspayload.prm,
    secondaryKey:refreshTokenPayload.prm
  })
   const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex")

     await create(user,accessTokenKey,refreshTokenKey)
    const tokens = await createTokens(user,accessTokenKey,refreshTokenKey);

    _res.cookie("accessToken",tokens.accessToken,{
      httpOnly:true,
      secure: environment === "production",
      sameSite:"strict",
      maxAge:24*60*60*1000 
    })
    return _res.status(200).json({
      mesage:"Access Token Refreshed"
    })
}
// const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body

//   const user = await User.findOne({ email })

//   if (!user) {
//     res.status(404)
//     throw new Error("User Not Found")
//   }

//   const resetToken = user.createPasswordResetToken()
//   user.save()

//   const resetUrl = `${req.protocol}://localhost:3000/reset-password/${resetToken}`

//   const message = `Forgot Password? Click on this this link to reset your Password: ${resetUrl}`

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "Your Password reset token. (valid for 10mins)",
//       message,
//     })

//     res.status(200).json({
//       message: "Token Sent to email!",
//     })
//   } catch (error) {
//     user.passwordResetToken = undefined
//     user.passwordResetExpires = undefined
//     user.save()
//     console.log(error)

//     res.status(500).json({
//       status: "error",
//       message:
//         "There was an error in sending the email. Please Try again later",
//     })
//   }
// })

// const resetPassword = asyncHandler(async (req, res) => {
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(req.params.resetToken)
//     .digest("hex")

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   })

//   if (!user) {
//     res.status(400).json({
//       status: "fail",
//       message: "Token is invalid or has expired",
//     })
//   }

//   user.password = req.body.password
//   user.passwordResetToken = undefined
//   user.passwordResetExpires = undefined
//   user.save()

//   generateToken(res, user._id)

//   res.json({
//     _id: user._id,
//     name: user.name,
//     email: user.email,
//     isAdmin: user.isAdmin,
//   })
// })

const logoutUser:RequestHandler = asyncHandler(async (req:ProtectedRequest, res:Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  })
  res.status(200).json({
    message: "Logged Out Successfully",
  })
})

export { loginUser, registerUser, logoutUser,getAllUser }
