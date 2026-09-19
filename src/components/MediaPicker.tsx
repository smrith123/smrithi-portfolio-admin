"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UploadSimple, X } from "@phosphor-icons/react";
import { ApiError, api } from "@/lib/api";
import type { MediaAsset, MediaKind } from "@/lib/types";
import { Button, EmptyState, ErrorNote, Skeleton, cn } from "./ui";
import { ACCEPT, uploadProblem } from "@/lib/uploads";

/**
 * One dialog for both halves of picking a file: upload a new one, or reuse
 * something already in the library. Native <dialog> gives focus trapping,
 * Escape-to-close and the backdrop for free.
 */
export function MediaPicker({
  open,
  kind = "image",
  folder = "media",
  onClose,
  onSelect,
}: {
  open: boolean;
  kind?: MediaKind;
  folder?: string;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    setAssets(null);
    api
      .get<{ items: MediaAsset[] }>(`/admin/media?kind=${kind}&limit=100`)
      .then((r) => setAssets(r.items))
      .catch((e: ApiError) => setError(e.message));
  }, [kind]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      load();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const problem = uploadProblem(Array.from(files));
    if (problem) return setError(problem);
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("folder", folder);
      for (const file of Array.from(files)) form.append("files", file);
      const { items } = await api.post<{ items: MediaAsset[] }>("/admin/media", form);
      if (items[0]) onSelect(items[0]);
      onClose();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setUploading(false);
    }
  }

  const accept = ACCEPT[kind];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(880px,92vw)] rounded-[--radius-panel] border border-line bg-cream p-0 text-ink backdrop:bg-ink/40"
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="font-display text-[15px] font-bold tracking-wide uppercase">
          {kind === "document" ? "Choose a file" : `Choose ${kind === "video" ? "a video" : "an image"}`}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-muted transition-colors hover:text-ink">
          <X size={18} weight="bold" />
        </button>
      </header>

      <div className="flex flex-col gap-4 p-5">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[--radius-control] border border-dashed border-line bg-surface px-4 py-6 text-sm font-medium text-ink transition-colors duration-150 hover:border-ink/40 hover:bg-sand/25">
          <UploadSimple size={17} weight="bold" />
          {uploading ? "Uploading…" : "Upload a new file from your computer"}
          <input type="file" accept={accept} className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files)} />
        </label>

        {error && <ErrorNote title={error} />}

        <div className="max-h-[46vh] overflow-y-auto">
          {!assets && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          )}

          {assets && assets.length === 0 && (
            <EmptyState title="Nothing here yet" description="Upload your first file and it will appear in this library." />
          )}

          {assets && assets.length > 0 && (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {assets.map((asset) => (
                <li key={asset._id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                    title={asset.originalName}
                    className={cn(
                      "group relative block w-full overflow-hidden rounded-[--radius-control] border border-line bg-surface",
                      "aspect-square transition-colors duration-150 hover:border-ink",
                    )}
                  >
                    {asset.kind === "image" ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- library thumbnails, arbitrary remote hosts */
                      <img src={asset.url} alt="" className="size-full object-cover" loading="lazy" />
                    ) : (
                      <span className="flex size-full items-center justify-center px-2 text-center font-mono text-[11px] break-all text-muted">
                        {asset.originalName}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <footer className="flex justify-end border-t border-line px-5 py-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </footer>
    </dialog>
  );
}
