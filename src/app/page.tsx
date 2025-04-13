import { SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Database } from '@/lib/database.types';
import { supabaseServer } from '@/utils/supabaseServer';

const getAllLessons = async (supabase: SupabaseClient<Database>) => {
  const { data: lessons } = await supabase.from('lesson').select('*');
  return lessons;
};

// 利用例
export default async function Home() {
  const supabase = await supabaseServer();
  const lessons = await getAllLessons(supabase);
  if (!lessons) {
    return <div>データの取得に失敗しました。</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-16 px-2">
      <div className="flex flex-col gap-4">
        {lessons.map((lesson) => (
          <Link href={`/lesson/${lesson.id}`} key={lesson.id}>
            <Card>
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent>{lesson.description}</CardContent>
              <CardFooter>
                {new Date(lesson.created_at).toLocaleString()}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
