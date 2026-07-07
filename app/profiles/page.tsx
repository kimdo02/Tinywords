import { getProfiles } from "@/lib/data";
import { CreateProfileForm } from "./create-profile-form";
import { selectProfileAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const profiles = await getProfiles();

  return (
    <main className="mx-auto min-h-dvh max-w-md p-6">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-brand">누가 공부할까요?</h1>
        <p className="mt-1 text-sm text-foreground/60">
          아이를 선택하거나 새로 추가하세요.
        </p>
      </header>

      {profiles.length > 0 && (
        <ul className="mb-6 grid grid-cols-2 gap-3">
          {profiles.map((p) => (
            <li key={p.id}>
              <form action={selectProfileAction.bind(null, p.id)}>
                <button
                  type="submit"
                  className="flex w-full flex-col items-center gap-2 rounded-3xl bg-white p-5 shadow-md active:scale-[0.98]"
                >
                  <span className="text-4xl">{p.avatar ?? "🐣"}</span>
                  <span className="font-bold">{p.name}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <CreateProfileForm />
    </main>
  );
}
