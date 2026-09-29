import type {Request} from "express";
import { ApiKeyDoc } from "../models/ApiKeymode.ts";
import type KeyStoreDoc from "../models/KeyStoremodel.ts";
import type { UserDoc } from "../models/userModel.ts";
import type { RoleCode } from "../models/rolemodel.ts";

export declare interface APIRequest extends Request{
    apiKey?:ApiKeyDoc | null
}
export declare interface PublicRequest extends Request{
    user:UserDoc;
    accessToken?:string;
    keystore:KeyStoreDoc;
}

declare interface RoleRequest extends PublicRequest{
    presentRoleCodes:RoleCode[]
}