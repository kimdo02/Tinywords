import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParentUnlocked } from "@/lib/parent";
import { getActiveProfile } from "@/lib/data";
import { WordForm } from "@/components/word-form";

export const dynamic = "force-dynamic";

export default async function NewWordPage() {
  await requireParentUnlocked();
  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <header className="mb-5 flex items-center gap-3">
        <Link
          href="/parent/words"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow"
        >
          ←
        </Link>
        <h1 className="text-xl font-extrabold text-brand">새 단어 추가</h1>
      </header>

      <WordForm profileId={profile.id} />
    </main>
  );
}
