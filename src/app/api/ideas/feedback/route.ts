import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for idea feedback
const feedbackSchema = z.object({
  ideaId: z.string(),
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
  action: z.enum(['like', 'pass', 'detailed']),
});

// Predefined feedback tags
const FEEDBACK_TAGS = [
  'Innovative',
  'Needs Improvement',
  'Market Potential',
  'Technical Feasibility',
  'Scalable',
  'User-Friendly',
  'Profitable',
  'Solves Real Problem',
  'Unique',
  'Competitive',
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);
    
    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: validatedData.ideaId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }
    
    // Prevent users from reviewing their own ideas
    if (idea.userId === userId) {
      return NextResponse.json(
        { error: 'You cannot provide feedback on your own idea' },
        { status: 400 }
      );
    }
    
    // Check if user has already provided feedback for this idea
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        ideaId: validatedData.ideaId,
        userId: userId,
      },
    });
    
    // Calculate points based on feedback type
    let pointsToAward = 0;
    
    if (validatedData.action === 'like') {
      pointsToAward = 10;
    } else if (validatedData.action === 'pass') {
      pointsToAward = 5;
    } else if (validatedData.action === 'detailed') {
      // Award more points for detailed feedback with rating and comments
      if (validatedData.rating && validatedData.comment) {
        pointsToAward = 20;
      } else if (validatedData.rating || validatedData.comment) {
        pointsToAward = 15;
      } else {
        pointsToAward = 10; // Basic detailed feedback without rating or comment
      }
    }
    
    // Validate tags if provided
    let processedTags = validatedData.tags;
    if (processedTags && processedTags.length > 0) {
      // Filter out any invalid tags
      processedTags = processedTags.filter(tag => 
        FEEDBACK_TAGS.includes(tag) || 
        tag.length >= 3 && tag.length <= 20
      );
    }
    
    // Create or update feedback using a transaction
    const result = await prisma.$transaction(async (prisma) => {
      let feedback;
      
      if (existingFeedback) {
        // Update existing feedback
        feedback = await prisma.feedback.update({
          where: { id: existingFeedback.id },
          data: {
            rating: validatedData.rating || null,
            content: validatedData.comment || null,
            comment: validatedData.comment || null,
            tags: processedTags ? processedTags.join(',') : null,
            action: validatedData.action,
            updatedAt: new Date(),
          },
        });
        
        // No points for updates
        pointsToAward = 0;
      } else {
        // Create new feedback
        feedback = await prisma.feedback.create({
          data: {
            ideaId: validatedData.ideaId,
            userId: userId,
            rating: validatedData.rating || null,
            content: validatedData.comment || null,
            comment: validatedData.comment || null,
            tags: processedTags ? processedTags.join(',') : null,
            action: validatedData.action,
          },
        });
        
        // Update user points and feedback count
        await prisma.user.update({
          where: { id: userId },
          data: {
            points: { increment: pointsToAward },
            feedbackCount: { increment: 1 },
            lastActive: new Date(),
          },
        });
        
        // Update idea metrics
        await prisma.idea.update({
          where: { id: validatedData.ideaId },
          data: {
            // Update upvotes or downvotes based on action
            ...(validatedData.action === 'like' ? { upvotes: { increment: 1 } } : {}),
            ...(validatedData.action === 'pass' ? { downvotes: { increment: 1 } } : {}),
            views: { increment: 1 },
          },
        });
        
        // Create notification for idea owner
        if (!idea.isAnonymous) {
          await prisma.notification.create({
            data: {
              userId: idea.userId,
              type: 'FEEDBACK',
              title: 'New Feedback Received',
              content: `Someone provided ${validatedData.action === 'detailed' ? 'detailed feedback' : 
                validatedData.action === 'like' ? 'a like' : 'feedback'} on your idea "${idea.title}".`,
              relatedId: idea.id,
              isRead: false,
            },
          });
        }
        
        // Create notification for the reviewer about points earned
        await prisma.notification.create({
          data: {
            userId: userId,
            type: 'SYSTEM',
            title: 'Points Earned',
            content: `You earned ${pointsToAward} points for providing feedback on "${idea.title}".`,
            relatedId: feedback.id,
            isRead: false,
          },
        });
      }
      
      return { feedback, pointsToAward };
    });
    
    return NextResponse.json({
      success: true,
      feedback: result.feedback,
      pointsAwarded: result.pointsToAward,
    });
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// Get all feedback for a specific idea
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get idea ID from URL
    const url = new URL(request.url);
    const ideaId = url.searchParams.get('ideaId');
    const userId = url.searchParams.get('userId'); // Optional filter by user
    const actionType = url.searchParams.get('action'); // Optional filter by action type
    
    if (!ideaId && !userId) {
      return NextResponse.json(
        { error: 'Either Idea ID or User ID is required' },
        { status: 400 }
      );
    }
    
    // Build query filters
    const filters: any = {};
    
    if (ideaId) {
      filters.ideaId = ideaId;
      
      // Check if idea exists when filtering by ideaId
      const idea = await prisma.idea.findUnique({
        where: { id: ideaId },
      });
      
      if (!idea) {
        return NextResponse.json(
          { error: 'Idea not found' },
          { status: 404 }
        );
      }
    }
    
    if (userId) {
      filters.userId = userId;
    }
    
    if (actionType && ['like', 'pass', 'detailed'].includes(actionType)) {
      filters.action = actionType;
    }
    
    // Get feedback based on filters
    const feedback = await prisma.feedback.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            points: true,
          },
        },
        idea: {
          select: {
            id: true,
            title: true,
            isAnonymous: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Process feedback to respect idea anonymity
    const processedFeedback = feedback.map(item => {
      if (item.idea.isAnonymous) {
        return {
          ...item,
          idea: {
            ...item.idea,
            user: {
              id: 'anonymous',
              name: 'Anonymous',
            },
          },
        };
      }
      return item;
    });
    
    // Get feedback statistics if filtering by ideaId
    let stats = null;
    if (ideaId) {
      const totalFeedback = await prisma.feedback.count({
        where: { ideaId },
      });
      
      const likesCount = await prisma.feedback.count({
        where: { ideaId, action: 'like' },
      });
      
      const passesCount = await prisma.feedback.count({
        where: { ideaId, action: 'pass' },
      });
      
      const detailedCount = await prisma.feedback.count({
        where: { ideaId, action: 'detailed' },
      });
      
      const avgRating = await prisma.feedback.aggregate({
        where: {
          ideaId,
          rating: { not: null },
        },
        _avg: {
          rating: true,
        },
      });
      
      stats = {
        total: totalFeedback,
        likes: likesCount,
        passes: passesCount,
        detailed: detailedCount,
        averageRating: avgRating._avg.rating || 0,
        likePercentage: totalFeedback > 0 ? (likesCount / totalFeedback) * 100 : 0,
      };
    }
    
    return NextResponse.json({ 
      feedback: processedFeedback,
      stats,
    });
    
  } catch (error) {
    console.error('Error fetching feedback:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
