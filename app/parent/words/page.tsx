import { redirect } from "next/navigation";
import { requireParentUnlocked } from "@/lib/parent";
import { getActiveProfile, getWords } from "@/lib/data";
import { ParentNav } from "@/components/parent-nav";
import { WordManager } from "./word-manager";

export const dynamic = "force-dynamic";

export default async function WordsPage() {
  await requireParentUnlocked();

  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");
  const words = await getWords(profile.id);

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <ParentNav active="words" />
      <p className="mb-4 text-sm text-foreground/60">
        <span className="font-bold text-foreground">{profile.name}</span> 의 단어를
        관리해요.
      </p>
      <WordManager profileId={profile.id} initialWords={words} />
    </main>
  );
}
