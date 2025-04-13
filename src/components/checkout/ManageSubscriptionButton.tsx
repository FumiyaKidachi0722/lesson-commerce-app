'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export const ManageSubscriptionButton = () => {
  const router = useRouter();

  const loadPortal = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/portal`,
    );
    const data = await response.json();
    router.push(data.url);
  };

  return (
    <div>
      <Button onClick={loadPortal}>サブスクリプション管理</Button>
    </div>
  );
};
