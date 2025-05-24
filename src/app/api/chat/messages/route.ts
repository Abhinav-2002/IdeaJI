import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET handler for fetching messages from a specific chat
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
    const chatId = searchParams.get('chatId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // Message ID to fetch messages before
    
    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user is a participant in the chat
    const chatParticipant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId,
        },
      },
    });
    
    if (!chatParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant in this chat' },
        { status: 403 }
      );
    }
    
    // Build query filters
    const filters: any = { chatId };
    
    // If 'before' parameter is provided, fetch messages before that message ID
    if (before) {
      const beforeMessage = await prisma.message.findUnique({
        where: { id: before },
        select: { createdAt: true },
      });
      
      if (beforeMessage) {
        filters.createdAt = {
          lt: beforeMessage.createdAt,
        };
      }
    }
    
    // Get messages
    const messages = await prisma.message.findMany({
      where: filters,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    
    // Update user's lastRead timestamp for this chat
    await prisma.chatParticipant.update({
      where: {
        userId_chatId: {
          userId,
          chatId,
        },
      },
      data: {
        lastRead: new Date(),
      },
    });
    
    // Return messages in chronological order (oldest first)
    return NextResponse.json({
      messages: messages.reverse(),
      hasMore: messages.length === limit,
    });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
