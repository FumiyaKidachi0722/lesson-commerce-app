import React, { JSX } from 'react';

import { SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import initStripe, { Stripe } from 'stripe';

import { AuthServerButton } from '@/components/auth/AuthServerButton';
import { SubscriptionButton } from '@/components/checkout/SubscriptionButton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Database } from '@/lib/database.types';
import { supabaseServer } from '@/utils/supabaseServer';

interface Plan {
  id: string;
  name: string;
  price: number | null;
  interval: Stripe.Price.Recurring.Interval | null;
  currency: string;
}

const getAllPlans = async (): Promise<Plan[]> => {
  const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);

  const { data: plansList } = await stripe.plans.list();

  const plans = await Promise.all(
    plansList.map(async (plan) => {
      const product = await stripe.products.retrieve(plan.product as string);

      return {
        id: plan.id,
        name: product.name,
        price: plan.amount,
        interval: plan.interval,
        currency: plan.currency,
      };
    }),
  );

  const sortedPlans = plans.sort((a, b) => a.price! - b.price!);

  return sortedPlans;
};

const getProfileData = async (supabase: SupabaseClient<Database>) => {
  const { data: profile } = await supabase.from('profile').select('*').single();
  return profile;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const PricingPage = async (props: any): Promise<JSX.Element> => {
  const { params } = props as { params: { id: number } };
  const lessonId = params.id;

  const supabase = await supabaseServer();
  const { data: user } = await supabase.auth.getSession();

  const [plans, profile] = await Promise.all([
    await getAllPlans(),
    await getProfileData(supabase),
  ]);

  const showSubscribeButton = !!user.session && !profile?.is_subscribed;
  const showCreateAccountButton = !user.session;
  const showManageSubscriptionButton = !!user.session && profile?.is_subscribed;

  return (
    <div className="w-full max-w-3xl mx-auto py-16 flex justify-around">
      <h1 className="text-3xl mb-6">{lessonId}</h1>
      {plans.map((plan) => (
        <Card className="shadow-md" key={plan.id}>
          <CardHeader>
            <CardTitle>{plan.name}プラン</CardTitle>
            <CardDescription>{plan.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {plan.price?.toLocaleString()}
            {plan.currency}/{plan.interval}
          </CardContent>
          <CardFooter>
            {showSubscribeButton && <SubscriptionButton planId={plan.id} />}
            {showCreateAccountButton && <AuthServerButton />}
            {showManageSubscriptionButton && (
              <Button>
                <Link href="/dashboard">サブスクリプション管理する</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PricingPage;
