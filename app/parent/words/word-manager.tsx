"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SpeakButton } from "@/components/speak-button";
import type { Word } from "@/types/db";

interface Props {
  profileId: string;
  initialWords: Word[];
}

interface FormValues {
  term: string;
  meaning: string;
  altMeanings: string;
  example: string;
  emoji: string;
  category: string;
}

const EMPTY: FormValues = {
  term: "",
  meaning: "",
  altMeanings: "",
  example: "",
  emoji: "",
  category: "",
};

export function WordManager({ profileId, initialWords }: Props) {
  const supabase = createClient();
  const [words, setWords] = useState<Word[]>(initialWords);
  const [form, setForm] = useState<FormValues>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");
    const ext = imageFile.name.split(".").pop() ?? "png";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("word-images")
      .upload(path, imageFile, { upsert: true });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("word-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.term.trim() || !form.meaning.trim()) {
      setError("영어 단어와 대표 뜻은 꼭 입력해주세요.");
      return;
    }

    const duplicate = words.find(
      (w) =>
        w.id !== editingId &&
        w.term.trim().toLowerCase() === form.term.trim().toLowerCase(),
    );
    if (duplicate && !editingId) {
      const ok = window.confirm(
        `"${form.term}" 은(는) 이미 등록되어 있어요. 그래도 추가할까요?`,
      );
      if (!ok) return;
    }

    setBusy(true);
    try {
      const imageUrl = await uploadImage();
      const payload = {
        profile_id: profileId,
        term: form.term.trim(),
        meaning: form.meaning.trim(),
        alt_meanings: form.altMeanings
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        example: form.example.trim() || null,
        emoji: form.emoji.trim() || null,
        category: form.category.trim() || null,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      };

      if (editingId) {
        const { data, error: upErr } = await supabase
          .from("words")
          .update(payload)
          .eq("id", editingId)
          .select("*")
          .single();
        if (upErr) throw upErr;
        setWords((prev) => prev.map((w) => (w.id === editingId ? (data as Word) : w)));
      } else {
        const { data, error: insErr } = await supabase
          .from("words")
          .insert(payload)
          .select("*")
          .single();
        if (insErr) throw insErr;
        setWords((prev) => [data as Word, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(w: Word) {
    setEditingId(w.id);
    setForm({
      term: w.term,
      meaning: w.meaning,
      altMeanings: (w.alt_meanings ?? []).join(", "),
      example: w.example ?? "",
      emoji: w.emoji ?? "",
      category: w.category ?? "",
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!window.confirm("이 단어를 삭제할까요?")) return;
    const { error: delErr } = await supabase.from("words").delete().eq("id", id);
    if (delErr) {
      setError("삭제에 실패했어요.");
      return;
    }
    setWords((prev) => prev.filter((w) => w.id !== id));
    if (editingId === id) resetForm();
  }

  const field =
    "w-full rounded-2xl border border-black/10 bg-background px-4 py-3 outline-none focus:border-brand";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-md">
        <h2 className="mb-3 text-lg font-bold">
          {editingId ? "단어 수정" : "새 단어 추가"}
        </h2>
        <div className="space-y-3">
          <input
            className={field}
            placeholder="영어 단어 * (예: apple)"
            value={form.term}
            onChange={(e) => setForm({ ...form, term: e.target.value })}
          />
          <input
            className={field}
            placeholder="대표 뜻 * (예: 사과)"
            value={form.meaning}
            onChange={(e) => setForm({ ...form, meaning: e.target.value })}
          />
          <input
            className={field}
            placeholder="추가 뜻 (쉼표로 구분, 선택)"
            value={form.altMeanings}
            onChange={(e) => setForm({ ...form, altMeanings: e.target.value })}
          />
          <input
            className={field}
            placeholder="예문 (선택, 예: I eat an apple.)"
            value={form.example}
            onChange={(e) => setForm({ ...form, example: e.target.value })}
          />
          <div className="flex gap-3">
            <input
              className={`${field} flex-1`}
              placeholder="이모지 (선택 🍎)"
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            />
            <input
              className={`${field} flex-1`}
              placeholder="카테고리 (선택)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground/60">
              이미지 (선택)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-2xl bg-brand py-3 font-bold text-white shadow active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? "저장 중…" : editingId ? "수정 저장" : "추가하기"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl bg-background px-4 py-3 font-bold text-foreground/70"
              >
                취소
              </button>
            )}
          </div>
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-lg font-bold">
          등록된 단어 <span className="text-brand">{words.length}</span>
        </h2>
        {words.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-center text-sm text-foreground/60 shadow">
            아직 등록된 단어가 없어요. 위에서 추가해보세요!
          </p>
        ) : (
          <ul className="space-y-2">
            {words.map((w) => (
              <li
                key={w.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow"
              >
                <span className="text-2xl">
                  {w.emoji ?? (w.image_url ? "🖼️" : "🔤")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{w.term}</span>
                    <SpeakButton text={w.term} size="sm" />
                    {w.status === "mastered" && <span title="다 외움">⭐</span>}
                  </div>
                  <div className="truncate text-sm text-foreground/60">
                    {w.meaning}
                    {w.wrong_count > 0 && (
                      <span className="ml-2 text-red-500">
                        틀림 {w.wrong_count}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => startEdit(w)}
                  className="rounded-xl bg-background px-3 py-2 text-sm font-bold"
                >
                  수정
                </button>
                <button
                  onClick={() => remove(w.id)}
                  className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
