"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button, ErrorNote, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const { status, signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "signed-in") router.replace("/");
  }, [status, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-7">
          <p className="font-display text-xl font-bold tracking-[0.12em] uppercase">Smrithi</p>
          <p className="mt-1 text-sm text-muted">Content management</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-[--radius-panel] border border-line bg-surface p-6">
          <h1 className="font-display text-[15px] font-bold tracking-wide uppercase">Sign in</h1>

          {error && <ErrorNote title={error} />}

          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus />
          </Field>

          <Field label="Password">
            {/* The toggle sits inside the field's label, so the input names itself. */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-label="Password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition-colors duration-150 hover:text-ink focus-visible:text-ink focus:outline-none"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          <Button type="submit" variant="primary" busy={busy} className="mt-1">
            Sign in
          </Button>
        </form>
      </div>
    </main>
  );
}
