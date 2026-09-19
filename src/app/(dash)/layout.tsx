"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { Sidebar } from "@/components/Sidebar";
import { PageSkeleton } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "signed-out") router.replace("/login");
  }, [status, router]);

  if (status !== "signed-in") {
    return (
      <div className="mx-auto max-w-[980px] px-6 py-10">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar />
      </aside>

      {/* Mobile: a top bar with a slide-in drawer. */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-cream/95 px-4 py-3 backdrop-blur lg:hidden">
        <p className="font-display text-base font-bold tracking-[0.12em] uppercase">Smrithi</p>
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="rounded p-1.5 hover:bg-sand/40">
          <List size={20} weight="bold" />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-y-0 left-0">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="absolute top-3.5 left-[276px] rounded p-1.5 text-cream"
          >
            <X size={20} weight="bold" />
          </button>
        </div>
      )}

      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-[980px] px-5 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
