import { cn } from "@/utils/cn";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 0.01,
  onChange,
  disabled,
  className,
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "w-full",
          disabled && "cursor-not-allowed opacity-50",
        )}
        style={{
          background: `linear-gradient(to right, #c8943e ${percent}%, #2a2622 ${percent}%)`,
        }}
      />
    </div>
  );
}
