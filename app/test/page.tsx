import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveProfile, getSettings, getWords } from "@/lib/data";
import { DEFAULT_TEST_COUNT } from "@/lib/constants";
import { TestRunner } from "./test-runner";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");
  const [words, settings] = await Promise.all([getWords(profile.id), getSettings()]);

  if (words.length < 2) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-6xl">📝</div>
        <p className="font-bold">시험을 보려면 단어가 2개 이상 필요해요.</p>
        <Link href="/" className="rounded-2xl bg-brand px-5 py-3 font-bold text-white shadow">
          집으로 🏠
        </Link>
      </main>
    );
  }

  const tts = {
    voiceURI: settings?.tts_voice ?? null,
    rate: settings?.tts_rate ?? 1,
    pitch: settings?.tts_pitch ?? 1,
  };

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <TestRunner
        profileId={profile.id}
        words={words}
        count={settings?.default_test_count ?? DEFAULT_TEST_COUNT}
        tts={tts}
      />
    </main>
  );
}
