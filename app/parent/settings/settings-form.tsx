"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTTS } from "@/lib/tts";
import {
  DEFAULT_SESSION_SIZE,
  DEFAULT_TEST_COUNT,
  MAX_TEST_COUNT,
  MIN_TEST_COUNT,
} from "@/lib/constants";
import type { AccountSettings } from "@/types/db";

export function SettingsForm({ initial }: { initial: AccountSettings | null }) {
  const supabase = createClient();
  const { englishVoices, speak, supported } = useTTS();

  const [testCount, setTestCount] = useState(
    initial?.default_test_count ?? DEFAULT_TEST_COUNT,
  );
  const [sessionSize, setSessionSize] = useState(
    initial?.session_size ?? DEFAULT_SESSION_SIZE,
  );
  const [voice, setVoice] = useState(initial?.tts_voice ?? "");
  const [rate, setRate] = useState(initial?.tts_rate ?? 1);
  const [pitch, setPitch] = useState(initial?.tts_pitch ?? 1);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");
      const { error: upErr } = await supabase.from("account_settings").upsert(
        {
          owner: user.id,
          default_test_count: testCount,
          session_size: sessionSize,
          tts_voice: voice || null,
          tts_rate: rate,
          tts_pitch: pitch,
        },
        { onConflict: "owner" },
      );
      if (upErr) throw upErr;
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setBusy(false);
    }
  }

  const testOptions = [];
  for (let i = MIN_TEST_COUNT; i <= MAX_TEST_COUNT; i++) testOptions.push(i);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-5 shadow-md">
        <h2 className="mb-3 text-lg font-bold">테스트 & 학습</h2>

        <label className="mb-1 block text-sm text-foreground/60">
          테스트 문항 수
        </label>
        <select
          value={testCount}
          onChange={(e) => setTestCount(Number(e.target.value))}
          className="mb-4 w-full rounded-2xl border border-black/10 bg-background px-4 py-3"
        >
          {testOptions.map((n) => (
            <option key={n} value={n}>
              {n}문항
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm text-foreground/60">
          게임 한 세션 단어 수: {sessionSize}개
        </label>
        <input
          type="range"
          min={4}
          max={12}
          value={sessionSize}
          onChange={(e) => setSessionSize(Number(e.target.value))}
          className="w-full accent-brand"
        />
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-md">
        <h2 className="mb-3 text-lg font-bold">발음(TTS)</h2>
        {!supported && (
          <p className="text-sm text-foreground/60">
            이 브라우저는 음성 읽어주기를 지원하지 않아요.
          </p>
        )}
        {supported && (
          <>
            <label className="mb-1 block text-sm text-foreground/60">
              원어민 음성
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="mb-4 w-full rounded-2xl border border-black/10 bg-background px-4 py-3"
            >
              <option value="">자동 (기본 영어 음성)</option>
              {englishVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>

            <label className="mb-1 block text-sm text-foreground/60">
              말하기 속도: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mb-4 w-full accent-brand"
            />

            <label className="mb-1 block text-sm text-foreground/60">
              톤(높낮이): {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="mb-4 w-full accent-brand"
            />

            <button
              type="button"
              onClick={() =>
                speak("apple", { voiceURI: voice || null, rate, pitch })
              }
              className="rounded-2xl bg-accent px-4 py-2 font-bold text-white shadow"
            >
              🔊 미리 듣기
            </button>
          </>
        )}
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
          저장했어요! ✅
        </p>
      )}

      <button
        onClick={save}
        disabled={busy}
        className="w-full rounded-2xl bg-brand py-3 text-lg font-bold text-white shadow active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "저장 중…" : "설정 저장"}
      </button>
    </div>
  );
}
