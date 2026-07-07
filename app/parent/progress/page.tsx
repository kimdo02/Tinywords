import { redirect } from "next/navigation";
import { requireParentUnlocked } from "@/lib/parent";
import { getActiveProfile, getWords } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { ParentNav } from "@/components/parent-nav";
import type { TestResult } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  await requireParentUnlocked();

  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");

  const words = await getWords(profile.id);
  const supabase = await createClient();
  const { data: results } = await supabase
    .from("test_results")
    .select("*")
    .eq("profile_id", profile.id)
    .order("taken_at", { ascending: false })
    .limit(10);

  const tests: TestResult[] = results ?? [];
  const mastered = words.filter((w) => w.status === "mastered").length;
  const learning = words.length - mastered;
  const topWrong = [...words]
    .filter((w) => w.wrong_count > 0)
    .sort((a, b) => b.wrong_count - a.wrong_count)
    .slice(0, 10);

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <ParentNav active="progress" />

      <section className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="전체" value={words.length} color="text-brand" />
        <Stat label="공부 중" value={learning} color="text-accent" />
        <Stat label="다 외움 ⭐" value={mastered} color="text-brand-2" />
      </section>

      <section className="mb-5 rounded-3xl bg-white p-5 shadow-md">
        <h2 className="mb-3 text-lg font-bold">🔥 자주 틀리는 단어</h2>
        {topWrong.length === 0 ? (
          <p className="text-sm text-foreground/60">
            아직 틀린 단어가 없어요. 잘하고 있어요!
          </p>
        ) : (
          <ul className="space-y-2">
            {topWrong.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between rounded-2xl bg-background px-4 py-2"
              >
                <span className="font-bold">
                  {w.emoji ? `${w.emoji} ` : ""}
                  {w.term}
                </span>
                <span className="text-sm text-foreground/60">{w.meaning}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-bold text-red-600">
                  {w.wrong_count}회
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-md">
        <h2 className="mb-3 text-lg font-bold">📝 최근 테스트</h2>
        {tests.length === 0 ? (
          <p className="text-sm text-foreground/60">아직 본 테스트가 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {tests.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-2xl bg-background px-4 py-2 text-sm"
              >
                <span className="text-foreground/60">
                  {new Date(t.taken_at).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="font-bold">
                  {t.correct} / {t.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-4 text-center shadow-md">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-foreground/60">{label}</div>
    </div>
  );
}
