"use client";

import { useCallback, useEffect, useState } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import { ApiError, api } from "@/lib/api";
import type { MediaAsset, MediaKind } from "@/lib/types";
import { DeleteButton, EmptyState, ErrorNote, Skeleton, Toast, cn } from "@/components/ui";
import { ACCEPT_ALL, uploadProblem } from "@/lib/uploads";

const kinds: { value: MediaKind | "all"; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "document", label: "Files" },
];

const readableSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaAsset[] | null>(null);
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ items: MediaAsset[] }>(`/admin/media?limit=100${kind === "all" ? "" : `&kind=${kind}`}`)
      .then((r) => setItems(r.items))
      .catch((e: ApiError) => setError(e.message));
  }, [kind]);

  useEffect(load, [load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const problem = uploadProblem(Array.from(files));
    if (problem) return setError(problem);
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("folder", "media");
      for (const file of Array.from(files)) form.append("files", file);
      const { items } = await api.post<{ items: MediaAsset[] }>("/admin/media", form);
      setToast(`${items.length} ${items.length === 1 ? "file" : "files"} uploaded.`);
      load();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setUploading(false);
    }
  }

  async function remove(asset: MediaAsset) {
    setItems((list) => list?.filter((a) => a._id !== asset._id) ?? null);
    try {
      await api.del(`/admin/media/${asset._id}`);
      setToast("File deleted.");
    } catch (e) {
      setError((e as ApiError).message);
      load();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide uppercase">Media library</h1>
          <p className="mt-1.5 max-w-[68ch] text-sm text-muted">
            Every image, video and file on the website. Deleting a file here does not remove it from a page that still uses it, so
            replace it on the page first.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-[--radius-control] bg-ink px-4 py-2 text-sm font-medium text-cream transition-colors duration-150 hover:bg-ink/90">
          <UploadSimple size={16} weight="bold" />
          {uploading ? "Uploading…" : "Upload files"}
          <input type="file" multiple accept={ACCEPT_ALL} className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files)} />
        </label>
      </header>

      {error && <ErrorNote title={error} />}

      <div className="flex gap-1 self-start rounded-[--radius-control] border border-line bg-surface p-1">
        {kinds.map((k) => (
          <button
            key={k.value}
            type="button"
            onClick={() => setKind(k.value)}
            aria-pressed={kind === k.value}
            className={cn(
              "rounded-[6px] px-3 py-1.5 text-[13px] transition-colors duration-150",
              kind === k.value ? "bg-ink text-cream" : "text-muted hover:bg-sand/35 hover:text-ink",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      {!items && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </ul>
      )}

      {items && items.length === 0 && (
        <EmptyState title="Nothing here yet" description="Upload images, videos or a CV and they will be listed here." />
      )}

      {items && items.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((asset) => (
            <li key={asset._id} className="flex flex-col overflow-hidden rounded-[--radius-panel] border border-line bg-surface">
              <div className="aspect-[4/3] bg-sand/25">
                {asset.kind === "image" ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- CMS media from an arbitrary host */
                  <img src={asset.url} alt={asset.alt ?? ""} className="size-full object-cover" loading="lazy" />
                ) : asset.kind === "video" ? (
                  <video src={asset.url} className="size-full object-cover" muted playsInline preload="metadata" />
                ) : (
                  <span className="flex size-full items-center justify-center font-mono text-[11px] text-muted">PDF</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="truncate text-[13px] font-medium" title={asset.originalName}>
                  {asset.originalName}
                </p>
                <p className="font-mono text-[11px] text-muted">
                  {readableSize(asset.size)}
                  {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <a href={asset.url} target="_blank" rel="noreferrer" className="text-[12px] text-muted underline-offset-2 hover:text-ink hover:underline">
                    Open
                  </a>
                  <DeleteButton onConfirm={() => remove(asset)} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
