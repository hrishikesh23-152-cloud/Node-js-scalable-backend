import mongoose, { Schema, type Document } from "mongoose";


export enum RoleCode {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export interface RoleDoc extends Document {
    _id: mongoose.Types.ObjectId;
    code: RoleCode;
    status: boolean;
}

const schema = new Schema<RoleDoc>({
    code:{
        type:String,
        required:true,
        unique:true,
        enum:Object.values(RoleCode)
    },
    status:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true,
})
schema.index({code:1,status:1})

const Role: mongoose.Model<RoleDoc> = mongoose.model<RoleDoc>("Role",schema)
export default Role