"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SpeakButton } from "@/components/speak-button";
import type { Word } from "@/types/db";

export function WordList({ initialWords }: { initialWords: Word[] }) {
  const supabase = createClient();
  const [words, setWords] = useState<Word[]>(initialWords);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    if (!window.confirm("이 단어를 삭제할까요?")) return;
    const { error: delErr } = await supabase.from("words").delete().eq("id", id);
    if (delErr) {
      setError("삭제에 실패했어요.");
      return;
    }
    setWords((prev) => prev.filter((w) => w.id !== id));
  }

  if (words.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-6 text-center text-sm text-foreground/60 shadow">
        아직 등록된 단어가 없어요. “새 단어 추가”로 시작해보세요!
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <ul className="space-y-2">
        {words.map((w) => (
          <li
            key={w.id}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow"
          >
            {w.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={w.image_url}
                alt={w.term}
                className="h-11 w-11 rounded-xl object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-2/25 font-extrabold text-brand">
                {w.term.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">{w.term}</span>
                <SpeakButton text={w.term} size="sm" />
                {w.status === "mastered" && <span title="다 외움">⭐</span>}
              </div>
              <div className="truncate text-sm text-foreground/60">
                {w.meaning}
                {w.wrong_count > 0 && (
                  <span className="ml-2 text-red-500">틀림 {w.wrong_count}</span>
                )}
              </div>
            </div>
            <Link
              href={`/parent/words/${w.id}/edit`}
              className="rounded-xl bg-background px-3 py-2 text-sm font-bold"
            >
              수정
            </Link>
            <button
              onClick={() => remove(w.id)}
              className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
