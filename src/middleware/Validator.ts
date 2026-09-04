import type { Request,Response,NextFunction } from "express";
import { ZodError } from "zod/v3";
import { ZodSchema } from "zod/v3";
import { BadRequestError } from "../core/CustomError.js";

export enum ValidSource {
    BODY = 'body',
    QUERY = 'query',
    HEADER = 'header',
    PARAMS = 'params'
}

export const validateRequest = (schema:ZodSchema,source:ValidSource = ValidSource.BODY) => {
    return (req:Request,_res:Response,next:NextFunction)=>{
        try {
            const data = schema.parse(req[source])
            Object.assign(req[source],data);
            next();
        } catch (error) {
            if(error instanceof ZodError){
                const message = error.errors.map((m)=>m.message).join(", ");
                return next(new BadRequestError(message))
            }
            next(error)
        }
    }
}