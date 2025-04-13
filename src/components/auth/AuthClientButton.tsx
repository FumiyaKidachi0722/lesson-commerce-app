'use client';

import React from 'react';

import { createClient, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export const AuthClientButton = ({ session }: { session: Session | null }) => {
  const router = useRouter();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      {session ? (
        <Button variant={'default'} onClick={handleSignOut}>
          ログアウト
        </Button>
      ) : (
        <Button variant={'default'} onClick={handleSignIn}>
          サイイン
        </Button>
      )}
    </>
  );
};
