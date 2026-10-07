import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(){
try {
    const user = await getCurrentUser();
    if(!user){
        return NextResponse.json({
            authenticated : false,
            user: null,
        },
    {
        status: 401,
    }
    );
    }
    return NextResponse.json({
        authenticated: true,
        user:{
            id: user.id,
            email: user.email,
        },
    });
} catch (error) {
     console.error("GET /api/auth/me error:", error);

    return NextResponse.json(
      {
        error: "Failed to get current user",
      },
      {
        status: 500,
      }
    );
}
}