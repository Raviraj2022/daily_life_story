import { createSession } from "@/lib/auth";
import { comparePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
// import { compare } from "bcryptjs";
import { error } from "console";
import { NextResponse } from "next/server";



export async function POST(request : Request) {
    try {
        
    const body = await request.json();
    const {email, password} = body;

    if(!email || !password){
        return NextResponse.json({
            error: "Email and Password are required"
        },
    {
        status: 500
    });
    }

    const normalizedEmail = email.trim().toLowerCase();


    const user = await prisma.user.findUnique({
        where:{
            email : normalizedEmail
        }
    });

    if(!user || !user.password){
        return NextResponse.json({
            error: "Innvalid email or password"
        }, {status: 401});
    }

    const passwordMatches = await comparePassword(password, user.password);
    if(!passwordMatches){
        return NextResponse.json({
            error: "Invalid password"
        }, {status: 401});
    }

    await createSession(user.id);

    
    return NextResponse.json({
        message:"Login Successfull",
        user:{
            id: user.id,
            email: user.email
        },
    },{status: 200});
    } catch (error) {
     
console.error("POST /api/auth/login error:", error);
return NextResponse.json(
      {
        error: "Something went wrong while logging in",
      },
      {
        status: 500,
      }
    );

}
}