import { Request, Response } from 'express';
import { Vimeo } from 'vimeo';
import prisma from '../config/database';
import fs from 'fs';

const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID || 'YOUR_VIMEO_CLIENT_ID',
  process.env.VIMEO_CLIENT_SECRET || 'YOUR_VIMEO_CLIENT_SECRET',
  process.env.VIMEO_ACCESS_TOKEN || 'YOUR_VIMEO_ACCESS_TOKEN'
);

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
        privacy: { 
          view: 'disable',
          embed: 'public'
        }
      },
      async (uri: string) => {
        console.log('Vimeo Upload Successful:', uri);
        fs.unlinkSync(file.path);

        const videoId = uri.split('/').pop();
        const fullUrl = `https://player.vimeo.com/video/${videoId}`;

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

// =============================================
// UPDATED: Now returns ALL subscriptions' videos
// grouped by coach (supports multiple coaches)
// =============================================
export const getClientVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;

    // Find ALL user subscriptions (not just the first one)
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: { coach: true },
      orderBy: { startDate: 'desc' },
    });

    if (!subscriptions || subscriptions.length === 0) {
      res.status(200).json({ subscriptions: [], status: 'none', videos: [] });
      return;
    }

    // For each subscription, fetch videos
    const result = [];
    for (const sub of subscriptions) {
      const videos = await prisma.video.findMany({
        where: { coachId: sub.coachId },
        orderBy: { createdAt: 'desc' },
      });

      result.push({
        subscriptionId: sub.id,
        status: sub.status,
        coachId: sub.coachId,
        coachName: sub.coach.name,
        coachSpecialty: sub.coach.specialty,
        endDate: sub.endDate,
        videos,
      });
    }

    // For backward compatibility, also return the "first" sub's data at the top level
    const firstActive = result.find(r => r.status === 'active') || result[0];

    res.status(200).json({
      status: firstActive.status,
      subscriptionId: firstActive.subscriptionId,
      coachName: firstActive.coachName,
      videos: firstActive.videos,
      // NEW: Array of ALL subscriptions
      subscriptions: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch client videos.' });
  }
};

export const updateVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const videoId = req.params.videoId as string;
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

export const deleteVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const videoId = req.params.videoId as string;    
    await prisma.video.delete({
      where: { id: videoId }
    });
    
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete video.' });
  }
};

export const purchaseSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.body;

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const activeSub = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { 
        status: 'active',
        startDate: now,
        endDate: endDate,
      }
    });

    res.status(200).json({ message: 'Payment successful! Videos unlocked.', subscription: activeSub });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment failed.' });
  }
};