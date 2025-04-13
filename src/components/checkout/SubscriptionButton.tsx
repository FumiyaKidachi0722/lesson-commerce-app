'use client';

import { loadStripe } from '@stripe/stripe-js';

import { Button } from '@/components/ui/button';

export const SubscriptionButton = ({ planId }: { planId: string }) => {
  const processSubscription = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/${planId}`,
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('API error response: ', error);
        alert(`エラーが発生しました: ${error.error}`);
        return;
      }

      const data = await response.json();
      console.log('Checkout session ID: ', data.id);

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

      await stripe?.redirectToCheckout({ sessionId: data.id });

      // ここでStripe Checkoutにリダイレクトなどする想定
      // window.location.href = `https://checkout.stripe.com/pay/${json.id}`;
    } catch (error) {
      console.error('Fetch failed: ', error);
      alert('通信エラーが発生しました。');
    }
  };

  return (
    <Button onClick={processSubscription}>サブスクリプション契約する</Button>
  );
};
