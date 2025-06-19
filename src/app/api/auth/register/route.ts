import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import User from '@/models/User.model'

export async function POST(request: NextRequest) {

    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password reqired" },
                { status: 400 }
            )
        }

        await dbConnect()

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json(
                { error: "User Exist" },
                { status: 400 })
        }

        await User.create({
            email,
            password
        })

        return NextResponse.json(
            { error: "User Registed Successfully" },
            { status: 200 })

    } catch (error) {
        console.log("User registration failed")
        return NextResponse.json(
            { error: "User Registed Faild" },
            { status: 400 })
    }

}