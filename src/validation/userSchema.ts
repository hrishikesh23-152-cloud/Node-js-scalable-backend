import { z } from 'zod/v3';
import { RoleCode } from '../models/rolemodel.js';

export const userLoginSchema = z.object({
    email:z.string().email({
        message:"Invalid email"
    }),
    password:z.string().min(6 , 'Password must be at least 6 characters')
})
export const userRegisterSchema = z.object({
    name:z.string().min(3, "Name must be at least 3 characters"),
    email:z.string().email({
        message:"Invalid email"
    }),
    password:z.string().min(6 , 'Password must be at least 6 characters'),
    role: z.nativeEnum(RoleCode).optional(),
    roles: z.array(z.any()).optional()
})

export const RefreshTokenSchema = z.object({
    refreshToken:z.string()
})