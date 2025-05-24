import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Define validation schema for feedback
const feedbackSchema = z.object({
  content: z.string().min(10, "Feedback must be at least 10 characters"),
  rating: z.number().min(1).max(5),
  tags: z.string().optional(),
});

// POST handler for creating feedback
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to provide feedback" },
        { status: 401 }
      );
    }

    const ideaId = params.id;
    const body = await req.json();
    
    // Validate request body
    const result = feedbackSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { content, rating, tags } = body;

    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Check if user is trying to give feedback on their own idea
    if (idea.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot give feedback on your own idea" },
        { status: 403 }
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        content,
        rating,
        tags,
        idea: {
          connect: { id: ideaId },
        },
        user: {
          connect: { id: session.user.id },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Award points to the user for giving feedback
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        points: {
          increment: 5, // Award 5 points for giving feedback
        },
      },
    });

    return NextResponse.json(
      { message: "Feedback submitted successfully", feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "An error occurred while submitting feedback" },
      { status: 500 }
    );
  }
}

// GET handler for fetching feedback for an idea
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ideaId = params.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Get feedback with pagination
    const feedback = await prisma.feedback.findMany({
      where: {
        ideaId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalFeedback = await prisma.feedback.count({
      where: {
        ideaId,
      },
    });

    // Calculate average rating
    const averageRating = await prisma.feedback.aggregate({
      where: {
        ideaId,
      },
      _avg: {
        rating: true,
      },
    });

    return NextResponse.json({
      feedback,
      averageRating: averageRating._avg.rating || 0,
      pagination: {
        total: totalFeedback,
        pages: Math.ceil(totalFeedback / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching feedback" },
      { status: 500 }
    );
  }
}
