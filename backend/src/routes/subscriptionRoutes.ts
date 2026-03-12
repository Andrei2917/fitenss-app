import { Router } from 'express';
import { createPaymentIntent, redeemAccessCode, confirmPayment, purchaseDirect } from '../controllers/subscriptionController';

const router = Router();

// 1. Redeem the Coach's secret code
router.post('/redeem', redeemAccessCode);

// 2. Get the Stripe payment ticket (for code-based pending subs)
router.post('/create-payment-intent', createPaymentIntent);

// 3. Confirm payment — activates the subscription
router.post('/confirm-payment', confirmPayment);

// 4. NEW: Direct purchase without a referral code
router.post('/purchase-direct', purchaseDirect);

export default router;