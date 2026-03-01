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