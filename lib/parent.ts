import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PARENT_UNLOCKED_COOKIE } from "@/lib/constants";

export async function isParentUnlocked(): Promise<boolean> {
  const store = await cookies();
  return store.get(PARENT_UNLOCKED_COOKIE)?.value === "1";
}

/** 부모 모드 페이지 진입 가드. 잠겨 있으면 PIN 입력 화면으로 이동. */
export async function requireParentUnlocked(): Promise<void> {
  if (!(await isParentUnlocked())) redirect("/parent/unlock");
}
