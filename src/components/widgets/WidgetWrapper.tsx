import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface WidgetWrapperProps {
  title: string;
  subtitle?: string;
  online: boolean;
  indicator?: "on" | "off" | "alarm";
  children: ReactNode;
  className?: string;
}

export function WidgetWrapper({
  title,
  subtitle,
  online,
  indicator,
  children,
  className,
}: WidgetWrapperProps) {
  return (
    <div
      className={cn(
        "widget-card relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-surface-card p-4",
        !online && "opacity-50",
        className,
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-white/90">
            {title}
          </h3>
          {subtitle && (
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
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
