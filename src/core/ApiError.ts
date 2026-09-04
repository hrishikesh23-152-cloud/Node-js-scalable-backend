import type { Response } from "express"
export enum ErrorTypes {
    BAD_REQUEST = 'BadRequest',
    NOT_FOUND = 'NotFound',
    UAUTHORIZED = 'Unauthorized',
    FORBIDDEN = 'Forbidden',
    INTERNAL = 'Internal',
    TOKEN_EXPIRED = 'TokenExpired',
    BAD_TOKEN = 'BadToken',
    ACCESS_TOKEN_ERROR = 'AccessTokenError'
}

export class ApiError extends Error {
    type:ErrorTypes
    statusCode:number
    constructor( type:ErrorTypes,  statusCode:number,message:string){
        super(message)
        this.type = type
        this.statusCode = statusCode
        Object.setPrototypeOf(this,new.target.prototype)
        Error.captureStackTrace(this,this.constructor)
    }
    static handleError(err:ApiError,res:Response){
        return res.status(err.statusCode || 500).
        json({
            type:err.type || ErrorTypes.INTERNAL,
            message:err.message || "internal server error"
        })
    }
}