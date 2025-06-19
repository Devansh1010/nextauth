import { error } from "console";
import { channel } from "diagnostics_channel";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
    throw new Error("Mongo Uri not available in env file")
}

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    }
}

export async function dbConnect() {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise =
            mongoose
                .connect(MONGODB_URI)
                .then(() => mongoose.connection)
    }

    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise = null
        throw error
    }

    return cached.conn

}