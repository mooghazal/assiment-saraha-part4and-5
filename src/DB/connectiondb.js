

import mongoose from "mongoose";
import { DB_URI } from "../config.js";
import { connectRedis } from "./redis.connection.js";
export const bootstarpDB=async (app,port) => {
    try{
        await mongoose.connect(DB_URI )
        console.log('Database connected successfully')
        await connectRedis()
        app.listen(port, () => {
            console.log(`Server is running on port ${port}...`)
        })
    }
    catch (error) {
        console.log(error)
        console.log('Database connection failed')
    }
}

