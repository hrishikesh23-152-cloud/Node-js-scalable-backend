import type {Request} from "express";
import { ApiKeyDoc } from "../models/ApiKeymode.ts";

export declare interface APIRequest extends Request{
    apiKey?:ApiKeyDoc | null
}