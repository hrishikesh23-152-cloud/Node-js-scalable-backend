import  { type NextFunction ,type RequestHandler,type Request} from "express";
import type { RoleCode } from "../models/rolemodel.js";
import type { RoleRequest } from "../types/apiReq.js";


export default  (...roleCodes:RoleCode[]):any=>
    (req:Request,_res:Response,next:NextFunction)=>{
        const roleReq = req as RoleRequest;
        roleReq.presentRoleCodes = roleCodes;
        console.log("role")
      return  next()
    }
