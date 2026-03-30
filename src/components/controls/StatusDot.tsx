import { cn } from "@/utils/cn";

interface StatusDotProps {
  status: "online" | "offline" | "alarm";
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full",
        status === "online" && "bg-accent-success",
        status === "offline" && "bg-gray-500",
        status === "alarm" && "animate-pulse bg-accent-danger",
        className,
      )}
    />
  );
}
