"use client";

import Link from "next/link";

export function GameTop({
  index,
  total,
  title,
}: {
  index: number;
  total: number;
  title: string;
}) {
  const pct = total > 0 ? Math.round((index / total) * 100) : 0;
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <Link
          href="/study"
          aria-label="그만하기"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow"
        >
          ✕
        </Link>
        <span className="font-bold text-foreground/70">{title}</span>
        <span className="text-sm font-bold text-foreground/60">
          {Math.min(index + 1, total)}/{total}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-brand-2 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function GameDone({
  correct,
  total,
  onRetry,
}: {
  correct: number;
  total: number;
  onRetry: () => void;
}) {
  const stars = total > 0 ? Math.round((correct / total) * 3) : 0;
  return (
    <div className="animate-pop rounded-3xl bg-white p-8 text-center shadow-xl">
      <div className="text-6xl">🎉</div>
      <h2 className="mt-3 text-2xl font-extrabold text-brand">잘했어요!</h2>
      <div className="my-4 text-4xl">
        {"⭐".repeat(stars)}
        <span className="opacity-25">{"⭐".repeat(3 - stars)}</span>
      </div>
      <p className="text-foreground/70">
        {total}개 중 <span className="font-bold text-brand">{correct}</span>개 정답!
      </p>
      <div className="mt-6 grid gap-3">
        <button
          onClick={onRetry}
          className="rounded-2xl bg-brand py-3 text-lg font-bold text-white shadow active:scale-[0.98]"
        >
          한 번 더! 🔁
        </button>
        <Link
          href="/"
          className="rounded-2xl bg-background py-3 text-lg font-bold text-foreground/70"
        >
          집으로 🏠
        </Link>
      </div>
    </div>
  );
}
