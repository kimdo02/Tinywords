import Link from "next/link";
import { lockParentAction } from "@/app/parent/unlock/actions";

export function ParentNav({ active }: { active: "words" | "progress" | "settings" }) {
  const item = (href: string, key: string, label: string) => (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
        active === key ? "bg-brand text-white" : "bg-white text-foreground/70"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="mb-5 flex items-center gap-2">
      {item("/parent/words", "words", "단어")}
      {item("/parent/progress", "progress", "통계")}
      {item("/parent/settings", "settings", "설정")}
      <form action={lockParentAction} className="ml-auto">
        <button
          type="submit"
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-foreground/70 shadow"
        >
          🔒 잠그기
        </button>
      </form>
    </nav>
  );
}
