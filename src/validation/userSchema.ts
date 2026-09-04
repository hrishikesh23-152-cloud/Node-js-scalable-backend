import { z } from 'zod/v3';

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
    password:z.string().min(6 , 'Password must be at least 6 characters')
})