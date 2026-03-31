import { type ReactNode, useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";

interface WidgetWrapperProps {
  title: string;
  subtitle?: string;
  online: boolean;
  indicator?: "on" | "off" | "alarm";
  children: ReactNode;
  className?: string;
  onRename?: (name: string) => void;
}

export function WidgetWrapper({
  title,
  subtitle,
  online,
  indicator,
  children,
  className,
  onRename,
}: WidgetWrapperProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(title);
      // Small delay to ensure the input is rendered
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editing, title]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title && onRename) {
      onRename(trimmed);
    }
    setEditing(false);
  }

  return (
    <div
      className={cn(
        "widget-card relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-surface-card p-3",
        !online && "opacity-50",
        className,
      )}
    >
      <div className="mb-1 shrink-0 flex items-start justify-between">
        <div className="min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              className="no-drag w-full truncate rounded bg-surface-dark/80 px-1.5 py-0.5 text-[15px] font-semibold text-white/90 outline-none ring-1 ring-brand/40 focus:ring-brand/70"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
            />
          ) : (
            <h3
              className={cn(
                "truncate text-[15px] font-semibold text-white/90",
                onRename && "no-drag cursor-pointer rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 transition-colors hover:bg-white/[0.04]",
              )}
              onDoubleClick={() => onRename && setEditing(true)}
              title={onRename ? "Double-click to rename" : undefined}
            >
              {title}
            </h3>
          )}
          {subtitle && !editing && (
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          )}
        </div>
        {indicator && (
          <span
            className={cn(
              "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
              indicator === "on" && "bg-brand shadow-[0_0_8px_rgba(200,148,62,0.4)]",
              indicator === "off" && "bg-muted-dark",
              indicator === "alarm" && "animate-pulse bg-brand-danger shadow-[0_0_8px_rgba(217,83,79,0.4)]",
            )}
          />
        )}
      </div>
      <div className="flex flex-1 min-h-0 flex-col">{children}</div>
    </div>
  );
}
