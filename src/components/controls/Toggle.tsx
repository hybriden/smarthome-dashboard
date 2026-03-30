import { cn } from "@/utils/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function Toggle({ checked, onChange, disabled, size = "md" }: ToggleProps) {
  const dims = size === "sm" ? "h-7 w-12" : "h-9 w-16";
  const dot = size === "sm" ? "h-5 w-5" : "h-7 w-7";
  const translate = size === "sm" ? "translate-x-5" : "translate-x-7";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200",
        dims,
        checked ? "bg-accent" : "bg-surface-light",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white shadow-md transition-transform duration-200",
          dot,
          "m-1",
          checked ? translate : "translate-x-0",
        )}
      />
    </button>
  );
}
