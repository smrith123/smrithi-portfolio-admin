"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";
import { navGroups } from "@/lib/nav";
import { cn } from "./ui";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-full w-[264px] flex-col bg-ink text-cream">
      <div className="px-6 pt-6 pb-4">
        <p className="font-display text-lg font-bold tracking-[0.12em] uppercase">Smrithi</p>
        <p className="mt-0.5 text-[12px] text-cream/55">Content management</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-0">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 pb-1 text-[11px] font-medium tracking-[0.14em] text-cream/40 uppercase">{group.label}</p>
            <ul>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative block rounded-[--radius-control] px-3 py-1 text-[13.5px] transition-colors duration-150",
                        active ? "bg-cream/10 font-medium text-cream" : "text-cream/70 hover:bg-cream/5 hover:text-cream",
                      )}
                    >
                      {active && <span className="absolute top-1 bottom-1 -left-1 w-[3px] rounded-full bg-sand" />}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-cream/10 px-5 py-3.5">
        <p className="truncate text-[13px] font-medium">{user?.name}</p>
        <p className="truncate text-[12px] text-cream/50">{user?.email}</p>
        <button
          type="button"
          onClick={signOut}
          className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] text-cream/70 transition-colors duration-150 hover:text-cream"
        >
          <SignOut size={14} weight="bold" />
          Sign out
        </button>
      </div>
    </div>
  );
}
