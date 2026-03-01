import { Router } from 'express';
import { getAllPosts, getPostById, createPost, createComment } from '../controllers/forumController';

const router = Router();

// Forum Endpoints
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);
router.post('/posts', createPost);
router.post('/posts/:id/comments', createComment);

export default router;