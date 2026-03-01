import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-02-25.clover',
});
const prisma = new PrismaClient();

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event;

  try {
    // 1. Verify the signature to ensure this request actually came from Stripe, not a hacker
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // 2. Check if the event is a successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // Remember in Step 2 when we attached the ID to the metadata? Here it is!
    const subscriptionId = paymentIntent.metadata.subscriptionId;

    if (subscriptionId) {
      try {
        // 3. THE MAGIC FLIP: Unlock the videos!
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: { status: 'active' },
        });
        console.log(`SUCCESS! Subscription ${subscriptionId} is now ACTIVE.`);
      } catch (dbError) {
        console.error('Database update failed:', dbError);
      }
    }
  }

  // 4. Always return a 200 response quickly so Stripe knows we received the message
  res.status(200).json({ received: true });
};