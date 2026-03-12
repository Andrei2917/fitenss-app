import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================
// SAVE / UPDATE client profile (sex, age, etc.)
// =============================================
export const saveUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const { sex, age, height, weight, goals } = req.body;

    if (!sex || !age || !height || !weight || !goals || goals.length === 0) {
      res.status(400).json({ error: 'All profile fields are required.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        sex,
        age: parseInt(age, 10),
        height: parseInt(height, 10),
        weight: parseInt(weight, 10),
        goals: JSON.stringify(goals),
        profileCompleted: true,
      },
    });

    res.status(200).json({
      message: 'Profile saved successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        profilePictureUrl: updated.profilePictureUrl,
        sex: updated.sex,
        age: updated.age,
        height: updated.height,
        weight: updated.weight,
        goals: updated.goals,
        profileCompleted: updated.profileCompleted,
      },
    });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile.' });
  }
};

// =============================================
// GET client profile completion status
// =============================================
export const getUserProfileStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileCompleted: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ profileCompleted: user.profileCompleted });
  } catch (error: any) {
    console.error('Error checking profile status:', error);
    res.status(500).json({ error: 'Failed to check profile status.' });
  }
};