import { cn } from "@/utils/cn";

interface EnumPickerProps {
  options: { id: string; title: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EnumPicker({ options, value, onChange, disabled }: EnumPickerProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-surface-dark p-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.id)}
          className={cn(
            "min-h-[36px] flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            value === opt.id
              ? "bg-accent text-white"
              : "text-gray-400 hover:text-white",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {opt.title}
        </button>
      ))}
    </div>
  );
}
