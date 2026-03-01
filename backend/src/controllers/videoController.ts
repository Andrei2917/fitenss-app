import { Request, Response } from 'express';
import { Vimeo } from 'vimeo';
import prisma from '../config/database';
import fs from 'fs';

// You will get these keys from developer.vimeo.com later!
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID || 'YOUR_VIMEO_CLIENT_ID',
  process.env.VIMEO_CLIENT_SECRET || 'YOUR_VIMEO_CLIENT_SECRET',
  process.env.VIMEO_ACCESS_TOKEN || 'YOUR_VIMEO_ACCESS_TOKEN'
);

// Add a video via a pasted Vimeo link (No API needed!)
export const uploadVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { coachId, title, category } = req.body;
    const file = (req as any).file;
    
    if (!file || !coachId) {
      if (file) fs.unlinkSync(file.path);
      res.status(400).json({ error: 'Video file and Coach ID are required.' });
      return;
    }

    console.log('Uploading file to Vimeo...');

    client.upload(
      file.path,
      {
        name: title || 'New Workout Video',
        description: `Category: ${category}`,
        // --- THIS IS THE MAGIC AUTOMATION BLOCK ---
        privacy: { 
          view: 'disable',  // This tells Vimeo: "Hide from Vimeo.com"
          embed: 'public'   // This tells Vimeo: "Allow embedding Anywhere"
        }
        // ------------------------------------------
      },
      async (uri: string) => {
        console.log('Vimeo Upload Successful:', uri);
        // 1. Delete the temporary file from your server to save space
        fs.unlinkSync(file.path);

        // 2. Format the Vimeo Player Link
        const videoId = uri.split('/').pop();
        const fullUrl = `https://player.vimeo.com/video/${videoId}`;

        // 3. Save to Supabase
        const newVideo = await prisma.video.create({
          data: {
            coachId,
            title: title || 'New Workout Video',
            url: fullUrl,
            category: category || 'Library'
          }
        });

        res.status(201).json({ message: 'Video uploaded successfully!', video: newVideo });
      },
      (bytesUploaded: number, bytesTotal: number) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(`Upload Progress: ${percentage}%`);
      },
      (error: string) => {
        console.error('Vimeo Error:', error);
        fs.unlinkSync(file.path);
        res.status(500).json({ error: 'Failed to upload to Vimeo.' });
      }
    );
  } catch (error) {
    console.error(error);
    if ((req as any).file) fs.unlinkSync((req as any).file.path);
    res.status(500).json({ error: 'Server error during upload.' });
  }
};

// Fetch videos for a specific coach
export const getCoachVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const coachId = req.params.coachId as string;
    const videos = await prisma.video.findMany({
      where: { coachId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos.' });
  }
}

// Fetch videos and check subscription status
export const getClientVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;

    // 1. Find the user's latest subscription AND get the coach's details
    const subscription = await prisma.subscription.findFirst({
      where: { userId: userId },
      orderBy: { startDate: 'desc' },
      include: { coach: true } // Tells Prisma to grab the coach's info too!
    });

    if (!subscription) {
      res.status(200).json({ status: 'none', videos: [] });
      return;
    }

    // 2. Fetch the videos
    const videos = await prisma.video.findMany({
      where: { coachId: subscription.coachId },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Send back the videos AND the payment status!
    res.status(200).json({
      status: subscription.status, // This will be 'pending' or 'active'
      subscriptionId: subscription.id,
      coachName: subscription.coach.name,
      videos: videos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch client videos.' });
  }
};

// Update a video's details
export const updateVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params.userId as any;
    const { title, category } = req.body;
    
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: { title, category }
    });
    
    res.status(200).json(updatedVideo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update video.' });
  }
};

// Delete a video
export const deleteVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params.videoId as any;
    
    await prisma.video.delete({
      where: { id: videoId }
    });
    
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete video.' });
  }
};

// Mock Purchase: Flips a subscription from 'pending' to 'active'
export const purchaseSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.body;

    const activeSub = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { 
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Adds 30 days!
      }
    });

    res.status(200).json({ message: 'Payment successful! Videos unlocked.', subscription: activeSub });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment failed.' });
  }
};