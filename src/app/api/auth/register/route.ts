import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { NextResponse } from "next/server";



export  async function POST(request: Request) {
    try {
        const body = await request.json();
        //  console.log(body);
        const {email, password} = body;
       

        if(!email || !password){
            return NextResponse.json({
                error: "Email and Pasword are required"
            },
        {
            status: 500
        });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if(password.length < 6){
            return NextResponse.json({
                error : "Password must be at least 6 char"
            },
        {
            status: 400
        });
        }

        const existingUser = await prisma.user.findUnique({
                  where : {
                    email: normalizedEmail
                  },
        });
        if(existingUser){
            return NextResponse.json({
                error: "User already exist"
            },
        {
            status: 409
        });
        }

        const hashedPassword = await hashPassword(password)
        const user = await prisma.user.create({
            data:{
                email: normalizedEmail,
                password: hashedPassword,
            }
        });

        return NextResponse.json({
            message: "User registred succussfully",
            user:{
                id: user.id,
                email: user.email,
            },
        },
        {
            status: 201
        }
    );
    } catch (error) {
         console.error("POST /api/auth/register error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while registering",
      },
      {
        status: 500,
      }
    );
    }
}