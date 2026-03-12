import { Request, Response } from 'express';
import prisma from '../config/database';

// GET: Fetch all coaches for the Explore Tab
export const getAllCoaches = async (req: Request, res: Response): Promise<void> => {
  try {
    const coaches = await prisma.coach.findMany({
      select: { 
        id: true, 
        name: true, 
        specialty: true,
        bio: true,
        profilePictureUrl: true,
        coverImageUrl: true,
        tagline: true,
        subscriptionPrice: true,
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
    const code = Math.random().toString(36).substring(2, 8).toUpperCase(); 

    const newCode = await prisma.accessCode.create({
      data: { code, coachId }
    });

    res.status(201).json({ message: 'Access Code generated successfully!', accessCode: newCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate access code.' });
  }
};

// GET clients linked to a specific coach
export const getCoachClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const coachId = req.params.coachId as string;

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

    const uniqueClientsMap = new Map<string, any>();
    for (const sub of subscriptions) {
      if (sub.user && !uniqueClientsMap.has(sub.user.id)) {
        uniqueClientsMap.set(sub.user.id, {
          id: sub.user.id,
          name: sub.user.name,
          email: sub.user.email,
          profilePictureUrl: sub.user.profilePictureUrl,
          status: sub.status,
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

// GET access codes for a specific coach
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

// =============================================
// NEW: GET full coach public profile
// =============================================
export const getCoachProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const coachId = req.params.coachId as string;

    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: {
        id: true,
        name: true,
        specialty: true,
        bio: true,
        profilePictureUrl: true,
        coverImageUrl: true,
        tagline: true,
        offerings: true,
        subscriptionPrice: true,
      }
    });

    if (!coach) {
      res.status(404).json({ error: 'Coach not found' });
      return;
    }

    res.status(200).json(coach);
  } catch (error) {
    console.error('Error fetching coach profile:', error);
    res.status(500).json({ error: 'Failed to fetch coach profile.' });
  }
};

// =============================================
// NEW: UPDATE coach profile (for Settings page)
// =============================================
export const updateCoachProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const coachId = req.params.coachId as string;
    const { bio, tagline, offerings, subscriptionPrice } = req.body;

    const updated = await prisma.coach.update({
      where: { id: coachId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(tagline !== undefined && { tagline }),
        ...(offerings !== undefined && { offerings }),
        ...(subscriptionPrice !== undefined && { subscriptionPrice: parseFloat(subscriptionPrice) }),
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating coach profile:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// Add this function to your existing coachController.ts file
// (add it alongside the other exports)

// =============================================
// NEW: Upload cover image for coach
// =============================================
export const uploadCoverImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const coachId = req.params.coachId as string;
    
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided.' });
      return;
    }

    // Assuming you're using the same upload middleware (multer + supabase/s3/local)
    // as you do for avatar uploads. The file URL comes from your upload middleware.
    const coverImageUrl = (req.file as any).location || (req.file as any).path || req.file.filename;

    const updated = await prisma.coach.update({
      where: { id: coachId },
      data: { coverImageUrl },
    });

    res.status(200).json({ coverImageUrl: updated.coverImageUrl });
  } catch (error) {
    console.error('Error uploading cover image:', error);
    res.status(500).json({ error: 'Failed to upload cover image.' });
  }
};
// =============================================
// NEW: Check if client has active sub with coach
// =============================================
export const checkSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const coachId = req.params.coachId as string;

    const sub = await prisma.subscription.findFirst({
      where: {
        userId,
        coachId,
        status: 'active',
      },
    });

    res.status(200).json({ isSubscribed: !!sub });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: 'Failed to check subscription.' });
  }
};

