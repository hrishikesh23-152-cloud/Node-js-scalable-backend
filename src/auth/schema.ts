import {z} from 'zod/v3'
import { Header } from './utils.js'

export const ZodAuthBearer = z.string().refine(value=>value.startsWith("Bearer"),{
        message:"Authorization Header must starts with Bearer"
})
.refine(value=>value.split(" ")[1],{
        message:"Authorization Header must contain a token"
})

export default {
        apiKey:z.object({
          [Header.API_KEY]:z.string().nonempty('api_key nust not be empty')
       }),
       auth:z.object({
        authorization:ZodAuthBearer
       })
}
