"use client";

import { useActionState, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { signInAction, signUpAction, type AuthState } from "./actions";

const initial: AuthState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const action = mode === "in" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-xl">
      <div className="mb-6 text-center">
        <BrandLogo size="xl" className="mx-auto" />
        <p className="mt-2 text-sm text-foreground/60">
          {mode === "in" ? "부모님 로그인" : "부모님 회원가입"}
        </p>
      </div>

      <form action={formAction} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="이메일"
          autoComplete="email"
          className="w-full rounded-2xl border border-black/10 bg-background px-4 py-3 text-base outline-none focus:border-brand"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="비밀번호"
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          className="w-full rounded-2xl border border-black/10 bg-background px-4 py-3 text-base outline-none focus:border-brand"
        />

        {state.error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-brand py-3 text-lg font-bold text-white shadow-md active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "잠시만요…" : mode === "in" ? "로그인" : "회원가입"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "in" ? "up" : "in")}
        className="mt-4 w-full text-center text-sm text-foreground/60 underline"
      >
        {mode === "in"
          ? "처음이신가요? 회원가입"
          : "이미 계정이 있으신가요? 로그인"}
      </button>
    </div>
  );
}
