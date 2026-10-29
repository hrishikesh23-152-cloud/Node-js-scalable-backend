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

function validate(token: string, secret: string): Promise<JwtPayload> {
  if (!token || !secret) {
    return Promise.reject(
      new InternalError("Token or secret is missing")
    );
  }

  return new Promise((resolve, reject) => {
    verify(
      token,
      secret,
      { algorithms: ["HS256"] },
      (error, decoded) => {
        if (error) {
          return reject(
            new BadTokenError(
              error.name === "TokenExpiredError"
                ? "Token expired"
                : "Invalid token"
            )
          );
        }

        if (!decoded || typeof decoded === "string") {
          return reject(new BadTokenError("Invalid token payload"));
        }

        resolve(decoded as JwtPayload);
      }
    );
  });
}

export default {
  encode,
  decode,
  validate,
}