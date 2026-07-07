import { redirect } from "next/navigation";
import { getUser } from "@/lib/data";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getUser().catch(() => null);
  if (user) redirect("/");

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
