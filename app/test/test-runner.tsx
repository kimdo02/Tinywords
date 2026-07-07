"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GameTop } from "@/components/game-ui";
import { SpeakButton } from "@/components/speak-button";
import { buildChoices, shuffle } from "@/lib/game";
import { recordAnswer } from "@/lib/record";
import { CHOICES_COUNT } from "@/lib/constants";
import type { TtsSettings } from "@/lib/tts";
import type { Word } from "@/types/db";
import { submitTestAction } from "./actions";

interface Props {
  profileId: string;
  words: Word[];
  count: number;
  tts: Partial<TtsSettings>;
}

export function TestRunner({ profileId, words, count, tts }: Props) {
  const questions = useMemo(
    () => shuffle(words).slice(0, Math.min(count, words.length)),
    [words, count],
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState<Word[]>([]);
  const [done, setDone] = useState(false);

  const word = questions[index];
  const choices = useMemo(
    () => (word ? buildChoices(word, words, CHOICES_COUNT) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word?.id],
  );

  async function pick(choice: Word) {
    if (picked) return;
    setPicked(choice.id);
    const isCorrect = choice.id === word.id;
    if (isCorrect) setCorrect((c) => c + 1);
    else setWrong((w) => [...w, word]);
    await recordAnswer(word, isCorrect);
  }

  async function next() {
    if (index + 1 >= questions.length) {
      const finalCorrect = correct;
      const wrongIds = wrong.map((w) => w.id);
      await submitTestAction({
        profileId,
        total: questions.length,
        correct: finalCorrect,
        wrongIds,
      });
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  }

  if (done) {
    const stars =
      questions.length > 0
        ? Math.round((correct / questions.length) * 3)
        : 0;
    return (
      <div className="animate-pop rounded-3xl bg-white p-7 text-center shadow-xl">
        <div className="text-6xl">🏆</div>
        <h2 className="mt-2 text-2xl font-extrabold text-brand">시험 끝!</h2>
        <div className="my-3 text-4xl">
          {"⭐".repeat(stars)}
          <span className="opacity-25">{"⭐".repeat(3 - stars)}</span>
        </div>
        <p className="text-lg font-bold">
          {questions.length}문제 중 {correct}개 정답!
        </p>

        {wrong.length > 0 && (
          <div className="mt-5 text-left">
            <p className="mb-2 font-bold text-foreground/70">틀린 단어</p>
            <ul className="space-y-2">
              {wrong.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between rounded-2xl bg-background px-4 py-2"
                >
                  <span className="font-bold">
                    {w.emoji ? `${w.emoji} ` : ""}
                    {w.term}
                  </span>
                  <span className="text-sm text-foreground/60">{w.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 grid gap-3">
          <Link
            href="/study"
            className="rounded-2xl bg-brand py-3 text-lg font-bold text-white shadow"
          >
            틀린 단어 연습하기 🎮
          </Link>
          <Link
            href="/"
            className="rounded-2xl bg-background py-3 text-lg font-bold text-foreground/70"
          >
            집으로 🏠
          </Link>
        </div>
      </div>
    );
  }

  if (!word) return null;

  return (
    <div>
      <GameTop index={index} total={questions.length} title="시험" />

      <div className="mb-6 flex min-h-[10rem] flex-col items-center justify-center gap-3 rounded-3xl bg-white p-6 text-center shadow-xl">
        <span className="text-4xl font-extrabold text-brand">{word.term}</span>
        <SpeakButton text={word.term} settings={tts} />
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
              {c.meaning}
            </button>
          );
        })}
      </div>

      {picked && (
        <button
          onClick={next}
          className="mt-5 w-full rounded-2xl bg-brand py-4 text-lg font-bold text-white shadow active:scale-[0.98]"
        >
          {index + 1 >= questions.length ? "결과 보기 🏁" : "다음 ▶️"}
        </button>
      )}
    </div>
  );
}
