import type {Request} from "express";
import User, { type UserDoc } from "../models/userModel.ts"
export declare interface ProtectedRequest extends Request{
    user?:UserDoc;
}