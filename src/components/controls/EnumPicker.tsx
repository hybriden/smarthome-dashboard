import { cn } from "@/utils/cn";

interface EnumPickerProps {
  options: { id: string; title: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EnumPicker({ options, value, onChange, disabled }: EnumPickerProps) {
  return (
    <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-surface-dark p-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.id)}
          className={cn(
            "min-h-[32px] flex-1 rounded-lg px-2 py-1 text-xs font-medium transition-all duration-200",
            value === opt.id
              ? "bg-brand/15 text-brand shadow-sm"
              : "text-muted hover:text-white/70",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {opt.title}
        </button>
      ))}
    </div>
  );
}
