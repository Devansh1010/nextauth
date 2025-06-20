import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import Video, { IVideo } from "@/models/Video.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect()

        const videos = await Video.find({}).sort({ createdAt: -1 }).lean()

        if (!videos || videos.length === 0) {
            return NextResponse.json(
                [],
                { status: 200 })
        }
        return NextResponse.json(videos)
    }
    catch (error) {
        return NextResponse.json({error: "Failed to fetch videos"})
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if(!session){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        await dbConnect()

        const body: IVideo = await request.json()

        if(!body.title || !body.videoUrl || !body.thumbnailUrl){
            return NextResponse.json({error: "Missing Required Field"})
        }

        const videodata ={
            ...body,
            controls: body?.controls ?? true, 
            transformation: {
                height:1920,
                widht:1080,
                quality: body.transformation?.quality ?? 100
            }
        }

       const newVideo = await Video.create(videodata)

       return NextResponse.json(newVideo)

    } catch (error) {
        return NextResponse.json({error: "Failed to create video"}, {status: 500})
    }
}

