import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-02-25.clover', // Uses the standard stable API version
});
const prisma = new PrismaClient();

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      res.status(400).json({ error: 'Subscription ID is required' });
      return;
    }

    // 1. Find the pending subscription and the Coach's exact price
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { coach: true, user: true }
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    // 2. Convert dollars to cents (Stripe only reads the smallest currency unit!)
    // e.g., $19.99 becomes 1999 cents.
    const amountInCents = Math.round(subscription.coach.subscriptionPrice * 100);

    // 3. Create the Payment Intent on Stripe's servers
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      // We attach the IDs as metadata so the Webhook knows who paid later!
      metadata: {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        coachId: subscription.coachId
      },
    });

    // 4. Send the secret ticket back to the mobile phone
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Failed to initialize payment.' });
  }
};