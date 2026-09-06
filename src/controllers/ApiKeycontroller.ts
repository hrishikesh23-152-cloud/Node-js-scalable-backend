import {ApiKeyModel} from '../models/ApiKeymode.js';
import type {ApiKeyDoc} from "../models/ApiKeymode.js"
export async function FindApiByKey(key:string):Promise<ApiKeyDoc | null>{
    return ApiKeyModel.findOne({key,status:true})
}

