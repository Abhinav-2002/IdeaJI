import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Define validation schema for idea creation
const ideaSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  problem: z.string().min(10, "Problem statement must be at least 10 characters"),
  solution: z.string().min(10, "Solution must be at least 10 characters"),
  targetAudience: z.string().optional(),
  marketSize: z.string().optional(),
  competition: z.string().optional(),
  businessModel: z.string().optional(),
  tags: z.array(z.string()).optional(),
  mediaUrls: z.string().optional(),
  audioUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  mediaType: z.enum(["TEXT", "AUDIO", "VIDEO", "MIXED"]).default("TEXT"),
  isAnonymous: z.boolean().default(false),
});

// GET handler for fetching ideas
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const mediaType = searchParams.get("mediaType");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build query filters
    const filters: any = {};
    
    if (status) {
      filters.status = status;
    } else {
      // By default, only show published ideas
      filters.status = "PUBLISHED";
    }

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { problem: { contains: search, mode: "insensitive" } },
        { solution: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by media type if specified
    if (mediaType) {
      filters.mediaType = mediaType;
    }

    // For tag filtering, we need to use a different approach
    let tagFilter = {};
    if (tag) {
      tagFilter = {
        tags: {
          some: {
            name: tag,
          },
        },
      };
    }

    // Get ideas with pagination
    const ideas = await prisma.idea.findMany({
      where: {
        ...filters,
        ...tagFilter,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
        _count: {
          select: {
            feedbacks: true,
          },
        },
        aiSummary: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalIdeas = await prisma.idea.count({
      where: {
        ...filters,
        ...tagFilter,
      },
    });

    // Process ideas to respect anonymity setting
    const processedIdeas = ideas.map(idea => {
      if (idea.isAnonymous) {
        return {
          ...idea,
          user: {
            id: "anonymous",
            name: "Anonymous",
            image: null,
          },
        };
      }
      return idea;
    });

    return NextResponse.json({
      ideas: processedIdeas,
      pagination: {
        total: totalIdeas,
        pages: Math.ceil(totalIdeas / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching ideas" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new idea
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to create an idea" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate request body
    const result = ideaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { 
      title, 
      description, 
      problem, 
      solution, 
      targetAudience, 
      marketSize, 
      competition, 
      businessModel, 
      tags = [], 
      mediaUrls,
      audioUrl,
      videoUrl,
      mediaType = "TEXT",
      isAnonymous = false
    } = body;

    // Determine the correct media type based on provided URLs
    let determinedMediaType = mediaType;
    if (audioUrl && !videoUrl) {
      determinedMediaType = "AUDIO";
    } else if (videoUrl && !audioUrl) {
      determinedMediaType = "VIDEO";
    } else if (audioUrl && videoUrl) {
      determinedMediaType = "MIXED";
    }

    // Create new idea with tags
    const idea = await prisma.$transaction(async (prisma) => {
      // Create the idea
      const newIdea = await prisma.idea.create({
        data: {
          title,
          description,
          problem,
          solution,
          targetAudience,
          marketSize,
          competition,
          businessModel,
          mediaUrls,
          audioUrl,
          videoUrl,
          mediaType: determinedMediaType,
          isAnonymous,
          status: "DRAFT", // Default to draft status
          user: {
            connect: { id: session.user.id },
          },
          tags: {
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
        include: {
          tags: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Update user's idea count and award points for idea submission
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ideasCount: { increment: 1 },
          points: { increment: 50 }, // Award 50 points for submitting an idea
          lastActive: new Date(),
        },
      });

      // Create a notification for the user
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "SYSTEM",
          title: "Idea Submitted Successfully",
          content: `Your idea "${title}" has been submitted successfully. You've earned 50 points!`,
          relatedId: newIdea.id,
        },
      });

      return newIdea;
    });

    return NextResponse.json(
      { 
        message: "Idea created successfully", 
        idea,
        pointsAwarded: 50
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating idea:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the idea" },
      { status: 500 }
    );
  }
}
