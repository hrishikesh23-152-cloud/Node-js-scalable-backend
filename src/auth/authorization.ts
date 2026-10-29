import type { RequestHandler } from "express";
import type { RoleRequest } from "../types/apiReq.js";
import { ForbiddenError } from "../core/CustomError.js";
import Role from '../models/rolemodel.js';
// import { any } from "zod";

const authorization: RequestHandler = async (req, _res, next) => {
  try {
    const roleReq = req as RoleRequest;
    if (!roleReq.user) {
      return next(new ForbiddenError("Permission denied"));
    }

    if (!roleReq.presentRoleCodes?.length) {
      return next(new ForbiddenError("Permission denied"));
    }

    // Find active roles matching presentRoleCodes
    let activeRoles = await Role.find({
      code: { $in: roleReq.presentRoleCodes },
      status: true,
    }).select("_id code");

    // If active roles don't exist in DB yet, auto-create them
    if (activeRoles.length === 0) {
      for (const code of roleReq.presentRoleCodes) {
        await Role.findOneAndUpdate(
          { code },
          { $setOnInsert: { code, status: true } },
          { upsert: true, new: true }
        );
      }
      const activeRoles: any = await Role.find({
        code: { $in: roleReq.presentRoleCodes },
        status: true,
      }).select("_id code");
    }

    const userRoles = roleReq.user.roles || [];
    const isAuthorized = userRoles.some((userRole: any) => {
      const userRoleId = userRole?._id ? userRole._id.toString() : userRole?.toString();
      const matchById = activeRoles.some((role) => role._id.toString() === userRoleId);
      const matchByCode =
        (typeof userRole === "string" && roleReq.presentRoleCodes.includes(userRole as any)) ||
        (userRole?.code && roleReq.presentRoleCodes.includes(userRole.code));
      return matchById || matchByCode;
    }) || ((roleReq.user as any).role && roleReq.presentRoleCodes.includes((roleReq.user as any).role));

    if (!isAuthorized) {
      return next(new ForbiddenError("Permission denied"));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default authorization;