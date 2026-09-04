import { ApiError,ErrorTypes } from "./ApiError.js";

export class BadRequestError extends ApiError {
    constructor(message:string = "Bad Request"){
        super(ErrorTypes.BAD_REQUEST,400,message);
    }
}
export class NotFoundError extends ApiError {
    constructor(message:string = "Not found"){
        super(ErrorTypes.NOT_FOUND,404,message);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message:string = "Unauthorized Request"){
        super(ErrorTypes.UAUTHORIZED,401,message);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message:string = "Forbidden Request"){
        super(ErrorTypes.FORBIDDEN,403,message);
    }
}

export class InternalError extends ApiError {
    constructor(message:string = "Internal server error"){
        super(ErrorTypes.INTERNAL,500,message);
    }
}
export class ToeknExpiredError extends ApiError {
    constructor(message:string = "Token expired"){
        super(ErrorTypes.TOKEN_EXPIRED,401,message);
    }
}
export class BadTokenError extends ApiError {
    constructor(message:string = "Wrong token"){
        super(ErrorTypes.BAD_TOKEN,401,message);
    }
}
export class AccessTokenErrorError extends ApiError {
    constructor(message:string = "Accesstoken error"){
        super(ErrorTypes.ACCESS_TOKEN_ERROR,401,message);
    }
}

