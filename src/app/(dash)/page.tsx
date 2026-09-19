"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { ApiError, STOREFRONT_URL, api } from "@/lib/api";
import type { Submission } from "@/lib/types";
import { Button, EmptyState, ErrorNote, PageSkeleton, Panel } from "@/components/ui";
import { useAuth } from "@/lib/auth";

interface Overview {
  counts: { images: number; videos: number; newSubmissions: number; totalSubmissions: number };
  lastUpdated: string | null;
  recentSubmissions: Submission[];
}

const shortcuts = [
  { href: "/hero", label: "Hero", note: "Main heading, photo and buttons" },
  { href: "/platforms/instagram", label: "Platforms", note: "Instagram, TikTok and YouTube grids" },
  { href: "/career", label: "CV", note: "Upload the file people download" },
  { href: "/submissions", label: "Submissions", note: "Messages from the contact form" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Overview>("/admin/overview")
      .then(setData)
      .catch((e: ApiError) => setError(e.message));
  }, []);

  if (error) return <ErrorNote title={error} />;
  if (!data) return <PageSkeleton />;

  const stats = [
    { label: "New messages", value: data.counts.newSubmissions },
    { label: "Messages in total", value: data.counts.totalSubmissions },
    { label: "Images", value: data.counts.images },
    { label: "Videos", value: data.counts.videos },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide uppercase">Hello {user?.name}</h1>
          <p className="mt-1.5 text-sm text-muted">
            {data.lastUpdated
              ? `The website was last updated on ${new Date(data.lastUpdated).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}.`
              : "Nothing has been edited yet."}
          </p>
        </div>
        <Link
          href={STOREFRONT_URL}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
        >
          Open the website <ArrowSquareOut size={14} weight="bold" />
        </Link>
      </header>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[--radius-panel] border border-line bg-line sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface px-5 py-4">
            <dt className="text-[12px] text-muted">{stat.label}</dt>
            <dd className="mt-1 font-mono text-2xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <Panel title="Where to start" description="The sidebar follows the order of the website, from the top of the page down.">
        <ul className="grid gap-3 sm:grid-cols-2">
          {shortcuts.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="block rounded-[--radius-control] border border-line px-4 py-3 transition-colors duration-150 hover:border-ink/40 hover:bg-sand/25"
              >
                <span className="block text-sm font-medium">{s.label}</span>
                <span className="mt-0.5 block text-[12px] text-muted">{s.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Latest messages"
        actions={
          <Link href="/submissions">
            <Button size="sm">View all</Button>
          </Link>
        }
      >
        {data.recentSubmissions.length === 0 ? (
          <EmptyState title="No messages yet" description="Anything sent through the contact form on the website will appear here." />
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {data.recentSubmissions.map((s) => (
              <li key={s._id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {s.name}
                    {s.status === "new" && (
                      <span className="ml-2 rounded-full bg-mint px-2 py-0.5 align-middle text-[11px] font-medium">New</span>
                    )}
                  </p>
                  <p className="truncate text-[13px] text-muted">{s.message}</p>
                </div>
                <time className="font-mono text-[12px] text-muted" dateTime={s.createdAt}>
                  {new Date(s.createdAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
