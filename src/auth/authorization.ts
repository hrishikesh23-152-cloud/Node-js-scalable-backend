import express, { type NextFunction,type Response } from 'express';
import type { RoleRequest } from '../types/apiReq.js';
import { BadRequestError, ForbiddenError } from '../core/CustomError.js';
import Role  from '../models/rolemodel.js';

const router:any = express.Router();

export default router.use(
    async (req:RoleRequest,_res:Response,next:NextFunction)=>{
        if(!req.user || !req.user.roles || !req.presentRoleCodes){
            return next(new ForbiddenError ("Permission Denied"))
        }
 
        const roles = await Role.find({
            code:{
                $in:req.presentRoleCodes,
               
            },
             status:true
        })
        console.log(roles)
        if(!roles.length){
            return next(new ForbiddenError("Permissiom denied"))
        }
        let authorized = false;
        for(const userRole of req.user.roles){
            // console.log(userRole)
            if(authorized){
                break;
            }
            for(const role of roles){
             
              if (role._id.equals(userRole)) {
                // console.log(userRole);
                authorized = true;
                break;
            }
            }
        }

        if(!authorized){
            return  next(new ForbiddenError("Permission denied"))
        }
        
        return next()
    }
)