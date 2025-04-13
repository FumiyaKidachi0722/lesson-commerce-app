import { NextRequest, NextResponse } from 'next/server';
import initStripe from 'stripe';

import { supabaseRouteHandlerClient } from '@/utils/supabaseRouteHandlerClient';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET(
  req: NextRequest,
  context: any,
): Promise<NextResponse> {
  // 内部で型アサーションして、params の型を明示
  const { params } = context as { params: { priceId: string | string[] } };
  // priceId が配列の場合は最初の要素を使用（Next.js ではパラメータが string または string[] で渡される）
  const priceId = Array.isArray(params.priceId)
    ? params.priceId[0]
    : params.priceId;

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

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerData.stripe_customer,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/canceled`,
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('API Error: ', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
