import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    
    try {
        const entries = await prisma.journalEntry.findMany({
            orderBy:{
                entryDate : "desc",
            }
        })
        return NextResponse.json(entries);
    } catch (error) {

        console.error("GET /api/journal error:", error);
        return NextResponse.json(
            {error: "Failed to fetch journal entries"},
            {status : 500}
        );
        
    }
}

export async function POST(request: Request) {
    
    try {
        const body = await request.json();
        const {title, content, entryDate, mood} = body;

        if(!content){
            return NextResponse.json(
                {
               error: "Content is required",
            },
            {status: 400}
        );
        }
        let user = await prisma.user.findFirst();
        if(!user){
            user = await prisma.user.create({
                data:{
                    email:"demo@gmail.com",
                }
            })
        }
        const entry = await prisma.journalEntry.create({
            data:{
                userId: user.id,
        title: title?.trim() || null,
        content: content.trim(),
        entryDate: entryDate
          ? new Date(entryDate)
          : new Date(),
        mood: mood || null,
            }
        });
        return NextResponse.json(
          entry, {status:201}
        );

    } catch (error) {
        console.error("POST /api/journal error:", error);

        return NextResponse.json(
            {error : "Failed to create journal entry"},
            {
                status: 500
            }
        )
    }
}