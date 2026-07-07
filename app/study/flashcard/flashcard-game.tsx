"use client";

import { useMemo, useState } from "react";
import { GameDone, GameTop } from "@/components/game-ui";
import { SpeakButton } from "@/components/speak-button";
import { selectStudyWords } from "@/lib/game";
import { recordAnswer } from "@/lib/record";
import type { TtsSettings } from "@/lib/tts";
import type { Word } from "@/types/db";

interface Props {
  words: Word[];
  sessionSize: number;
  tts: Partial<TtsSettings>;
}

export function FlashcardGame({ words, sessionSize, tts }: Props) {
  const [round, setRound] = useState(0);
  const session = useMemo(
    () => selectStudyWords(words, sessionSize),
    // round이 바뀔 때마다 새 세션 구성
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const word = session[index];

  // 이미지가 있으면 카드마다 랜덤으로 "이미지" 또는 "한글 뜻"만 공개.
  // 이미지가 없으면 항상 한글 뜻.
  const showImage = useMemo(
    () => Boolean(word?.image_url) && Math.random() < 0.5,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word?.id, round],
  );

  async function answer(known: boolean) {
    if (!word) return;
    if (known) setCorrect((c) => c + 1);
    await recordAnswer(word, known);
    if (index + 1 >= session.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  function retry() {
    setRound((r) => r + 1);
    setIndex(0);
    setFlipped(false);
    setCorrect(0);
    setDone(false);
  }

  if (done) {
    return <GameDone correct={correct} total={session.length} onRetry={retry} />;
  }
  if (!word) return null;

  return (
    <div>
      <GameTop index={index} total={session.length} title="카드 뒤집기" />

      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setFlipped((f) => !f);
        }}
        className="animate-pop flex min-h-[22rem] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl bg-white p-6 text-center shadow-xl active:scale-[0.99]"
      >
        {!flipped ? (
          <>
            <span className="text-5xl font-extrabold text-brand">{word.term}</span>
            <span onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={word.term} settings={tts} />
            </span>
            <span className="text-sm text-foreground/40">카드를 눌러 뜻을 봐요</span>
          </>
        ) : (
          showImage && word.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={word.image_url}
              alt={word.term}
              className="h-52 w-52 rounded-3xl object-cover"
            />
          ) : (
            <>
              <span className="text-6xl font-extrabold">{word.meaning}</span>
              {word.example && (
                <span className="text-sm text-foreground/60">{word.example}</span>
              )}
            </>
          )
        )}
      </div>

      {flipped && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => answer(false)}
            className="rounded-2xl bg-white py-4 text-lg font-bold text-foreground/70 shadow active:scale-[0.98]"
          >
            아직이에요
          </button>
          <button
            onClick={() => answer(true)}
            className="rounded-2xl bg-brand py-4 text-lg font-bold text-white shadow active:scale-[0.98]"
          >
            알아요! ⭐
          </button>
        </div>
      )}
    </div>
  );
}
