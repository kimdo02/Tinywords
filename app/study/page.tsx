import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveProfile, getWords } from "@/lib/data";

export const dynamic = "force-dynamic";

const GAMES = [
  { href: "/study/flashcard", emoji: "🃏", title: "카드 뒤집기", min: 1, desc: "단어를 보고 뜻을 확인해요" },
  { href: "/study/meaning", emoji: "🤔", title: "뜻 맞히기", min: 2, desc: "단어의 뜻을 골라요" },
  { href: "/study/listen", emoji: "👂", title: "듣고 고르기", min: 2, desc: "발음을 듣고 단어를 골라요" },
];

export default async function StudyMenuPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");
  const words = await getWords(profile.id);

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow"
        >
          ←
        </Link>
        <h1 className="text-2xl font-extrabold text-brand">무슨 놀이 할까?</h1>
      </header>

      <div className="grid gap-4">
        {GAMES.map((g) => {
          const enabled = words.length >= g.min;
          const card = (
            <div
              className={`flex items-center gap-4 rounded-3xl p-5 shadow-md transition ${
                enabled ? "bg-white active:scale-[0.98]" : "bg-white/50"
              }`}
            >
              <span className="text-5xl">{g.emoji}</span>
              <div className="flex-1">
                <div className="text-xl font-extrabold">{g.title}</div>
                <div className="text-sm text-foreground/60">
                  {enabled ? g.desc : `단어 ${g.min}개 이상 필요해요`}
                </div>
              </div>
              <span className="text-2xl">{enabled ? "▶️" : "🔒"}</span>
            </div>
          );
          return enabled ? (
            <Link key={g.href} href={g.href}>
              {card}
            </Link>
          ) : (
            <div key={g.href}>{card}</div>
          );
        })}
      </div>
    </main>
  );
}
