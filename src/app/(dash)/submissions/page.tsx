"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import type { Submission } from "@/lib/types";
import { Button, DeleteButton, EmptyState, ErrorNote, Input, PageSkeleton, Panel, Select, cn } from "@/components/ui";

type Filter = "all" | Submission["status"];

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

export default function SubmissionsPage() {
  const [items, setItems] = useState<Submission[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (filter !== "all") params.set("status", filter);
    if (query.trim()) params.set("q", query.trim());
    api
      .get<{ items: Submission[]; unread: number }>(`/admin/submissions?${params}`)
      .then((r) => {
        setItems(r.items);
        setUnread(r.unread);
      })
      .catch((e: ApiError) => setError(e.message));
  }, [filter, query]);

  useEffect(() => {
    const t = setTimeout(load, query ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  async function setStatus(id: string, status: Submission["status"]) {
    setItems((list) => list?.map((s) => (s._id === id ? { ...s, status } : s)) ?? null);
    await api.patch(`/admin/submissions/${id}`, { status }).catch((e: ApiError) => setError(e.message));
    load();
  }

  async function remove(id: string) {
    setItems((list) => list?.filter((s) => s._id !== id) ?? null);
    await api.del(`/admin/submissions/${id}`).catch((e: ApiError) => setError(e.message));
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-wide uppercase">Contact submissions</h1>
        <p className="mt-1.5 text-sm text-muted">
          {unread > 0 ? `${unread} new ${unread === 1 ? "message" : "messages"} waiting.` : "Everything here has been read."}
        </p>
      </header>

      {error && <ErrorNote title={error} />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-[--radius-control] border border-line bg-surface p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={cn(
                "rounded-[6px] px-3 py-1.5 text-[13px] transition-colors duration-150",
                filter === f.value ? "bg-ink text-cream" : "text-muted hover:bg-sand/35 hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or message"
          className="max-w-[280px]"
        />
      </div>

      {!items && <PageSkeleton />}

      {items && items.length === 0 && (
        <EmptyState
          title="No messages here"
          description={query || filter !== "all" ? "Try a different filter or search." : "Messages sent through the website will appear here."}
        />
      )}

      {items && items.length > 0 && (
        <ul className="flex flex-col gap-4">
          {items.map((s) => (
            <li key={s._id}>
              <Panel className={s.status === "new" ? "border-ink/25" : undefined}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {s.name}
                      {s.status === "new" && <span className="rounded-full bg-mint px-2 py-0.5 text-[11px]">New</span>}
                      {s.status === "archived" && (
                        <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">Archived</span>
                      )}
                    </p>
                    <a href={`mailto:${s.email}`} className="font-mono text-[12px] text-muted underline-offset-2 hover:text-ink hover:underline">
                      {s.email}
                    </a>
                  </div>
                  <time className="font-mono text-[12px] text-muted" dateTime={s.createdAt}>
                    {new Date(s.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </time>
                </div>

                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{s.message}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a href={`mailto:${s.email}?subject=Re: your message`}>
                    <Button size="sm" variant="primary">
                      Reply by email
                    </Button>
                  </a>
                  <Select
                    value={s.status}
                    aria-label="Status"
                    onChange={(e) => setStatus(s._id, e.target.value as Submission["status"])}
                    className="max-w-[150px] py-1.5 text-[13px]"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="archived">Archived</option>
                  </Select>
                  <span className="flex-1" />
                  <DeleteButton onConfirm={() => remove(s._id)} />
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
