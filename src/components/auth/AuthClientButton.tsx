'use client';

import React from 'react';

import {
  createClientComponentClient,
  Session,
} from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export const AuthClientButton = ({ session }: { session: Session | null }) => {
  const router = useRouter();

  const supabase = createClientComponentClient();
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
