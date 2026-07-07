import Link from "next/link";
import { getSettings } from "@/lib/data";
import { PinForm } from "./pin-form";

export const dynamic = "force-dynamic";

export default async function UnlockPage() {
  const settings = await getSettings();
  const hasPin = Boolean(settings?.pin_hash);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6">
      <PinForm hasPin={hasPin} />
      <Link href="/" className="mt-5 text-sm text-foreground/60 underline">
        ← 아이 화면으로 돌아가기
      </Link>
    </main>
  );
}
