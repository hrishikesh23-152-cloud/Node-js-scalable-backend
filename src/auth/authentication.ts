import express, { type NextFunction } from 'express';
import { ZodSchema } from 'zod/v3';
import Schema from './schema.js'
import {ValidSource,validateRequest} from '../middleware/Validator.js';
import { getAccessToken, validateTokenData } from './utils.js';
import type { PublicRequest } from '../types/apiReq.js';
import jwt from '../core/jwt.js';
import {tokenInfo} from  '../config.js'
import User from '../models/userModel.js';
import { Types } from 'mongoose';
import { BadRequestError,ToeknExpiredError } from '../core/CustomError.js';
import { KeyModel } from '../models/KeyStoremodel.js';

const router:any = express.Router();

export default router.use(
    
    validateRequest(Schema.auth,ValidSource.HEADER),
    async (req:PublicRequest,_res:Response,next:NextFunction)=>{
        
       
        try {
             req.accessToken = getAccessToken(req.headers.authorization);
            const payload = await jwt.validate(req.accessToken,tokenInfo.token_secret);
            validateTokenData(payload);
           

            const user = await User.findById(new Types.ObjectId(payload.sub));
            if(!user){
                throw new BadRequestError("User doesn't exists");
            }
            const keyStore = await KeyModel.find({
                client:req.user,
                primaryKey:payload.prm,
                status:true 
            })
            if(!keyStore){
                throw new BadRequestError("Invalid or wrong accesstoken")
            }
             next();
        } catch (error) {
            throw new ToeknExpiredError();
        }
    }
)

