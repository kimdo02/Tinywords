import { requireParentUnlocked } from "@/lib/parent";
import { getSettings } from "@/lib/data";
import { ParentNav } from "@/components/parent-nav";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireParentUnlocked();
  const settings = await getSettings();

  return (
    <main className="mx-auto min-h-dvh max-w-md p-5">
      <ParentNav active="settings" />
      <SettingsForm initial={settings} />
    </main>
  );
}
