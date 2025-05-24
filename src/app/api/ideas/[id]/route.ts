import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Define validation schema for idea updates
const ideaUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  problem: z.string().min(10, "Problem statement must be at least 10 characters").optional(),
  solution: z.string().min(10, "Solution must be at least 10 characters").optional(),
  targetAudience: z.string().optional(),
  marketSize: z.string().optional(),
  competition: z.string().optional(),
  businessModel: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "FEATURED", "ARCHIVED"]).optional(),
  tags: z.array(z.string()).optional(),
  mediaUrls: z.string().optional(),
});

// GET handler for fetching a specific idea
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Get idea with related data
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
        feedbacks: {
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
        },
        aiSummary: true,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.idea.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(idea);
  } catch (error) {
    console.error("Error fetching idea:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the idea" },
      { status: 500 }
    );
  }
}

// PATCH handler for updating an idea
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to update an idea" },
        { status: 401 }
      );
    }

    const id = params.id;
    const body = await req.json();
    
    // Validate request body
    const result = ideaUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }

    // Get the idea to check ownership
    const existingIdea = await prisma.idea.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingIdea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner or an admin
    if (existingIdea.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to update this idea" },
        { status: 403 }
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
      status,
      tags,
      mediaUrls 
    } = body;

    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (problem !== undefined) updateData.problem = problem;
    if (solution !== undefined) updateData.solution = solution;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (marketSize !== undefined) updateData.marketSize = marketSize;
    if (competition !== undefined) updateData.competition = competition;
    if (businessModel !== undefined) updateData.businessModel = businessModel;
    if (status !== undefined) updateData.status = status;
    if (mediaUrls !== undefined) updateData.mediaUrls = mediaUrls;

    // Handle tags update if provided
    let tagsUpdate = {};
    if (tags) {
      // First disconnect all existing tags
      await prisma.idea.update({
        where: { id },
        data: {
          tags: {
            set: [],
          },
        },
      });
      
      // Then connect or create new tags
      tagsUpdate = {
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      };
    }

    // Update the idea
    const updatedIdea = await prisma.idea.update({
      where: { id },
      data: {
        ...updateData,
        ...tagsUpdate,
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

    return NextResponse.json({
      message: "Idea updated successfully",
      idea: updatedIdea,
    });
  } catch (error) {
    console.error("Error updating idea:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the idea" },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting an idea
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete an idea" },
        { status: 401 }
      );
    }

    const id = params.id;

    // Get the idea to check ownership
    const existingIdea = await prisma.idea.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingIdea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner or an admin
    if (existingIdea.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to delete this idea" },
        { status: 403 }
      );
    }

    // Delete the idea
    await prisma.idea.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Idea deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting idea:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the idea" },
      { status: 500 }
    );
  }
}
