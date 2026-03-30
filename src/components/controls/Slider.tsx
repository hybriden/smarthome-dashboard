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
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-light",
          "[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md",
          "[&::-webkit-slider-thumb]:active:scale-110",
          disabled && "cursor-not-allowed opacity-50",
        )}
        style={{
          background: `linear-gradient(to right, #3b82f6 ${percent}%, #334155 ${percent}%)`,
        }}
      />
    </div>
  );
}
