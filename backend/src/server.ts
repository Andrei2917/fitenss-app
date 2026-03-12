import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import coachRoutes from './routes/coachRoutes'; 
import subscriptionRoutes from './routes/subscriptionRoutes'; 
import videoRoutes from './routes/videoRoutes'; 
import paymentRoutes from './routes/subscriptionRoutes';
import webhookRoutes from './routes/webhookRoutes';
import forumRoutes from './routes/forumRoutes';
import messageRoutes from './routes/messageRoutes';  // NEW
import profileRoutes from './routes/profileRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/coaches', coachRoutes); 
app.use('/api/subscriptions', subscriptionRoutes); 
app.use('/api/videos', videoRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/messages', messageRoutes);  // NEW
app.use('/api/profile', profileRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Fitness Coach API is running! 🚀');
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy.' });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`=================================`);
});