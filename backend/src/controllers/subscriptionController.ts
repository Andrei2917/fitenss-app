import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-02-25.clover', // Uses the standard stable API version
});
const prisma = new PrismaClient();

export const redeemAccessCode = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    // 1. Find the code in the database
    const accessCode = await prisma.accessCode.findUnique({
      where: { code: code },
    });

    // 2. Check if it exists and hasn't been used yet
    if (!accessCode) {
      return res.status(404).json({ error: 'Invalid access code' });
    }
    if (accessCode.usedAt !== null) {
      return res.status(400).json({ error: 'This code has already been used' });
    }

    // 3. Mark the code as used and link it to this user
    await prisma.accessCode.update({
      where: { id: accessCode.id },
      data: {
        usedAt: new Date(),
        usedBy: userId,
      },
    });

    // 4. Create a 'pending' subscription to link the Coach and User!
    // (This triggers the Paywall screen we built in the mobile app)
    await prisma.subscription.create({
      data: {
        status: 'pending', 
        userId: userId,
        coachId: accessCode.coachId,
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)), // Arbitrary future date for lifetime access
      },
    });

    res.status(200).json({ success: true, message: 'Coach linked successfully!' });
  } catch (error) {
    console.error('Redeem Code Error:', error);
    res.status(500).json({ error: 'Failed to redeem code' });
  }
};

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

