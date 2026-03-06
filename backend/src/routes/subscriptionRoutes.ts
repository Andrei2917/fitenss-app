import { Router } from 'express';
import { createPaymentIntent, redeemAccessCode, confirmPayment } from '../controllers/subscriptionController';

const router = Router();

// 1. Mobile app hits this to redeem the Coach's secret code
router.post('/redeem', redeemAccessCode);

// 2. Mobile app hits this to get the Stripe payment ticket
router.post('/create-payment-intent', createPaymentIntent);

// 3. Mobile app hits this AFTER payment succeeds to activate the subscription
router.post('/confirm-payment', confirmPayment);

export default router;