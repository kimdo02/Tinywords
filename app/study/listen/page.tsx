import { redirect } from "next/navigation";
import { getActiveProfile, getSettings, getWords } from "@/lib/data";
import { DEFAULT_SESSION_SIZE } from "@/lib/constants";
import { ChoiceGame } from "@/components/choice-game";

export const dynamic = "force-dynamic";

export default async function ListenPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");
  const [words, settings] = await Promise.all([getWords(profile.id), getSettings()]);
  if (words.length < 2) redirect("/study");

  const tts = {
    voiceURI: settings?.tts_voice ?? null,
    rate: settings?.tts_rate ?? 1,
    pitch: settings?.tts_pitch ?? 1,
  };

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <ChoiceGame
        words={words}
        sessionSize={settings?.session_size ?? DEFAULT_SESSION_SIZE}
        tts={tts}
        mode="listen"
        title="듣고 고르기"
      />
    </main>
  );
}
