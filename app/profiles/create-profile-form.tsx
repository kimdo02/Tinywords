"use client";

import { useActionState, useState } from "react";
import { AVATAR_EMOJIS } from "@/lib/constants";
import { createProfileAction, type ProfileState } from "./actions";

const initial: ProfileState = {};

export function CreateProfileForm() {
  const [avatar, setAvatar] = useState(AVATAR_EMOJIS[0]);
  const [state, formAction, pending] = useActionState(
    createProfileAction,
    initial,
  );

  return (
    <form action={formAction} className="rounded-3xl bg-white p-6 shadow-lg">
      <h2 className="mb-3 text-lg font-bold">새 아이 추가</h2>

      <input type="hidden" name="avatar" value={avatar} />
      <div className="mb-4 flex flex-wrap gap-2">
        {AVATAR_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setAvatar(e)}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition ${
              avatar === e ? "bg-brand/20 ring-2 ring-brand" : "bg-background"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <input
        name="name"
        required
        placeholder="아이 이름 (예: 지우)"
        className="mb-3 w-full rounded-2xl border border-black/10 bg-background px-4 py-3 outline-none focus:border-brand"
      />

      {state.error && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-brand py-3 font-bold text-white shadow active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "만드는 중…" : "추가하기"}
      </button>
    </form>
  );
}
