import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveProfile, getProfiles, getWords } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profiles = await getProfiles();
  if (profiles.length === 0) redirect("/profiles");

  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");

  const words = await getWords(profile.id);
  const learning = words.filter((w) => w.status !== "mastered").length;
  const mastered = words.length - learning;

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/profiles"
          className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow"
        >
          <span className="text-2xl">{profile.avatar ?? "🐣"}</span>
          <span className="font-bold">{profile.name}</span>
        </Link>
        <Link
          href="/parent/words"
          aria-label="부모 모드"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow"
        >
          ⚙️
        </Link>
      </header>

      <section className="mb-6 rounded-3xl bg-white p-5 shadow-md">
        <div className="flex items-center justify-around text-center">
          <div>
            <div className="text-2xl font-extrabold text-brand">{words.length}</div>
            <div className="text-xs text-foreground/60">전체 단어</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-accent">{learning}</div>
            <div className="text-xs text-foreground/60">공부 중</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-brand-2">{mastered}</div>
            <div className="text-xs text-foreground/60">다 외운 ⭐</div>
          </div>
        </div>
      </section>

      {words.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-md">
          <div className="text-6xl">🐣</div>
          <p className="mt-3 font-bold">아직 단어가 없어요!</p>
          <p className="mt-1 text-sm text-foreground/60">
            부모님이 단어를 등록하면 여기서 공부할 수 있어요.
          </p>
          <Link
            href="/parent/words"
            className="mt-4 inline-block rounded-2xl bg-brand px-5 py-3 font-bold text-white shadow"
          >
            단어 등록하러 가기 ⚙️
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          <Link
            href="/study"
            className="animate-pop flex items-center gap-4 rounded-3xl bg-brand p-6 text-white shadow-lg active:scale-[0.98]"
          >
            <span className="text-5xl">🎮</span>
            <span className="text-2xl font-extrabold">공부하기</span>
          </Link>
          <Link
            href="/test"
            className="animate-pop flex items-center gap-4 rounded-3xl bg-accent p-6 text-white shadow-lg active:scale-[0.98]"
          >
            <span className="text-5xl">📝</span>
            <span className="text-2xl font-extrabold">시험 보기</span>
          </Link>
        </div>
      )}
    </main>
  );
}
