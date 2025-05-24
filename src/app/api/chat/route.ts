import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating a new chat
const createChatSchema = z.object({
  name: z.string().optional(),
  ideaId: z.string().optional(),
  participants: z.array(z.string()).min(1, "At least one participant is required"),
});

// Validation schema for sending a message
const sendMessageSchema = z.object({
  chatId: z.string(),
  content: z.string().min(1, "Message content is required"),
});

// GET handler for fetching user's chats
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
    
    // Get all chats where the user is a participant
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            isAnonymous: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    // Process chats to respect idea anonymity
    const processedChats = chats.map(chat => {
      if (chat.idea?.isAnonymous) {
        return {
          ...chat,
          idea: {
            ...chat.idea,
            user: {
              id: 'anonymous',
              name: 'Anonymous',
              image: null,
            },
          },
        };
      }
      return chat;
    });
    
    // Get unread messages count for each chat
    const chatsWithUnreadCount = await Promise.all(
      processedChats.map(async (chat) => {
        const participant = chat.participants.find(p => p.userId === userId);
        
        if (!participant) {
          return {
            ...chat,
            unreadCount: 0,
          };
        }
        
        const unreadCount = await prisma.message.count({
          where: {
            chatId: chat.id,
            createdAt: {
              gt: participant.lastRead,
            },
            senderId: {
              not: userId, // Don't count user's own messages as unread
            },
          },
        });
        
        return {
          ...chat,
          unreadCount,
        };
      })
    );
    
    return NextResponse.json({
      chats: chatsWithUnreadCount,
    });
    
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new chat
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
    
    // Determine if creating a chat or sending a message
    if (body.chatId && body.content) {
      // This is a message send request
      const validatedData = sendMessageSchema.parse(body);
      
      // Check if chat exists and user is a participant
      const chatParticipant = await prisma.chatParticipant.findUnique({
        where: {
          userId_chatId: {
            userId,
            chatId: validatedData.chatId,
          },
        },
        include: {
          chat: {
            include: {
              participants: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });
      
      if (!chatParticipant) {
        return NextResponse.json(
          { error: 'You are not a participant in this chat' },
          { status: 403 }
        );
      }
      
      // Send the message
      const message = await prisma.message.create({
        data: {
          content: validatedData.content,
          senderId: userId,
          chatId: validatedData.chatId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
      
      // Update chat's updatedAt timestamp
      await prisma.chat.update({
        where: {
          id: validatedData.chatId,
        },
        data: {
          updatedAt: new Date(),
        },
      });
      
      // Update sender's lastRead timestamp
      await prisma.chatParticipant.update({
        where: {
          userId_chatId: {
            userId,
            chatId: validatedData.chatId,
          },
        },
        data: {
          lastRead: new Date(),
        },
      });
      
      // Create notifications for other participants
      const otherParticipants = chatParticipant.chat.participants
        .filter(p => p.userId !== userId)
        .map(p => p.userId);
      
      if (otherParticipants.length > 0) {
        await prisma.notification.createMany({
          data: otherParticipants.map(recipientId => ({
            userId: recipientId,
            type: 'MESSAGE',
            title: 'New Message',
            content: `${session.user.name || 'Someone'} sent you a message`,
            relatedId: message.id,
          })),
        });
      }
      
      return NextResponse.json({
        success: true,
        message,
      });
      
    } else {
      // This is a chat creation request
      const validatedData = createChatSchema.parse(body);
      
      // Ensure the user is included in participants
      if (!validatedData.participants.includes(userId)) {
        validatedData.participants.push(userId);
      }
      
      // Check if idea exists if ideaId is provided
      if (validatedData.ideaId) {
        const idea = await prisma.idea.findUnique({
          where: {
            id: validatedData.ideaId,
          },
        });
        
        if (!idea) {
          return NextResponse.json(
            { error: 'Idea not found' },
            { status: 404 }
          );
        }
      }
      
      // Check if all participants exist
      const participantsCount = await prisma.user.count({
        where: {
          id: {
            in: validatedData.participants,
          },
        },
      });
      
      if (participantsCount !== validatedData.participants.length) {
        return NextResponse.json(
          { error: 'One or more participants do not exist' },
          { status: 400 }
        );
      }
      
      // Create the chat
      const chat = await prisma.chat.create({
        data: {
          name: validatedData.name,
          ideaId: validatedData.ideaId,
          participants: {
            create: validatedData.participants.map(participantId => ({
              userId: participantId,
              joinedAt: new Date(),
              lastRead: new Date(),
            })),
          },
        },
        include: {
          idea: {
            select: {
              title: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      
      // Create notifications for other participants
      const otherParticipants = validatedData.participants.filter(id => id !== userId);
      
      if (otherParticipants.length > 0) {
        await prisma.notification.createMany({
          data: otherParticipants.map(recipientId => ({
            userId: recipientId,
            type: 'SYSTEM',
            title: 'New Chat',
            content: `${session.user.name || 'Someone'} added you to a chat${validatedData.name ? ` "${validatedData.name}"` : ''}`,
            relatedId: chat.id,
          })),
        });
      }
      
      return NextResponse.json({
        success: true,
        chat,
      });
    }
    
  } catch (error) {
    console.error('Error with chat operation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat operation' },
      { status: 500 }
    );
  }
}
