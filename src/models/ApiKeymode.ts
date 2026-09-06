import mongoose, { Schema,Document, Model } from "mongoose";


export enum Permissions {
    GENERAL = 'GENERAL'
}
export interface ApiKeyDoc extends Document {
    key : string,
    version : number,
    permission : Permissions[],
    status : boolean,

}

const schema = new Schema<ApiKeyDoc>({
    key:{
        type:String,
        required:true,
        unique:true,
        maxlength:128,
        trim:true
    },
    version:{
        type:Number,
        required:true,
        min:1,
        max:10
    },
    permission:{
        type:[{
            type:String,
            required:true,
            enum:Object.values(Permissions)
        }],
        required:true
    },
    status:{
        type:Boolean,
        required:true,
        default:true
    }
},{
    timestamps:true,
    versionKey:false
})

schema.index({key:1,status:1})

export const ApiKeyModel:Model<ApiKeyDoc> = mongoose.model<ApiKeyDoc>(" ApiKeyModel",schema)