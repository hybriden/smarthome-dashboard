import { cn } from "@/utils/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function Toggle({ checked, onChange, disabled, size = "md" }: ToggleProps) {
  const dims = size === "sm" ? "h-6 w-11" : "h-8 w-14";
  const dot = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  const translate = size === "sm" ? "translate-x-5" : "translate-x-6";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full border transition-all duration-300",
        dims,
        checked
          ? "border-brand/30 bg-brand/20"
          : "border-white/[0.06] bg-surface-dark",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full shadow-sm transition-all duration-300",
          dot,
          "m-1",
          checked
            ? `${translate} bg-brand shadow-[0_0_8px_rgba(200,148,62,0.3)]`
            : "translate-x-0 bg-muted-dark",
        )}
      />
    </button>
  );
}
