'use server';

import { UserDetails } from '@/app/dashboard/upgrade/page';
import getStripe from '@/lib/stripe-js';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '../../firebaseAdmin';
import stripe from '@/lib/stripe';
import getBaseUrl from '@/lib/getBaseUrl';

export async function createCheckoutSession(userDetails: UserDetails) {
  const { userId } = await auth();

  if (!userId) throw new Error('user not found');

  let stripeCustomerId;
  const user = await adminDb.collection('users').doc(userId).get();

  stripeCustomerId = user.data()?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: userDetails.email,
      name: userDetails.name,
      metadata: {
        userId,
      },
    });

    await adminDb.collection('users').doc(userId).set({
      stripeCustomerId: customer.id,
    });

    stripeCustomerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: 'price_1Pgz9qFl2MDzm5x3Y0RJ74pN',
        quantity: 1,
      },
    ],
    mode: 'subscription',
    customer: stripeCustomerId,
    success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
    cancel_url: `${getBaseUrl()}/dashboard?upgrade=false`,
  });

  return session.id;
}
