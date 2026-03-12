import { Router } from 'express';
import { 
  sendMessage, 
  getMessages, 
  getUserConversations, 
  getCoachConversations, 
  markAsRead 
} from '../controllers/messageController';

const router = Router();

// Send a message
router.post('/', sendMessage);

// Get all messages between a user and coach
router.get('/:userId/:coachId', getMessages);

// Get conversation list for a client
router.get('/conversations/user/:userId', getUserConversations);

// Get conversation list for a coach
router.get('/conversations/coach/:coachId', getCoachConversations);

// Mark messages as read
router.post('/mark-read', markAsRead);

export default router;