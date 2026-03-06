import { Request, Response } from 'express';
import prisma from '../config/database';

// GET: Fetch all coaches for the Explore Tab
export const getAllCoaches = async (req: Request, res: Response): Promise<void> => {
  try {
    const coaches = await prisma.coach.findMany({
      select: { 
        id: true, 
        name: true, 
        specialty: true // Add any other public fields you have!
      }
    });
    res.status(200).json(coaches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch coaches.' });
  }
};

// POST: Generate a new 6-character access code for real-life clients
export const generateAccessCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { coachId } = req.body; 
    // Generate a random 6-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase(); 

    const newCode = await prisma.accessCode.create({
      data: { code, coachId }
    });

    res.status(201).json({ message: 'Access Code generated successfully!', accessCode: newCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate access code.' });
  }
};

// =============================================
// NEW: GET clients linked to a specific coach
// =============================================
export const getCoachClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const coachId = req.params.coachId as string;

    // Find all subscriptions for this coach, and include the user's info
    const subscriptions = await prisma.subscription.findMany({
      where: { coachId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePictureUrl: true,
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    // Extract the unique users (a user might have multiple subscriptions)
    const uniqueClientsMap = new Map<string, any>();
    for (const sub of subscriptions) {
      if (sub.user && !uniqueClientsMap.has(sub.user.id)) {
        uniqueClientsMap.set(sub.user.id, {
          id: sub.user.id,
          name: sub.user.name,
          email: sub.user.email,
          profilePictureUrl: sub.user.profilePictureUrl,
          status: sub.status, // 'pending' or 'active'
          linkedAt: sub.startDate,
        });
      }
    }

    const clients = Array.from(uniqueClientsMap.values());
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching coach clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients.' });
  }
};

// =============================================
// NEW: GET access codes for a specific coach
// =============================================
export const getCoachAccessCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const coachId = req.params.coachId as string;

    const codes = await prisma.accessCode.findMany({
      where: { coachId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(codes);
  } catch (error) {
    console.error('Error fetching access codes:', error);
    res.status(500).json({ error: 'Failed to fetch access codes.' });
  }
};