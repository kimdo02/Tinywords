"use client";

import { useEffect, useMemo, useState } from "react";
import { GameDone, GameTop } from "@/components/game-ui";
import { SpeakButton } from "@/components/speak-button";
import { buildChoices, selectStudyWords } from "@/lib/game";
import { recordAnswer } from "@/lib/record";
import { CHOICES_COUNT } from "@/lib/constants";
import { useTTS, type TtsSettings } from "@/lib/tts";
import type { Word } from "@/types/db";

interface Props {
  words: Word[];
  sessionSize: number;
  tts: Partial<TtsSettings>;
  mode: "meaning" | "listen";
  title: string;
}

export function ChoiceGame({ words, sessionSize, tts, mode, title }: Props) {
  const { speak } = useTTS();
  const [round, setRound] = useState(0);
  const session = useMemo(
    () => selectStudyWords(words, sessionSize),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const word = session[index];
  const choices = useMemo(
    () => (word ? buildChoices(word, words, CHOICES_COUNT) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word?.id, round],
  );

  // 듣기 모드: 새 문제마다 자동 재생
  useEffect(() => {
    if (mode === "listen" && word) {
      const t = setTimeout(() => speak(word.term, tts), 350);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.id, mode]);

  async function pick(choice: Word) {
    if (picked) return;
    setPicked(choice.id);
    const isCorrect = choice.id === word.id;
    if (isCorrect) setCorrect((c) => c + 1);
    await recordAnswer(word, isCorrect);
  }

  function next() {
    if (index + 1 >= session.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  }

  function retry() {
    setRound((r) => r + 1);
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setDone(false);
  }

  if (done) {
    return <GameDone correct={correct} total={session.length} onRetry={retry} />;
  }
  if (!word) return null;

  const label = (c: Word) => (mode === "meaning" ? c.meaning : c.term);

  return (
    <div>
      <GameTop index={index} total={session.length} title={title} />

      <div className="mb-6 flex min-h-[10rem] flex-col items-center justify-center gap-3 rounded-3xl bg-white p-6 text-center shadow-xl">
        {mode === "meaning" ? (
          <>
            <span className="text-4xl font-extrabold text-brand">{word.term}</span>
            <SpeakButton text={word.term} settings={tts} />
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => speak(word.term, tts)}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-5xl text-white shadow-lg active:scale-95"
              aria-label="다시 듣기"
            >
              🔊
            </button>
            <span className="text-sm text-foreground/40">
              소리를 듣고 단어를 골라요
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {choices.map((c) => {
          const isCorrect = c.id === word.id;
          const isPicked = picked === c.id;
          let cls = "bg-white text-foreground";
          if (picked) {
            if (isCorrect) cls = "bg-green-500 text-white";
            else if (isPicked) cls = "bg-red-400 text-white";
            else cls = "bg-white/60 text-foreground/40";
          }
          return (
            <button
              key={c.id}
              onClick={() => pick(c)}
              disabled={!!picked}
              className={`min-h-20 rounded-2xl p-4 text-xl font-bold shadow transition active:scale-[0.98] ${cls}`}
            >
              {label(c)}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-5">
          {picked !== word.id && (
            <p className="mb-3 rounded-2xl bg-white p-3 text-center font-bold text-foreground/70">
              정답은 <span className="text-brand">{label(word)}</span> 이에요!
            </p>
          )}
          <button
            onClick={next}
            className="w-full rounded-2xl bg-brand py-4 text-lg font-bold text-white shadow active:scale-[0.98]"
          >
            다음 ▶️
          </button>
        </div>
      )}
    </div>
  );
}
