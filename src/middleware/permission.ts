import type { NextFunction, RequestHandler,Response } from "express";
import type { Permissions } from "../models/ApiKeymode.js";
import type { APIRequest } from "../types/apiReq.js";
import { ForbiddenError } from "../core/CustomError.js";


export function permission1(permission:Permissions):RequestHandler{
    return (req:APIRequest,res:Response,next:NextFunction)=>{
        try {
            if(!req.apiKey?.permission){
                return next(new ForbiddenError("Permission denied"))
            }
            const exists = req.apiKey.permission.includes(permission as Permissions)
            if(!exists){
                return next(new ForbiddenError("Permission denied"))
            }
            return next();
        } catch (error) {
            next(error)
        }
    }
}