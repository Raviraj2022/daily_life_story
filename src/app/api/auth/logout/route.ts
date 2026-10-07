import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);

    return NextResponse.json(
      {
        error: "Failed to logout",
      },
      {
        status: 500,
      }
    );
  }
}