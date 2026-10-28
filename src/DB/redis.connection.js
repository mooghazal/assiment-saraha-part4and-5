import { createClient } from "redis"
import { REDIS_URI } from "../config.js"
export const client = createClient({
  url:REDIS_URI
});
export async function connectRedis(){
    try{
        await client.connect()
        console.log("Redis connected successfully")
    }catch(error){
        console.log("Error connecting to Redis:", error)
    }
}
