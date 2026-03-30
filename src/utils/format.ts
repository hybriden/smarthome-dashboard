export function formatValue(value: unknown, units?: string): string {
  if (typeof value === "number") {
    const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
    return units ? `${formatted}${units}` : formatted;
  }
  if (typeof value === "boolean") return value ? "On" : "Off";
  return String(value ?? "—");
}

export function percentToValue(
  percent: number,
  min: number,
  max: number,
  step?: number,
): number {
  const raw = min + (percent / 100) * (max - min);
  if (step) return Math.round(raw / step) * step;
  return Math.round(raw * 100) / 100;
}
