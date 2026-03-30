import { cn } from "@/utils/cn";

interface StatusDotProps {
  status: "online" | "offline" | "alarm";
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        status === "online" && "bg-brand-success shadow-[0_0_6px_rgba(92,184,92,0.4)]",
        status === "offline" && "bg-muted-dark",
        status === "alarm" && "animate-pulse bg-brand-danger shadow-[0_0_6px_rgba(217,83,79,0.4)]",
        className,
      )}
    />
  );
}
