import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { Database } from '@/lib/database.types';

export const supabaseRouteHandlerClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // サーバー側用のキーとしてサービスロールキー（または適切なキー）を利用する
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Next.js の cookies() を await して、クッキーオブジェクトを取得する
  const cookieStore = await cookies();

  // サーバー側では、cookie の読み込みは可能ですが、通常は設定処理（setItem など）はできないため、
  // 読み取り専用のシンプルなストレージアダプタを作成します。
  const storage = {
    getItem: (key: string): string | null => {
      return cookieStore.get(key)?.value ?? null;
    },
    // サーバー環境下で書き込みは Next.js のレスポンスヘッダー経由で行う必要があるため、
    // ここでは no-op（何もしない）実装とします。
    setItem: (_key: string, _value: string) => {
      console.warn('setItem is not supported on the server.');
    },
    removeItem: (_key: string) => {
      console.warn('removeItem is not supported on the server.');
    },
  };

  // createClient を使って Supabase クライアントを作成する
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      storage: storage,
      detectSessionInUrl: false,
    },
  });

  return supabase;
};
