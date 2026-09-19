"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { ApiError, STOREFRONT_URL, api } from "@/lib/api";
import type { SectionDoc } from "@/lib/types";
import { Button, ErrorNote, PageSkeleton, Toast } from "./ui";

/**
 * Every content page in this admin is the same interaction: load one section,
 * edit a draft copy, save it back. That whole lifecycle lives here so the pages
 * themselves only describe their fields.
 */
export function useSection<T>(key: string) {
  const [data, setData] = useState<T | null>(null);
  const [saved, setSaved] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    api
      .get<SectionDoc<T>>(`/admin/sections/${key}`)
      .then((doc) => {
        if (!live) return;
        setData(doc.data);
        setSaved(JSON.stringify(doc.data));
      })
      .catch((e: ApiError) => live && setLoadError(e.message));
    return () => {
      live = false;
    };
  }, [key]);

  const dirty = useMemo(() => data !== null && JSON.stringify(data) !== saved, [data, saved]);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    setSaveError(null);
    try {
      const doc = await api.put<SectionDoc<T>>(`/admin/sections/${key}`, { data });
      setSaved(JSON.stringify(doc.data));
      setToast("Saved. The website is updated.");
    } catch (e) {
      setSaveError(e as ApiError);
    } finally {
      setSaving(false);
    }
  }, [data, key]);

  const reset = useCallback(() => setData(JSON.parse(saved) as T), [saved]);

  /** Shallow patch for top-level fields; nested updates use setData directly. */
  const patch = useCallback((changes: Partial<T>) => setData((d) => (d ? { ...d, ...changes } : d)), []);

  return { data, setData, patch, dirty, save, saving, reset, loadError, saveError, toast, clearToast: () => setToast(null) };
}

export type SectionState<T> = ReturnType<typeof useSection<T>>;

export function SectionShell<T>({
  title,
  description,
  preview,
  state,
  invalid,
  children,
}: {
  title: string;
  description?: string;
  /** Anchor on the public site, so the client can check their edit in context. */
  preview?: string;
  state: SectionState<T>;
  /** Why the draft can't be saved yet; shown in the save bar, which then blocks saving. */
  invalid?: string;
  children: React.ReactNode;
}) {
  const { data, dirty, save, saving, reset, loadError, saveError, toast, clearToast } = state;

  // Guard against closing the tab mid-edit.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (loadError) return <ErrorNote title={loadError} />;
  if (!data) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide uppercase">{title}</h1>
          {description && <p className="mt-1.5 max-w-[68ch] text-sm text-muted">{description}</p>}
        </div>
        {preview && (
          <Link
            href={`${STOREFRONT_URL}${preview}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
          >
            View on site <ArrowSquareOut size={14} weight="bold" />
          </Link>
        )}
      </header>

      {saveError && (
        <ErrorNote
          title={saveError.message}
          messages={saveError.fieldMessages.length ? saveError.fieldMessages : undefined}
        />
      )}

      {children}

      {/* Save bar only appears once something actually changed. */}
      <div
        className={
          "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur transition-transform duration-200 lg:left-[264px] " +
          (dirty ? "translate-y-0" : "translate-y-full")
        }
      >
        <div className="mx-auto flex max-w-[980px] items-center justify-between gap-4 px-6 py-3">
          {invalid ? (
            <p role="alert" className="text-[13px] text-brick">
              {invalid}
            </p>
          ) : (
            <p className="text-[13px] text-muted">You have unsaved changes.</p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={reset} disabled={saving}>
              Discard
            </Button>
            <Button type="button" variant="primary" onClick={save} busy={saving} disabled={Boolean(invalid)}>
              {saving ? "Saving" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={clearToast} />}
    </div>
  );
}
