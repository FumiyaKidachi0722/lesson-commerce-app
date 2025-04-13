import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { Database } from '@/lib/database.types';

// 関数を async として定義
export const supabaseRouteHandlerClient = async () => {
  // cookies() の Promise を await して同期オブジェクトを取得
  const cookieStore = await cookies();

  // 取得した cookieStore で getAll() 呼び出し可能
  console.log(cookieStore.getAll());

  // Supabase クライアント作成時には、cookies を非同期関数として渡す
  return createRouteHandlerClient<Database>({
    cookies: async () => cookieStore,
  });
};
