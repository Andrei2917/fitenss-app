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

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middlewares
// ==========================================
// Enable CORS so the React app and React Native app can communicate with this API
app.use(cors());

// 1. WEBHOOK GOES FIRST! (It needs raw data, not JSON)
app.use('/api/webhooks', webhookRoutes);

// Parse incoming JSON requests (e.g., reading form data from a login screen)
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Routes (We will import our actual routes here later)
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/coaches', coachRoutes); 
app.use('/api/subscriptions', subscriptionRoutes); 
app.use('/api/videos', videoRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/forum', forumRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Fitness Coach API is running! 🚀');
});

// A simple health check route for debugging
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy.' });
});

// ==========================================
// Error Handling Middleware
// ==========================================
// Catch-all for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ==========================================
// Start the Server
// ==========================================
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`=================================`);
});