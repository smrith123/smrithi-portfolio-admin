"use client";

import { useEffect, useRef, useState } from "react";
import { CircleNotch, Warning } from "@phosphor-icons/react";

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/* --------------------------------- button --------------------------------- */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  busy?: boolean;
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-ink text-cream hover:bg-ink/90 disabled:bg-ink/40",
  secondary: "bg-surface text-ink border border-line hover:border-ink/40 hover:bg-sand/25",
  ghost: "text-ink hover:bg-sand/35",
  danger: "text-brick border border-brick/35 hover:bg-brick hover:text-white",
};

export function Button({ variant = "secondary", size = "md", busy, className, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || busy}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[--radius-control] font-medium transition-colors duration-150",
        "active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "px-3 py-1.5 text-[13px]" : "px-4 py-2 text-sm",
        variants[variant],
        className,
      )}
    >
      {busy && <CircleNotch size={15} weight="bold" className="animate-spin" />}
      {children}
    </button>
  );
}

/* --------------------------------- surfaces -------------------------------- */

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[--radius-panel] border border-line bg-surface", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="font-display text-[15px] font-bold tracking-wide uppercase">{title}</h2>}
            {description && <p className="mt-1 max-w-[62ch] text-[13px] text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ---------------------------------- fields --------------------------------- */

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint && !error && <span className="text-[12px] text-muted">{hint}</span>}
      {error && (
        <span className="flex items-center gap-1 text-[12px] text-brick">
          <Warning size={13} weight="fill" />
          {error}
        </span>
      )}
    </label>
  );
}

const control =
  "w-full rounded-[--radius-control] border border-line bg-surface px-3 py-2 text-sm text-ink " +
  "placeholder:text-muted/70 transition-colors duration-150 focus:border-ink focus:outline-none";

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={cn(control, props.className)} />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={cn(control, "min-h-[96px] resize-y leading-relaxed", props.className)} />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={cn(control, "cursor-pointer", props.className)} />
);

/* ---------------------------------- states --------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[--radius-control] bg-sand/45", className)} />;
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-[220px] w-full" />
      <Skeleton className="h-[160px] w-full" />
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[--radius-panel] border border-dashed border-line px-6 py-12 text-center">
      <p className="font-display text-base font-bold">{title}</p>
      <p className="max-w-[46ch] text-[13px] text-muted">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorNote({ title, messages }: { title: string; messages?: string[] }) {
  return (
    <div role="alert" className="rounded-[--radius-control] border border-brick/30 bg-brick/5 px-4 py-3">
      <p className="flex items-center gap-2 text-[13px] font-medium text-brick">
        <Warning size={15} weight="fill" />
        {title}
      </p>
      {messages && messages.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 pl-6 text-[12px] text-brick/90">
          {messages.map((m) => (
            <li key={m} className="list-disc font-mono">
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------- feedback -------------------------------- */

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[--radius-control] border border-ink/10 bg-mint px-4 py-2.5 text-[13px] font-medium text-ink shadow-[0_8px_24px_rgba(50,48,43,0.14)]"
    >
      {message}
    </div>
  );
}

/** Two-step delete: the first click arms it, the second confirms. */
export function DeleteButton({ onConfirm, label = "Delete", size = "sm" }: { onConfirm: () => void; label?: string; size?: "sm" | "md" }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <Button
      type="button"
      size={size}
      variant="danger"
      onClick={() => {
        if (armed) return onConfirm();
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 3500);
      }}
    >
      {armed ? "Tap again to confirm" : label}
    </Button>
  );
}
