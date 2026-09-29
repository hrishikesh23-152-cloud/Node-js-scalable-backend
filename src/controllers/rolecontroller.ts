import type { Types } from "mongoose";
import type { RoleCode } from "../models/rolemodel.js";
import Role from "../models/rolemodel.js";
import { InternalError } from "../core/CustomError.js";


export async function getRole(role:RoleCode):Promise<Types.ObjectId | null>{
    try {
        const userRole = await Role.findOne({
            code:role,
            status:true
        })
        if(!userRole){
            throw new InternalError("Role doesn't exists")
        }
        console.log(userRole)
        return userRole._id
    } catch (error) {
        throw new InternalError("Role doesn't exists")
    }
}