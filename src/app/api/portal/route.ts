import { NextRequest, NextResponse } from 'next/server';
import initStripe from 'stripe';

import { supabaseRouteHandlerClient } from '@/utils/supabaseRouteHandlerClient';

export async function GET(req: NextRequest) {
  console.log('req: ', req);
  try {
    const supabase = await supabaseRouteHandlerClient();
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = data.user;

    const { data: stripeCustomerData, error: profileError } = await supabase
      .from('profile')
      .select('stripe_customer')
      .eq('id', user.id)
      .single();

    if (profileError || !stripeCustomerData?.stripe_customer) {
      return NextResponse.json(
        { error: 'Stripe customer not found' },
        { status: 400 },
      );
    }

    const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerData.stripe_customer,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('API Error: ', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
