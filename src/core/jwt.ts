import pkg from 'jsonwebtoken';
const   { sign, decode: JwtDecode, verify  } = pkg;
import { BadTokenError, InternalError } from "./CustomError.js"
import { type SignOptions } from 'jsonwebtoken';
// import { resolve } from "node:dns"

export class JwtPayload {
    aud:string
    sub:string
    iss:string
    iat:number
    exp:number
    prm:string
    constructor(
        issuer:string,
        audience:string,
        subject:string,
        param:string,
        validity:number
    ){
        this.aud = audience
        this.sub = subject
        this.iss = issuer
        this.iat = Math.floor(Date.now()/1000)
        this.exp = this.iat + validity
        this.prm = param
    }
}

function encode(payload:JwtPayload,secret:string):Promise<string>{
    if(!secret){
        throw new InternalError("Secret key is missing")
    }
    const options:SignOptions = {
        algorithm:"HS256"
    }
    try {
        return new Promise((resolve,reject)=>{
            sign({...payload},secret,options,(err,token)=>{
                if(err){
                    return reject(new InternalError("Token generation failed"))
                }
                resolve(token as string)
            })
        })
    } catch (error) {
        throw new InternalError("Token generation failed")
    }
}

async function decode(token:string):Promise<JwtPayload>{
    if(!token){
        throw new InternalError("Token decoding failure");
    }
    try {
        const payload = await JwtDecode(token)
        if(!payload || typeof payload ==='string'){
            throw new BadTokenError()
        }
        return payload as JwtPayload
    } catch (error) {
        throw new BadTokenError()
    }
}
async function validate(token:string,secret:string):Promise<JwtPayload>{
    if(!token){
        throw new InternalError("Token validation failure")
    }
    try {
        return new Promise((resolve,reject)=>{
           
            verify(token,secret,(error,decoded)=>{
                if(error){
                    if(error.name==="TokenExpiredError"){
                    return reject(new BadTokenError("Token expired"))
                    }
                    return reject(new BadTokenError(error.message))
                }
                
                resolve(decoded as JwtPayload)
            })
        })
    } catch (error) {
        throw new InternalError('Token validation failure')
    }
}
export default {
  encode,
  decode,
  validate,
}