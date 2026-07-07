import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireParentUnlocked } from "@/lib/parent";
import { getActiveProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { WordForm } from "@/components/word-form";
import type { Word } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function EditWordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireParentUnlocked();
  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");

  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("words").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const word = data as Word;

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <header className="mb-5 flex items-center gap-3">
        <Link
          href="/parent/words"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow"
        >
          ←
        </Link>
        <h1 className="text-xl font-extrabold text-brand">단어 수정</h1>
      </header>

      <WordForm profileId={word.profile_id} initial={word} />
    </main>
  );
}
