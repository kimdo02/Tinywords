import { redirect } from "next/navigation";
import { getActiveProfile, getSettings, getWords } from "@/lib/data";
import { DEFAULT_SESSION_SIZE } from "@/lib/constants";
import { FlashcardGame } from "./flashcard-game";

export const dynamic = "force-dynamic";

export default async function FlashcardPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");
  const [words, settings] = await Promise.all([getWords(profile.id), getSettings()]);
  if (words.length === 0) redirect("/study");

  const tts = {
    voiceURI: settings?.tts_voice ?? null,
    rate: settings?.tts_rate ?? 1,
    pitch: settings?.tts_pitch ?? 1,
  };

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <FlashcardGame
        words={words}
        sessionSize={settings?.session_size ?? DEFAULT_SESSION_SIZE}
        tts={tts}
      />
    </main>
  );
}
