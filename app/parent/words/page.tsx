import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParentUnlocked } from "@/lib/parent";
import { getActiveProfile, getWords } from "@/lib/data";
import { ParentNav } from "@/components/parent-nav";
import { WordList } from "@/components/word-list";

export const dynamic = "force-dynamic";

export default async function WordsPage() {
  await requireParentUnlocked();

  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");
  const words = await getWords(profile.id);

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <ParentNav active="words" />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-foreground/60">
          <span className="font-bold text-foreground">{profile.name}</span> 의 단어{" "}
          <span className="font-bold text-brand">{words.length}</span>
        </p>
        <Link
          href="/parent/words/new"
          className="rounded-2xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow active:scale-95"
        >
          + 새 단어 추가
        </Link>
      </div>

      <WordList initialWords={words} />
    </main>
  );
}
