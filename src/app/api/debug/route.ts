import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        // Don't include password in the response
        password: false,
        createdAt: true,
        role: true,
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching debug data" },
      { status: 500 }
    );
  }
}
