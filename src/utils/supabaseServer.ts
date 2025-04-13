import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { Database } from '@/lib/database.types';

type StorageAdapter = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export const supabaseServer = async (): Promise<SupabaseClient<Database>> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // サーバー用キー（適宜匿名キーなどに変更）

  // Next.js の cookies() は非同期なので必ず await する
  const cookieStore = await cookies();

  // サーバー側用のシンプルなストレージアダプタを実装
  // ※ここでは読み取りのみ実装しており、書き込みについては noop としています
  const storageAdapter: StorageAdapter = {
    getItem: (key: string) => cookieStore.get(key)?.value ?? null,
    setItem: (_key: string, _value: string) => {
      console.warn('setItem はサーバー環境ではサポートされていません。');
    },
    removeItem: (_key: string) => {
      console.warn('removeItem はサーバー環境ではサポートされていません。');
    },
  };

  // createClient を使って Supabase クライアントを生成
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      storage: storageAdapter,
      detectSessionInUrl: false,
    },
  });

  return supabase;
};
