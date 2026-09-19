"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Image as ImageIcon, Plus, Trash } from "@phosphor-icons/react";
import { MediaPicker } from "@/components/MediaPicker";
import { Button, Field, Input, Textarea, cn } from "@/components/ui";
import { linesToText, textToLines } from "@/lib/heading";
import type { Cta, HeadingLine, MediaAsset, MediaKind } from "@/lib/types";

/* ------------------------------- image field ------------------------------- */

export function ImageField({
  label,
  value,
  onChange,
  onPick,
  hint,
  folder = "media",
  aspect = "aspect-[4/3]",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Receives the whole asset, for fields that also need its dimensions. */
  onPick?: (asset: MediaAsset) => void;
  hint?: string;
  folder?: string;
  aspect?: string;
}) {
  const [picking, setPicking] = useState(false);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <div className="flex min-w-0 items-start gap-3">
        <div className={cn("w-28 shrink-0 overflow-hidden rounded-[--radius-control] border border-line bg-sand/25", aspect)}>
          {value ? (
            /* eslint-disable-next-line @next/next/no-img-element -- CMS media from an arbitrary host */
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-muted">
              <ImageIcon size={20} />
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col items-start gap-2">
          <Button type="button" size="sm" onClick={() => setPicking(true)}>
            {value ? "Replace image" : "Choose image"}
          </Button>
          {hint && <span className="text-[12px] text-muted">{hint}</span>}
          {value && <span className="max-w-full truncate font-mono text-[11px] text-muted">{value.split("/").pop()}</span>}
        </div>
      </div>
      <MediaPicker
        open={picking}
        kind="image"
        folder={folder}
        onClose={() => setPicking(false)}
        onSelect={(asset) => {
          onChange(asset.url);
          onPick?.(asset);
        }}
      />
    </div>
  );
}

/* -------------------------------- file field ------------------------------- */

export function FileField({
  label,
  value,
  onChange,
  kind,
  hint,
  folder,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  kind: MediaKind;
  hint?: string;
  folder: string;
}) {
  const [picking, setPicking] = useState(false);
  const chosen = value && value !== "#";

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={() => setPicking(true)}>
          {chosen ? "Replace file" : "Upload file"}
        </Button>
        {chosen ? (
          <a href={value} target="_blank" rel="noreferrer" className="max-w-full truncate font-mono text-[12px] text-muted underline hover:text-ink">
            {value.split("/").pop()}
          </a>
        ) : (
          <span className="text-[12px] text-muted">No file yet</span>
        )}
        {chosen && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange("#")}>
            Remove
          </Button>
        )}
      </div>
      {hint && <span className="text-[12px] text-muted">{hint}</span>}
      <MediaPicker open={picking} kind={kind} folder={folder} onClose={() => setPicking(false)} onSelect={(a) => onChange(a.url)} />
    </div>
  );
}

/* ------------------------------ heading field ------------------------------ */

export function HeadingField({
  label = "Heading",
  value,
  onChange,
  rows = 3,
  error,
}: {
  label?: string;
  value: HeadingLine[];
  onChange: (lines: HeadingLine[]) => void;
  rows?: number;
  error?: string;
}) {
  return (
    <Field label={label} hint="One line per row. Wrap words in *asterisks* to colour them pink." error={error}>
      <Textarea rows={rows} value={linesToText(value)} onChange={(e) => onChange(textToLines(e.target.value))} spellCheck={false} />
    </Field>
  );
}

/* -------------------------------- cta field -------------------------------- */

export function CtaField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: Cta;
  onChange: (cta: Cta) => void;
  hint?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-3 rounded-[--radius-control] border border-line p-4">
      <legend className="px-1 text-[13px] font-medium">{label}</legend>
      <Field label="Button text">
        <Input value={value.label} onChange={(e) => onChange({ ...value, label: e.target.value })} />
      </Field>
      <Field label="Link" hint={hint ?? "A full https:// address, or an anchor such as #contact"}>
        <Input value={value.href} onChange={(e) => onChange({ ...value, href: e.target.value })} />
      </Field>
    </fieldset>
  );
}

/* --------------------------------- list ----------------------------------- */

/** Add / reorder / remove for any array of content items. */
export function ItemList<T>({
  items,
  onChange,
  renderItem,
  itemTitle,
  create,
  addLabel = "Add item",
  min = 1,
  max,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  itemTitle: (item: T, index: number) => string;
  create?: () => T;
  addLabel?: string;
  min?: number;
  max?: number;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {items.map((item, i) => (
          <li key={i} className="rounded-[--radius-control] border border-line bg-cream/60">
            <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <h3 className="truncate text-[13px] font-medium">{itemTitle(item, i)}</h3>
              <div className="flex shrink-0 items-center gap-1">
                <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  <ArrowUp size={14} weight="bold" />
                </IconButton>
                <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>
                  <ArrowDown size={14} weight="bold" />
                </IconButton>
                <IconButton
                  label="Remove"
                  danger
                  disabled={items.length <= min}
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                >
                  <Trash size={14} weight="bold" />
                </IconButton>
              </div>
            </header>
            <div className="flex flex-col gap-4 p-4">
              {renderItem(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))), i)}
            </div>
          </li>
        ))}
      </ul>

      {create && (!max || items.length < max) && (
        <Button type="button" onClick={() => onChange([...items, create()])} className="self-start">
          <Plus size={14} weight="bold" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

function IconButton({
  label,
  children,
  danger,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; danger?: boolean }) {
  return (
    <button
      {...rest}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "rounded p-1.5 transition-colors duration-150 disabled:opacity-30",
        danger ? "text-brick hover:bg-brick/10" : "text-muted hover:bg-sand/40 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
