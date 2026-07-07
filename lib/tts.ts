"use client";

import { useCallback, useEffect, useState } from "react";

export interface TtsSettings {
  voiceURI: string | null;
  rate: number;
  pitch: number;
}

const DEFAULTS: TtsSettings = { voiceURI: null, rate: 1, pitch: 1 };

/** 브라우저 Web Speech API 기반 영어 단어 발음 훅 */
export function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  /** 영어(en-*) 음성 목록 */
  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));

  const speak = useCallback(
    (text: string, settings?: Partial<TtsSettings>) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const s = { ...DEFAULTS, ...settings };
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = s.rate;
      u.pitch = s.pitch;
      const all = window.speechSynthesis.getVoices();
      const chosen =
        (s.voiceURI && all.find((v) => v.voiceURI === s.voiceURI)) ||
        all.find((v) => v.lang.toLowerCase().startsWith("en"));
      if (chosen) u.voice = chosen;
      window.speechSynthesis.speak(u);
    },
    [],
  );

  return { speak, voices, englishVoices, supported };
}
