import {z} from 'zod/v3'
import { Header } from './utils.js'



export default {
        apiKey:z.object({
          [Header.API_KEY]:z.string().nonempty('api_key nust not be empty')
       }),
      
}
