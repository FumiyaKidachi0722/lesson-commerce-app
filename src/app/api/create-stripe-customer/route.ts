import { NextRequest, NextResponse } from 'next/server';
import initStripe from 'stripe';

import { supabaseRouteHandlerClient } from '@/utils/supabaseRouteHandlerClient';

export async function POST(req: NextRequest) {
  const supabase = await supabaseRouteHandlerClient();

  const data = await req.json();
  const { id, email } = data.record;

  const query = req.nextUrl.searchParams.get('API_ROUTE_SECRET');
  if (query !== process.env.API_ROUTE_SECRET) {
    return NextResponse.json(
      { message: 'You are not authorized to call this API' },
      { status: 401 },
    );
  }

  const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);

  const customer = await stripe.customers.create({ email });

  // レコード存在確認（ログインユーザーから見えるかも確認）
  const profileCheck = await supabase
    .from('profile')
    .select('*')
    .eq('id', id)
    .single();

  if (!profileCheck.data) {
    return NextResponse.json(
      { message: '該当のprofileレコードが存在しません' },
      { status: 404 },
    );
  }

  await supabase
    .from('profile')
    .update({ stripe_customer: customer.id })
    .eq('id', id);

  return NextResponse.json({
    message: `stripe customer created: ${customer.id}`,
  });
}
