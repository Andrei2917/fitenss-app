import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. GET ALL POSTS (For the main forum feed)
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' }, // Newest posts at the top!
      include: {
        user: { select: { id: true, name: true } },   // Fetch the Client's name if they wrote it
        coach: { select: { id: true, name: true } },  // Fetch the Coach's name if they wrote it
        _count: { select: { comments: true } }        // Get the total number of comments
      }
    });
    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 2. GET A SINGLE POST WITH COMMENTS
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    // --- FIX: Explicitly cast to string so Prisma is happy ---
    const id = req.params.id as string; 
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        coach: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: 'asc' }, // Oldest comments at the top (chronological)
          include: {
            user: { select: { id: true, name: true } },
            coach: { select: { id: true, name: true } },
          }
        }
      }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(200).json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 3. CREATE A NEW POST
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    // Grab whichever ID the mobile app managed to send
    const { title, content, userId, coachId } = req.body;
    const authorId = userId || coachId;

    if (!title || !content || !authorId) {
      res.status(400).json({ error: 'Title, content, and author ID are required' });
      return;
    }

    // SMART DETECT: Ask the database if this ID belongs to a Coach!
    const coachProfile = await prisma.coach.findUnique({ where: { id: authorId } });
    const isCoach = !!coachProfile;

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        coachId: isCoach ? authorId : null, // Forces the Coach Badge!
        userId: !isCoach ? authorId : null  // Normal Client
      }
    });

    res.status(201).json(newPost);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 4. CREATE A NEW COMMENT
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id as string;
    const { content, userId, coachId } = req.body;
    const authorId = userId || coachId;

    if (!content || !authorId) {
      res.status(400).json({ error: 'Comment content and author ID are required' });
      return;
    }

    // SMART DETECT: Ask the database if this ID belongs to a Coach!
    const coachProfile = await prisma.coach.findUnique({ where: { id: authorId } });
    const isCoach = !!coachProfile;

    const newComment = await prisma.comment.create({
      data: {
        content,
        postId,
        coachId: isCoach ? authorId : null, // Forces the Coach Badge!
        userId: !isCoach ? authorId : null  // Normal Client
      }
    });

    res.status(201).json(newComment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};