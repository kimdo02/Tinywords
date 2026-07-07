"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { downscaleToBlob } from "@/lib/image";
import type { Word } from "@/types/db";

interface Props {
  profileId: string;
  initial?: Word | null;
}

export function WordForm({ profileId, initial }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const editing = Boolean(initial);
  const fileRef = useRef<HTMLInputElement>(null);

  const [term, setTerm] = useState(initial?.term ?? "");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [altMeanings, setAltMeanings] = useState(
    (initial?.alt_meanings ?? []).join(", "),
  );
  const [example, setExample] = useState(initial?.example ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");

  // 이미지 상태
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSrc =
    generatedImage ??
    filePreview ??
    (!removeImage ? (initial?.image_url ?? null) : null);

  function onPickFile(file: File | null) {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setImageFile(file);
    setFilePreview(file ? URL.createObjectURL(file) : null);
    setGeneratedImage(null);
    setRemoveImage(false);
  }

  function clearImage() {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setImageFile(null);
    setFilePreview(null);
    setGeneratedImage(null);
    setRemoveImage(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function generate() {
    if (!term.trim()) {
      setGenError("영어 단어를 먼저 입력해주세요.");
      return;
    }
    setGenError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: term.trim(), meaning: meaning.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "그림 생성에 실패했어요.");
      if (filePreview) URL.revokeObjectURL(filePreview);
      setImageFile(null);
      setFilePreview(null);
      setRemoveImage(false);
      setGeneratedImage(data.image);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "그림 생성에 실패했어요.");
    } finally {
      setGenerating(false);
    }
  }

  async function uploadImage(): Promise<string | null> {
    const source: string | Blob | null = generatedImage ?? imageFile;
    if (!source) return null;
    const blob = await downscaleToBlob(source, 512);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");
    const path = `${user.id}/${crypto.randomUUID()}.png`;
    const { error: upErr } = await supabase.storage
      .from("word-images")
      .upload(path, blob, { upsert: true, contentType: "image/png" });
    if (upErr) throw upErr;
    return supabase.storage.from("word-images").getPublicUrl(path).data.publicUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!term.trim() || !meaning.trim()) {
      setError("영어 단어와 대표 뜻은 꼭 입력해주세요.");
      return;
    }

    setBusy(true);
    try {
      // 새 등록 시 중복 단어 확인
      if (!editing) {
        const { data: dup } = await supabase
          .from("words")
          .select("id")
          .eq("profile_id", profileId)
          .ilike("term", term.trim())
          .limit(1);
        if (dup && dup.length > 0) {
          const ok = window.confirm(
            `"${term.trim()}" 은(는) 이미 등록되어 있어요. 그래도 추가할까요?`,
          );
          if (!ok) {
            setBusy(false);
            return;
          }
        }
      }

      const hasNewImage = Boolean(generatedImage || imageFile);
      let imagePatch: { image_url?: string | null } = {};
      if (hasNewImage) {
        imagePatch = { image_url: await uploadImage() };
      } else if (removeImage) {
        imagePatch = { image_url: null };
      }

      const base = {
        profile_id: profileId,
        term: term.trim(),
        meaning: meaning.trim(),
        alt_meanings: altMeanings
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        example: example.trim() || null,
        category: category.trim() || null,
      };

      if (editing && initial) {
        const { error: upErr } = await supabase
          .from("words")
          .update({ ...base, ...imagePatch })
          .eq("id", initial.id);
        if (upErr) throw upErr;
      } else {
        const { error: insErr } = await supabase
          .from("words")
          .insert({ ...base, ...imagePatch });
        if (insErr) throw insErr;
      }

      router.push("/parent/words");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
      setBusy(false);
    }
  }

  async function del() {
    if (!initial) return;
    if (!window.confirm("이 단어를 삭제할까요?")) return;
    setBusy(true);
    const { error: delErr } = await supabase
      .from("words")
      .delete()
      .eq("id", initial.id);
    if (delErr) {
      setError("삭제에 실패했어요.");
      setBusy(false);
      return;
    }
    router.push("/parent/words");
    router.refresh();
  }

  const field =
    "w-full rounded-2xl border border-black/10 bg-background px-4 py-3 outline-none focus:border-brand";

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="space-y-3 rounded-3xl bg-white p-5 shadow-md">
        <input
          className={field}
          placeholder="영어 단어 * (예: apple)"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <input
          className={field}
          placeholder="대표 뜻 * (예: 사과)"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
        />
        <input
          className={field}
          placeholder="추가 뜻 (쉼표로 구분, 선택)"
          value={altMeanings}
          onChange={(e) => setAltMeanings(e.target.value)}
        />
        <input
          className={field}
          placeholder="예문 (선택, 예: I eat an apple.)"
          value={example}
          onChange={(e) => setExample(e.target.value)}
        />
        <input
          className={field}
          placeholder="카테고리 (선택, 예: 과일)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      {/* 그림 선택 (선택 사항) */}
      <div className="rounded-3xl bg-white p-5 shadow-md">
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="font-bold">그림 (선택)</h3>
          <span className="text-xs text-foreground/50">
            없으면 뜻으로 학습해요
          </span>
        </div>
        <p className="mb-3 text-xs text-foreground/50">
          단어와 뜻을 입력한 뒤 “AI 그림 만들기”를 누르면 아이용 그림을 만들어줘요.
        </p>

        <div className="flex gap-4">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/10 bg-background">
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt="단어 그림 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="px-2 text-center text-xs text-foreground/40">
                그림 없음
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <button
              type="button"
              onClick={generate}
              disabled={generating}
              className="rounded-2xl bg-accent px-3 py-2.5 text-sm font-bold text-white shadow active:scale-95 disabled:opacity-60"
            >
              {generating
                ? "그리는 중…"
                : previewSrc
                  ? "✨ 다시 만들기"
                  : "✨ AI 그림 만들기"}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-2xl bg-background px-3 py-2.5 text-sm font-bold text-foreground/70"
            >
              직접 올리기
            </button>
            {previewSrc && (
              <button
                type="button"
                onClick={clearImage}
                className="rounded-2xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-500"
              >
                그림 빼기
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />
        {genError && <p className="mt-2 text-xs text-red-500">{genError}</p>}
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
          className="flex-1 rounded-2xl bg-brand py-3.5 text-lg font-bold text-white shadow active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "저장 중…" : editing ? "수정 저장" : "단어 추가"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={del}
            disabled={busy}
            className="rounded-2xl bg-red-50 px-5 py-3.5 font-bold text-red-500"
          >
            삭제
          </button>
        )}
      </div>
    </form>
  );
}
