"use client";

import { useTTS, type TtsSettings } from "@/lib/tts";

interface Props {
  text: string;
  settings?: Partial<TtsSettings>;
  size?: "sm" | "lg";
  label?: string;
  className?: string;
}

/** 영어 단어를 소리내어 읽어주는 버튼 (아이용 큰 스피커 버튼) */
export function SpeakButton({ text, settings, size = "lg", label, className }: Props) {
  const { speak, supported } = useTTS();
  if (!supported) return null;

  const sizeCls =
    size === "lg" ? "h-16 w-16 text-3xl" : "h-11 w-11 text-xl";

  return (
    <button
      type="button"
      onClick={() => speak(text, settings)}
      aria-label={label ?? `${text} 발음 듣기`}
      className={`inline-flex items-center justify-center rounded-full bg-accent/90 text-white shadow-md active:scale-95 transition ${sizeCls} ${className ?? ""}`}
    >
      🔊
    </button>
  );
}
