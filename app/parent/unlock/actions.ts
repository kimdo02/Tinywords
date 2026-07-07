"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hashPin, verifyPin } from "@/lib/pin";
import { PARENT_UNLOCKED_COOKIE } from "@/lib/constants";

export type PinState = { error?: string };

async function unlock() {
  const store = await cookies();
  store.set(PARENT_UNLOCKED_COOKIE, "1", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
}

export async function setPinAction(
  _prev: PinState,
  formData: FormData,
): Promise<PinState> {
  const pin = String(formData.get("pin") ?? "");
  if (!/^\d{4}$/.test(pin)) return { error: "숫자 4자리로 설정해주세요." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("account_settings")
    .upsert({ owner: user.id, pin_hash: hashPin(pin) }, { onConflict: "owner" });
  if (error) return { error: "PIN을 저장하지 못했어요." };

  await unlock();
  redirect("/parent/words");
}

export async function verifyPinAction(
  _prev: PinState,
  formData: FormData,
): Promise<PinState> {
  const pin = String(formData.get("pin") ?? "");
  const supabase = await createClient();
  const { data } = await supabase
    .from("account_settings")
    .select("pin_hash")
    .maybeSingle();

  if (!data?.pin_hash) return { error: "먼저 PIN을 설정해주세요." };
  if (!verifyPin(pin, data.pin_hash))
    return { error: "PIN이 맞지 않아요. 다시 입력해주세요." };

  await unlock();
  redirect("/parent/words");
}

export async function lockParentAction() {
  const store = await cookies();
  store.delete(PARENT_UNLOCKED_COOKIE);
  redirect("/");
}
