"use client";

import { useActionState } from "react";
import { setPinAction, verifyPinAction, type PinState } from "./actions";

const initial: PinState = {};

export function PinForm({ hasPin }: { hasPin: boolean }) {
  const action = hasPin ? verifyPinAction : setPinAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-xl">
      <div className="mb-5 text-center">
        <div className="text-4xl">🔒</div>
        <h1 className="mt-2 text-xl font-extrabold">부모 모드</h1>
        <p className="mt-1 text-sm text-foreground/60">
          {hasPin
            ? "PIN 4자리를 입력하세요."
            : "처음이시네요! 사용할 PIN 4자리를 정하세요."}
        </p>
      </div>

      <form action={formAction} className="space-y-3">
        <input
          name="pin"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          required
          autoFocus
          placeholder="••••"
          className="w-full rounded-2xl border border-black/10 bg-background px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-brand"
        />

        {state.error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-brand py-3 text-lg font-bold text-white shadow active:scale-[0.98] disabled:opacity-60"
        >
          {hasPin ? "들어가기" : "PIN 설정하고 들어가기"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-foreground/50">
        PIN을 잊었다면 로그아웃 후 다시 로그인하여 재설정할 수 있어요.
      </p>
    </div>
  );
}
