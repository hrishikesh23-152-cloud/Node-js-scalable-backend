import { KeyModel } from "../models/KeyStoremodel.js";
import type { UserDoc } from "../models/userModel.js";

export async function create(
    client:UserDoc,
    primaryKey:string,
    secondaryKey:string
){
    const key = await KeyModel.create({
        client,
        primaryKey,
        secondaryKey
    })
    return key
}

