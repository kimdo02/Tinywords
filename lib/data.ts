import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_PROFILE_COOKIE } from "@/lib/constants";
import type { AccountSettings, Profile, Word } from "@/types/db";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
}

/** 쿠키에 저장된 활성 프로필을 반환. 없거나 유효하지 않으면 첫 프로필. */
export async function getActiveProfile(): Promise<Profile | null> {
  const profiles = await getProfiles();
  if (profiles.length === 0) return null;
  const cookieStore = await cookies();
  const id = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value;
  return profiles.find((p) => p.id === id) ?? profiles[0];
}

export async function getSettings(): Promise<AccountSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("account_settings").select("*").maybeSingle();
  return data;
}

export async function getWords(profileId: string): Promise<Word[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("words")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
