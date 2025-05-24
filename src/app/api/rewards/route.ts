import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Define validation schema for reward creation
const rewardSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pointsCost: z.number().min(1, "Points cost must be at least 1"),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
});

// GET handler for fetching rewards
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const available = searchParams.get("available");
    
    // Build query filters
    const filters: any = {};
    
    if (available === "true") {
      filters.isAvailable = true;
    } else if (available === "false") {
      filters.isAvailable = false;
    }

    // Get rewards
    const rewards = await prisma.reward.findMany({
      where: filters,
      orderBy: {
        pointsCost: "asc",
      },
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching rewards" },
      { status: 500 }
    );
  }
}

// POST handler for creating a reward (admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a reward" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can create rewards" },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // Validate request body
    const result = rewardSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { name, description, pointsCost, imageUrl, isAvailable = true } = body;

    // Create reward
    const reward = await prisma.reward.create({
      data: {
        name,
        description,
        pointsCost,
        imageUrl,
        isAvailable,
      },
    });

    return NextResponse.json(
      { message: "Reward created successfully", reward },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reward:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the reward" },
      { status: 500 }
    );
  }
}
