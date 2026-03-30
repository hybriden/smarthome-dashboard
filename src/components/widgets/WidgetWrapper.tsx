import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { StatusDot } from "@/components/controls/StatusDot";

interface WidgetWrapperProps {
  title: string;
  online: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function WidgetWrapper({
  title,
  online,
  icon,
  children,
  className,
}: WidgetWrapperProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl bg-surface p-4 shadow-lg transition-shadow hover:shadow-xl",
        !online && "opacity-60",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <h3 className="flex-1 truncate text-sm font-medium text-gray-300">
          {title}
        </h3>
        <StatusDot status={online ? "online" : "offline"} />
      </div>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}
