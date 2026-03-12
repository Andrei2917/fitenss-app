import { Request, Response } from 'express';
import prisma from '../config/database';

// =============================================
// SEND MESSAGE
// =============================================
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, senderType, userId, coachId } = req.body;

    if (!content || !senderType || !userId || !coachId) {
      res.status(400).json({ error: 'content, senderType, userId, and coachId are required.' });
      return;
    }

    // Only allow messaging if user has active subscription with this coach
    const activeSub = await prisma.subscription.findFirst({
      where: { userId, coachId, status: 'active' },
    });

    if (!activeSub) {
      res.status(403).json({ error: 'You must have an active subscription with this coach to send messages.' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderType,
        userId,
        coachId,
        sentByUserId: senderType === 'user' ? userId : null,
        sentByCoachId: senderType === 'coach' ? coachId : null,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

// =============================================
// GET MESSAGES between a specific user and coach
// =============================================
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const coachId = req.params.coachId as string;

    const messages = await prisma.message.findMany({
      where: { userId, coachId },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

// =============================================
// GET CONVERSATIONS for a User (client side)
// =============================================
export const getUserConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;

    const subscriptions = await prisma.subscription.findMany({
      where: { userId, status: 'active' },
      include: { coach: true },
    });

    const conversations = [];
    for (const sub of subscriptions) {
      const lastMessage = await prisma.message.findFirst({
        where: { userId, coachId: sub.coachId },
        orderBy: { createdAt: 'desc' },
      });

      const unreadCount = await prisma.message.count({
        where: {
          userId,
          coachId: sub.coachId,
          senderType: 'coach',
          read: false,
        },
      });

      conversations.push({
        coachId: sub.coach.id,
        coachName: sub.coach.name,
        coachSpecialty: sub.coach.specialty,
        coachProfilePictureUrl: sub.coach.profilePictureUrl,
        lastMessage: lastMessage?.content || null,
        lastMessageAt: lastMessage?.createdAt || sub.startDate,
        unreadCount,
      });
    }

    conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Get User Conversations Error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
};

// =============================================
// GET CONVERSATIONS for a Coach
// =============================================
export const getCoachConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const coachId = req.params.coachId as string;

    const subscriptions = await prisma.subscription.findMany({
      where: { coachId, status: 'active' },
      include: { user: true },
    });

    const conversations = [];
    for (const sub of subscriptions) {
      const lastMessage = await prisma.message.findFirst({
        where: { userId: sub.userId, coachId },
        orderBy: { createdAt: 'desc' },
      });

      const unreadCount = await prisma.message.count({
        where: {
          userId: sub.userId,
          coachId,
          senderType: 'user',
          read: false,
        },
      });

      conversations.push({
        userId: sub.user.id,
        userName: sub.user.name,
        userProfilePictureUrl: sub.user.profilePictureUrl,
        lastMessage: lastMessage?.content || null,
        lastMessageAt: lastMessage?.createdAt || sub.startDate,
        unreadCount,
      });
    }

    conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Get Coach Conversations Error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
};

// =============================================
// MARK MESSAGES AS READ
// =============================================
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, coachId, readerType } = req.body;

    await prisma.message.updateMany({
      where: {
        userId,
        coachId,
        senderType: readerType === 'user' ? 'coach' : 'user',
        read: false,
      },
      data: { read: true },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark As Read Error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read.' });
  }
};