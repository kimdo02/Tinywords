"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_PROFILE_COOKIE } from "@/lib/constants";

const ONE_YEAR = 60 * 60 * 24 * 365;

async function setActive(id: string) {
  const store = await cookies();
  store.set(ACTIVE_PROFILE_COOKIE, id, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
}

export type ProfileState = { error?: string };

export async function createProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const name = String(formData.get("name") ?? "").trim();
  const avatar = String(formData.get("avatar") ?? "🐣");
  if (!name) return { error: "아이 이름을 입력해주세요." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("profiles")
    .insert({ owner: user.id, name, avatar })
    .select("id")
    .single();
  if (error || !data) return { error: "프로필을 만들지 못했어요." };

  await setActive(data.id);
  redirect("/");
}

export async function selectProfileAction(id: string) {
  await setActive(id);
  redirect("/");
}
