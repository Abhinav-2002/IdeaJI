import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for marking notifications as read
const markReadSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

// GET handler for fetching user notifications
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
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const unreadOnly = searchParams.get('unread') === 'true';
    const skip = (page - 1) * limit;
    
    // Build query filters
    const filters: any = { userId };
    
    if (unreadOnly) {
      filters.isRead = false;
    }
    
    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where: filters,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
    
    // Get total count for pagination
    const totalNotifications = await prisma.notification.count({
      where: filters,
    });
    
    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    
    return NextResponse.json({
      notifications,
      pagination: {
        total: totalNotifications,
        pages: Math.ceil(totalNotifications / limit),
        page,
        limit,
      },
      unreadCount,
    });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST handler for marking notifications as read
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
    
    const userId = session.user.id;
    const body = await request.json();
    
    // Validate request body
    const validatedData = markReadSchema.parse(body);
    
    if (validatedData.all) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } else if (validatedData.ids && validatedData.ids.length > 0) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: {
            in: validatedData.ids,
          },
          userId, // Ensure user can only mark their own notifications
        },
        data: {
          isRead: true,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: `${validatedData.ids.length} notification(s) marked as read`,
      });
    } else {
      return NextResponse.json(
        { error: 'Either "ids" or "all" parameter is required' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

// DELETE handler for removing notifications
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const clearAll = searchParams.get('all') === 'true';
    
    if (clearAll) {
      // Delete all notifications for the user
      await prisma.notification.deleteMany({
        where: {
          userId,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: 'All notifications cleared',
      });
    } else if (notificationId) {
      // Delete a specific notification
      const notification = await prisma.notification.findUnique({
        where: {
          id: notificationId,
        },
      });
      
      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }
      
      if (notification.userId !== userId) {
        return NextResponse.json(
          { error: 'You can only delete your own notifications' },
          { status: 403 }
        );
      }
      
      await prisma.notification.delete({
        where: {
          id: notificationId,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: 'Notification deleted',
      });
    } else {
      return NextResponse.json(
        { error: 'Either "id" or "all" parameter is required' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
