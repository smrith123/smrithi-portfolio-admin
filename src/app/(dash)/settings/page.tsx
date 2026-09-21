"use client";

import { useAuth } from "@/lib/auth";
import { Panel } from "@/components/ui";

export default function SettingsPage() {
  const { user } = useAuth();

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
        <p className="mt-4 text-[13px] text-muted">
          Sign-in details are set on the server. Ask your developer to change them.
        </p>
      </Panel>
    </div>
  );
}
