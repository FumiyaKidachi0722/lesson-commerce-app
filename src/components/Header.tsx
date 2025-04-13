import React from 'react';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

import { AuthServerButton } from '@/components/auth/AuthServerButton';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';

export const Header = async () => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: user } = await supabase.auth.getSession();

  return (
    <div className="flex py-4 px-6 border-b border-gray-200">
      <Link href={'/'}>
        <Button variant={'outline'}>ホーム</Button>
      </Link>
      {user.session && (
        <Link href={'/dashboard'} className="ml-4">
          <Button variant={'outline'}>ダッシュボード</Button>
        </Link>
      )}{' '}
      <Link href={'/pricing'} className="ml-4">
        <Button variant={'outline'}>価格</Button>
      </Link>
      <div className="ml-auto">
        <AuthServerButton />
      </div>
    </div>
  );
};
