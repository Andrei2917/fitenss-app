import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';

const router = Router();

// Notice we use `express.raw()` here! This is required for Stripe security.
router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;