import type {Request} from "express";
import User, { type UserDoc } from "../models/userModel.js"
export declare interface ProtectedRequest extends Request{
    user?:UserDoc;
}