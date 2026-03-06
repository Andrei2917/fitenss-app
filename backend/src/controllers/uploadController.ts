import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure Cloudinary using the keys from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to hold the image in memory temporarily
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body; // We need to know who is uploading this!
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // 1. Upload the image directly from memory to Cloudinary
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
    
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'fitness-app/avatars',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] // Automatically crops it into a perfect square focused on their face!
    });

    const imageUrl = uploadResult.secure_url;

    // 2. Save the new URL to your database based on their role
    if (role === 'coach') {
      await prisma.coach.update({
        where: { id: userId },
        data: { profilePictureUrl: imageUrl },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { profilePictureUrl: imageUrl },
      });
    }

    // 3. Send the URL back to the mobile app
    res.status(200).json({ 
      message: 'Avatar uploaded successfully', 
      profilePictureUrl: imageUrl 
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};