import { Router } from 'express';
import { createPaymentIntent } from '../controllers/subscriptionController';

const router = Router();

// Mobile app will hit this to get the Stripe payment ticket
router.post('/create-payment-intent', createPaymentIntent);

export default router;