import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * 단어/뜻을 바탕으로 아이용 카드 그림을 OpenAI 이미지 API로 생성.
 * 서버에서만 OPENAI_API_KEY 를 사용하며, base64 이미지를 반환한다.
 */
export async function POST(req: Request) {
  // 로그인한 부모만 사용 가능
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 설정되어 있지 않아요." },
      { status: 400 },
    );
  }

  let term = "";
  let meaning = "";
  try {
    const body = await req.json();
    term = String(body.term ?? "").trim();
    meaning = String(body.meaning ?? "").trim();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  if (!term) {
    return NextResponse.json({ error: "단어를 먼저 입력해주세요." }, { status: 400 });
  }

  const prompt = `A simple, cute, colorful cartoon illustration of "${term}"${
    meaning ? ` (meaning: ${meaning})` : ""
  } for a young child's vocabulary flashcard. Single clear object, centered, flat plain white background, friendly kawaii style, thick soft outlines, no text, no letters, no words.`;

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "low",
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("OpenAI image error:", detail);
      return NextResponse.json(
        { error: "그림 생성에 실패했어요. 잠시 후 다시 시도해주세요." },
        { status: 502 },
      );
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "그림 데이터를 받지 못했어요." },
        { status: 502 },
      );
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "그림 생성 중 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
