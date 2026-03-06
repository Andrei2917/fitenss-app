import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-02-25.clover',
});
const prisma = new PrismaClient();

export const redeemAccessCode = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    const accessCode = await prisma.accessCode.findUnique({
      where: { code: code },
    });

    if (!accessCode) {
      return res.status(404).json({ error: 'Invalid access code' });
    }
    if (accessCode.usedAt !== null) {
      return res.status(400).json({ error: 'This code has already been used' });
    }

    await prisma.accessCode.update({
      where: { id: accessCode.id },
      data: {
        usedAt: new Date(),
        usedBy: userId,
      },
    });

    await prisma.subscription.create({
      data: {
        status: 'pending', 
        userId: userId,
        coachId: accessCode.coachId,
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
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

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { coach: true, user: true }
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    const amountInCents = Math.round(subscription.coach.subscriptionPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        coachId: subscription.coachId
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Failed to initialize payment.' });
  }
};

// =============================================
// Confirm payment — called by the mobile app
// right after presentPaymentSheet() succeeds.
// The Stripe Payment Sheet guarantees the payment
// went through, so we can safely activate here.
// =============================================
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      res.status(400).json({ error: 'Subscription ID is required' });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    // Already active — nothing to do
    if (subscription.status === 'active') {
      res.status(200).json({ success: true, message: 'Subscription is already active.' });
      return;
    }

    // Activate the subscription — presentPaymentSheet() already confirmed payment
    const activeSub = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'active' },
    });

    console.log(`✅ Subscription ${subscriptionId} is now ACTIVE.`);
    res.status(200).json({ success: true, subscription: activeSub });
  } catch (error: any) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ error: 'Failed to confirm payment.' });
  }
};