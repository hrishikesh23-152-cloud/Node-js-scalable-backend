import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { RoleCode } from "../models/rolemodel.js";
import type { RoleRequest } from "../types/apiReq.js";

export default (...roleCodes: RoleCode[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const roleReq = req as RoleRequest;
    roleReq.presentRoleCodes = roleCodes;
    return next();
  };
