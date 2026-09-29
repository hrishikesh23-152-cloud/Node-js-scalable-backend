import express, { type NextFunction } from 'express';
import { ZodSchema } from 'zod/v3';
import Schema from './schema.js'
import {ValidSource,validateRequest} from '../middleware/Validator.js';
import { getAccessToken, validateTokenData } from './utils.js';
import type { PublicRequest } from '../types/apiReq.js';
import jwt from '../core/jwt.js';
import {tokenInfo} from  '../config.js'
import User, { type UserDoc } from '../models/userModel.js';
import { Types } from 'mongoose';
import { BadRequestError,ToeknExpiredError } from '../core/CustomError.js';
import { KeyModel } from '../models/KeyStoremodel.js';

const router:any = express.Router();

// ... imports
export default router.use(async (req: PublicRequest, _res: Response, next: NextFunction) => {
    try {
        req.accessToken = String(req.cookies.accessToken);
        const payload = await jwt.validate(req.accessToken, tokenInfo.token_secret);
        validateTokenData(payload);

        const user: any = await User.findById(new Types.ObjectId(payload.sub));
        if (!user) {
            throw new BadRequestError("User doesn't exist");
        }
        req.user = user;

        // Use findOne instead of find
        const keyStore = await KeyModel.findOne({
            client: req.user._id,
            primaryKey: payload.prm,
            status: true 
        });
        
        if (!keyStore) {
            throw new BadRequestError("Invalid or wrong access token");
        }
        
        return next();
    } catch (error) {
        // Pass through custom operational errors, otherwise handle token issues
        if (error instanceof BadRequestError) {
            throw error;
        }
        throw new ToeknExpiredError(); // Adjust to your actual class name spelling
    }
});

