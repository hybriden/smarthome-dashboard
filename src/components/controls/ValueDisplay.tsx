import { cn } from "@/utils/cn";
import { formatValue } from "@/utils/format";

interface ValueDisplayProps {
  value: unknown;
  units?: string;
  label?: string;
  size?: "sm" | "lg";
  className?: string;
}

export function ValueDisplay({
  value,
  units,
  label,
  size = "lg",
  className,
}: ValueDisplayProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <span
        className={cn(
          "font-bold tabular-nums text-white/90",
          size === "lg" ? "text-3xl" : "text-xl",
        )}
      >
        {formatValue(value, units)}
      </span>
      {label && <span className="mt-0.5 text-xs text-muted">{label}</span>}
    </div>
  );
}
