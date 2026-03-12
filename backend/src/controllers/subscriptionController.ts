import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-02-25.clover',
});
const prisma = new PrismaClient();

// =============================================
// REDEEM ACCESS CODE (existing — now creates 1-month sub)
// =============================================
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

    // Create subscription as PENDING with 1 month duration
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    await prisma.subscription.create({
      data: {
        status: 'pending',
        userId: userId,
        coachId: accessCode.coachId,
        endDate: endDate,
      },
    });

    res.status(200).json({ success: true, message: 'Coach linked successfully!' });
  } catch (error) {
    console.error('Redeem Code Error:', error);
    res.status(500).json({ error: 'Failed to redeem code' });
  }
};

// =============================================
// NEW: DIRECT PURCHASE (no referral code needed)
// Creates a pending subscription and returns
// a Stripe payment intent in one step
// =============================================
export const purchaseDirect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, coachId } = req.body;

    if (!userId || !coachId) {
      res.status(400).json({ error: 'userId and coachId are required' });
      return;
    }

    // Check if there's already an active sub
    const existingSub = await prisma.subscription.findFirst({
      where: { userId, coachId, status: 'active' },
    });

    if (existingSub) {
      res.status(400).json({ error: 'You already have an active subscription with this coach.' });
      return;
    }

    const coach = await prisma.coach.findUnique({ where: { id: coachId } });
    if (!coach) {
      res.status(404).json({ error: 'Coach not found' });
      return;
    }

    // Create a PENDING subscription (1 month)
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await prisma.subscription.create({
      data: {
        status: 'pending',
        userId,
        coachId,
        endDate,
      },
    });

    // Create the Stripe payment intent
    const amountInCents = Math.round(coach.subscriptionPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        subscriptionId: subscription.id,
        userId,
        coachId,
      },
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      coachName: coach.name,
      price: coach.subscriptionPrice,
    });
  } catch (error: any) {
    console.error('Direct Purchase Error:', error);
    res.status(500).json({ error: 'Failed to create subscription.' });
  }
};

// =============================================
// CREATE PAYMENT INTENT (for code-based pending subs)
// =============================================
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
// CONFIRM PAYMENT — Activates subscription
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

    if (subscription.status === 'active') {
      res.status(200).json({ success: true, message: 'Subscription is already active.' });
      return;
    }

    // Activate and set dates to 1 month from now
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const activeSub = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { 
        status: 'active',
        startDate: now,
        endDate: endDate,
      },
    });

    console.log(`✅ Subscription ${subscriptionId} is now ACTIVE (1 month).`);
    res.status(200).json({ success: true, subscription: activeSub });
  } catch (error: any) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ error: 'Failed to confirm payment.' });
  }
};