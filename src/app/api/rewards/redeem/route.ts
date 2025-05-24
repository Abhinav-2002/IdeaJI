import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Define validation schema for reward redemption
const redeemSchema = z.object({
  rewardId: z.string(),
});

// POST handler for redeeming a reward
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to redeem a reward" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    
    // Validate request body
    const result = redeemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { rewardId } = body;

    // Get user and reward
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      );
    }

    // Check if reward is available
    if (!reward.isAvailable) {
      return NextResponse.json(
        { error: "This reward is not available for redemption" },
        { status: 400 }
      );
    }

    // Check if user has enough points
    if (user.points < reward.pointsCost) {
      return NextResponse.json(
        { error: "You don't have enough points to redeem this reward" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure both operations succeed or fail together
    const [updatedUser, redemption] = await prisma.$transaction([
      // Deduct points from user
      prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: reward.pointsCost,
          },
        },
      }),
      
      // Create redemption record
      prisma.redemption.create({
        data: {
          user: {
            connect: { id: userId },
          },
          reward: {
            connect: { id: rewardId },
          },
          pointsCost: reward.pointsCost, // Store the cost at time of redemption
        },
        include: {
          reward: true,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Reward redeemed successfully",
      redemption,
      remainingPoints: updatedUser.points,
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return NextResponse.json(
      { error: "An error occurred while redeeming the reward" },
      { status: 500 }
    );
  }
}

// GET handler for fetching user's redemption history
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view redemption history" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's redemption history
    const redemptions = await prisma.redemption.findMany({
      where: { userId },
      include: {
        reward: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(redemptions);
  } catch (error) {
    console.error("Error fetching redemption history:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching redemption history" },
      { status: 500 }
    );
  }
}
