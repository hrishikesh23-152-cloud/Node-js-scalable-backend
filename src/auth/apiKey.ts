import  express from 'express';
import type { Response,NextFunction, Router } from 'express';
import  { ValidSource ,validateRequest} from '../middleware/Validator.js';
import { ApiKeySchema } from './schema.js';
import { Header } from './utils.js';
import { ForbiddenError } from '../core/CustomError.js';
// import { ApiKeyModel } from '../models/ApiKeymode.js';
import { FindApiByKey } from '../controllers/ApiKeycontroller.js';
import type { APIRequest } from '../types/apiReq.js';
const router:Router = express.Router();

export default router.use(validateRequest(ApiKeySchema,ValidSource.HEADER),
 async (req:APIRequest,res:Response,next:NextFunction)=>{
    const key = req.headers[Header.API_KEY]?.toString();
    if(!key){
        next(new ForbiddenError())
    }
    const apiKey = await FindApiByKey(String(key));
    if(!apiKey){
        next(new ForbiddenError());
    }
    req.apiKey = apiKey;
    return next();
 }
);

