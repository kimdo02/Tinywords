import type { Word } from "@/types/db";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 학습 세션에 쓸 단어 선정.
 * 우선순위: 아직 못 외운(learning) & 틀린 횟수 많은 순 → 최근에 안 본 순.
 * 모두 mastered면 복습용으로 섞어서 반환.
 */
export function selectStudyWords(words: Word[], size: number): Word[] {
  const learning = words.filter((w) => w.status !== "mastered");
  const pool = learning.length > 0 ? learning : words;
  const sorted = [...pool].sort((a, b) => {
    if (b.wrong_count !== a.wrong_count) return b.wrong_count - a.wrong_count;
    const at = a.last_reviewed_at ? Date.parse(a.last_reviewed_at) : 0;
    const bt = b.last_reviewed_at ? Date.parse(b.last_reviewed_at) : 0;
    return at - bt;
  });
  return sorted.slice(0, size);
}

/**
 * 객관식 보기 생성. 정답 + 같은 풀에서 뽑은 오답들.
 * 단어가 부족하면 가능한 개수만큼만 만든다.
 */
export function buildChoices<T extends Word>(
  correct: T,
  pool: T[],
  count: number,
): T[] {
  const distractors = shuffle(pool.filter((w) => w.id !== correct.id)).slice(
    0,
    Math.max(0, count - 1),
  );
  return shuffle([correct, ...distractors]);
}

/** image 또는 emoji가 있어 그림 게임에 쓸 수 있는 단어 */
export function hasVisual(w: Word): boolean {
  return Boolean(w.image_url || w.emoji);
}
