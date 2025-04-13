import React from 'react';

import { AuthClientButton } from '@/components/auth/AuthClientButton';
import { supabaseServer } from '@/utils/supabaseServer';

export const AuthServerButton = async () => {
  const supabase = await supabaseServer();
  const { data: user } = await supabase.auth.getSession();
  const session = user.session;

  return <AuthClientButton session={session} />;
};
