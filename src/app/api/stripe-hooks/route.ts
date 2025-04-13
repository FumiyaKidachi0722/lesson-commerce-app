import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import initStripe from 'stripe';

import { Database } from '@/lib/database.types';

// export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);
  const signature = req.headers.get('stripe-signature')!;
  const endpointSecret = process.env.STRIPE_SIGNING_SECRET!;

  const reqBuffer = Buffer.from(await req.arrayBuffer());

  try {
    const event = stripe.webhooks.constructEvent(
      reqBuffer,
      signature,
      endpointSecret,
    );

    switch (event.type) {
      // TODO: プランの種類を判別したい
      case 'customer.subscription.created':
        const customerSubscriptionCreated = event.data.object;
        if (typeof customerSubscriptionCreated.customer === 'string') {
          await supabase
            .from('profile')
            .update({
              is_subscribed: true,
              interval: customerSubscriptionCreated.items.data[0].plan.interval,
            })
            .eq('stripe_customer', customerSubscriptionCreated.customer);
        }
        break;

      case 'customer.subscription.updated':
        const customerSubscriptionUpdated = event.data.object;
        if (typeof customerSubscriptionUpdated.customer === 'string') {
          if (customerSubscriptionUpdated.status !== 'canceled') {
            await supabase
              .from('profile')
              .update({
                is_subscribed: true,
                interval:
                  customerSubscriptionUpdated.items.data[0].plan.interval,
              })
              .eq('stripe_customer', customerSubscriptionUpdated.customer);
          }
        }
        break;
      case 'customer.subscription.deleted':
        const customerSubscriptionDeleted = event.data.object;
        if (typeof customerSubscriptionDeleted.customer === 'string') {
          await supabase
            .from('profile')
            .update({
              is_subscribed: false,
              interval: null,
            })
            .eq('stripe_customer', customerSubscriptionDeleted.customer);
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(`Webhook Error: ${error.message}`, {
        status: 401,
      });
    }

    return NextResponse.json('Unknown Webhook Error', {
      status: 401,
    });
  }
}
