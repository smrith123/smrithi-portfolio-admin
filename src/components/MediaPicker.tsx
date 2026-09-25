"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Trash, UploadSimple, X } from "@phosphor-icons/react";
import { ApiError, api } from "@/lib/api";
import type { MediaAsset, MediaKind } from "@/lib/types";
import { Button, EmptyState, ErrorNote, Skeleton, cn } from "./ui";
import { ACCEPT, uploadProblem } from "@/lib/uploads";

/**
 * One dialog for picking a file: upload a new one, reuse something already in
 * the library, or delete one from it. Native <dialog> gives focus trapping,
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
  /** The file waiting for delete confirmation, shown in the footer. */
  const [confirming, setConfirming] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    setAssets(null);
    setError(null);
    setNotice(null);
    setConfirming(null);
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

  async function remove(asset: MediaAsset) {
    setDeleting(true);
    setError(null);
    try {
      await api.del(`/admin/media/${asset._id}`);
      setAssets((list) => list?.filter((a) => a._id !== asset._id) ?? list);
      setNotice(`Deleted ${asset.originalName}.`);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setDeleting(false);
      setConfirming(null);
    }
  }

  const accept = ACCEPT[kind];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Escape backs out of a pending delete first, and only then closes the dialog.
      onCancel={(e) => {
        if (confirming) {
          e.preventDefault();
          setConfirming(null);
        }
      }}
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
        {notice && !error && <p className="rounded-[--radius-control] bg-mint px-3 py-2 text-[13px]">{notice}</p>}

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
                <li key={asset._id} className="group relative">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                    title={asset.originalName}
                    className={cn(
                      "relative block w-full overflow-hidden rounded-[--radius-control] border bg-surface",
                      "aspect-square transition-[border-color,opacity] duration-150",
                      confirming?._id === asset._id ? "border-brick opacity-60" : "border-line hover:border-ink",
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
                  {/* A sibling, not a child, of the select button: buttons can't nest. Shown on hover or
                      focus with a pointer, always on touch screens, which have no hover. */}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setNotice(null);
                      setConfirming(asset);
                    }}
                    aria-label={`Delete ${asset.originalName}`}
                    title="Delete from the library"
                    disabled={deleting}
                    className={cn(
                      "absolute top-2 right-2 flex size-8 items-center justify-center rounded-[--radius-control] border border-line bg-surface/95 text-muted",
                      "transition-[color,opacity] duration-150 hover:text-brick focus-visible:opacity-100",
                      "opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100",
                      confirming?._id === asset._id && "text-brick opacity-100",
                    )}
                  >
                    <Trash size={15} weight="bold" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {confirming ? (
        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line px-5 py-3">
          <p role="alert" className="min-w-0 text-[13px] text-ink">
            Delete <span className="font-mono break-all">{confirming.originalName}</span>? It is removed for good.
          </p>
          <div className="ml-auto flex shrink-0 gap-2">
            <Button type="button" variant="ghost" onClick={() => setConfirming(null)} disabled={deleting}>
              Keep it
            </Button>
            <Button type="button" variant="danger" onClick={() => remove(confirming)} busy={deleting}>
              {deleting ? "Deleting" : "Delete"}
            </Button>
          </div>
        </footer>
      ) : (
        <footer className="flex justify-end border-t border-line px-5 py-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </footer>
      )}
    </dialog>
  );
}
