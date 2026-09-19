"use client";

import { useState } from "react";
import { ApiError, api, setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button, ErrorNote, Field, Input, Panel, Toast } from "@/components/ui";

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // The change signs out every other session; keep this one with the fresh token the API returns.
      const { token } = await api.post<{ token?: string }>("/auth/change-password", { currentPassword, password });
      if (token) setToken(token);
      setCurrentPassword("");
      setPassword("");
      setToast("Password changed.");
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-wide uppercase">Settings</h1>
        <p className="mt-1.5 text-sm text-muted">Your account details.</p>
      </header>

      <Panel title="Account">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[12px] text-muted">Name</dt>
            <dd className="text-sm">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted">Email</dt>
            <dd className="font-mono text-sm">{user?.email}</dd>
          </div>
        </dl>
      </Panel>

      <Panel title="Change password">
        <form onSubmit={onSubmit} className="flex max-w-[400px] flex-col gap-4">
          {error && <ErrorNote title={error} />}
          <Field label="Current password">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          <Field label="New password" hint="At least eight characters.">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          <Button type="submit" variant="primary" busy={busy} className="self-start">
            Update password
          </Button>
        </form>
      </Panel>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
