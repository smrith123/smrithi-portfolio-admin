"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button, ErrorNote, Field, Input } from "@/components/ui";

type Mode = "sign-in" | "forgot" | "reset";

export default function LoginPage() {
  const { status, signIn } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (status === "signed-in") router.replace("/");
  }, [status, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "sign-in") {
        await signIn(email, password);
        router.replace("/");
      } else if (mode === "forgot") {
        await api.post("/auth/forgot-password", { email });
        setNotice("If that account exists, a six digit code has been sent. Ask your developer for it if email is not set up yet.");
        setMode("reset");
      } else {
        await api.post("/auth/reset-password", { email, code, password });
        setNotice("Password updated. You can sign in now.");
        setCode("");
        setPassword("");
        setMode("sign-in");
      }
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  const heading = mode === "sign-in" ? "Sign in" : mode === "forgot" ? "Reset password" : "Enter your code";

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-7">
          <p className="font-display text-xl font-bold tracking-[0.12em] uppercase">Smrithi</p>
          <p className="mt-1 text-sm text-muted">Content management</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-[--radius-panel] border border-line bg-surface p-6">
          <h1 className="font-display text-[15px] font-bold tracking-wide uppercase">{heading}</h1>

          {notice && <p className="rounded-[--radius-control] bg-mint px-3 py-2 text-[13px]">{notice}</p>}
          {error && <ErrorNote title={error} />}

          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus />
          </Field>

          {mode === "reset" && (
            <Field label="Six digit code" hint="The code expires ten minutes after it was sent.">
              <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} required className="font-mono tracking-[0.3em]" />
            </Field>
          )}

          {mode !== "forgot" && (
            <Field label={mode === "reset" ? "New password" : "Password"} hint={mode === "reset" ? "At least eight characters." : undefined}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "reset" ? "new-password" : "current-password"}
                required
              />
            </Field>
          )}

          <Button type="submit" variant="primary" busy={busy} className="mt-1">
            {mode === "sign-in" ? "Sign in" : mode === "forgot" ? "Send code" : "Update password"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setNotice(null);
              setMode(mode === "sign-in" ? "forgot" : "sign-in");
            }}
            className="text-[13px] text-muted underline-offset-2 transition-colors duration-150 hover:text-ink hover:underline"
          >
            {mode === "sign-in" ? "Forgot your password?" : "Back to sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
