"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitTestAction(input: {
  profileId: string;
  total: number;
  correct: number;
  wrongIds: string[];
}): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.from("test_results").insert({
    profile_id: input.profileId,
    total: input.total,
    correct: input.correct,
    wrong_word_ids: input.wrongIds,
  });
  return { ok: !error };
}
