import { createClient } from "@/lib/supabase/client";
import { MASTER_STREAK } from "@/lib/constants";
import type { Word } from "@/types/db";

/**
 * 게임/테스트에서 한 단어의 정답 여부를 기록.
 * 정답: streak+1(3회 도달 시 mastered). 오답: streak=0, wrong_count+1.
 */
export async function recordAnswer(word: Word, correct: boolean): Promise<void> {
  const supabase = createClient();
  const streak = correct ? word.streak + 1 : 0;
  const status = streak >= MASTER_STREAK ? "mastered" : "learning";
  await supabase
    .from("words")
    .update({
      streak,
      status,
      correct_count: word.correct_count + (correct ? 1 : 0),
      wrong_count: word.wrong_count + (correct ? 0 : 1),
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", word.id);
}
