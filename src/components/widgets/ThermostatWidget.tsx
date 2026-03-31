import { WidgetWrapper } from "./WidgetWrapper";
import { Slider } from "@/components/controls/Slider";
import { EnumPicker } from "@/components/controls/EnumPicker";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";

/**
 * Circular dial showing current temp vs target temp.
 * - The arc spans 240° (from 150° to 390°/30°).
 * - A background track shows the full range.
 * - A colored arc fills from min to current temp (blue → amber → red).
 * - A glowing notch marks the target temperature.
 */
function ThermostatDial({
  current,
  target,
  min = 5,
  max = 30,
  heating,
}: {
  current: number;
  target: number;
  min?: number;
  max?: number;
  heating: boolean;
}) {
  const cx = 80;
  const cy = 80;
  const r = 62;
  const strokeW = 7;

  // Arc geometry: 240° sweep, starting at 150° (bottom-left)
  const startAngle = 150;
  const sweepDeg = 240;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  function angleForValue(v: number) {
    const pct = Math.max(0, Math.min(1, (v - min) / (max - min)));
    return startAngle + pct * sweepDeg;
  }

  function pointOnArc(angleDeg: number, radius: number) {
    const rad = toRad(angleDeg);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function describeArc(startDeg: number, endDeg: number, radius: number) {
    const start = pointOnArc(startDeg, radius);
    const end = pointOnArc(endDeg, radius);
    const sweep = endDeg - startDeg;
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  const currentAngle = angleForValue(current);
  const targetAngle = angleForValue(target);

  // Color based on current temp relative to target
  const diff = current - target;
  const arcColor = diff >= 0 ? "#c8943e" : "#3b82c8";
  const targetColor = heating ? "#d9534f" : "#c8943e";

  // Track ticks (every 5°C)
  const ticks: { angle: number; label: string; major: boolean }[] = [];
  for (let t = min; t <= max; t += 5) {
    ticks.push({ angle: angleForValue(t), label: `${t}`, major: true });
  }

  // Target notch position
  const targetPt = pointOnArc(targetAngle, r);
  const targetInner = pointOnArc(targetAngle, r - strokeW / 2 - 3);
  const targetOuter = pointOnArc(targetAngle, r + strokeW / 2 + 3);

  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>
        <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b6eb5" />
          <stop offset="50%" stopColor="#c8943e" />
          <stop offset="100%" stopColor="#d9534f" />
        </linearGradient>
        <filter id="targetGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="arcGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background track */}
      <path
        d={describeArc(startAngle, startAngle + sweepDeg, r)}
        stroke="#1e1c19"
        strokeWidth={strokeW}
        strokeLinecap="round"
        fill="none"
      />

      {/* Subtle graduation track */}
      <path
        d={describeArc(startAngle, startAngle + sweepDeg, r)}
        stroke="#2a2622"
        strokeWidth={strokeW - 2}
        strokeLinecap="round"
        fill="none"
      />

      {/* Current temp arc (filled portion) */}
      {current > min && (
        <path
          d={describeArc(startAngle, currentAngle, r)}
          stroke={arcColor}
          strokeWidth={strokeW}
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
          filter="url(#arcGlow)"
        />
      )}

      {/* Tick marks */}
      {ticks.map(({ angle, label, major }) => {
        const inner = pointOnArc(angle, r + strokeW / 2 + 2);
        const outer = pointOnArc(angle, r + strokeW / 2 + (major ? 7 : 4));
        const labelPt = pointOnArc(angle, r + strokeW / 2 + 14);
        return (
          <g key={angle}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#4a4440"
              strokeWidth={major ? 1.5 : 0.8}
              strokeLinecap="round"
            />
            {major && (
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="7"
                fill="#5a5450"
                fontWeight="500"
              >
                {label}
              </text>
            )}
          </g>
        );
      })}

      {/* Target notch — glowing marker on the arc */}
      <line
        x1={targetInner.x}
        y1={targetInner.y}
        x2={targetOuter.x}
        y2={targetOuter.y}
        stroke={targetColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#targetGlow)"
      />
      <circle
        cx={targetPt.x}
        cy={targetPt.y}
        r="4"
        fill={targetColor}
        opacity="0.25"
      />

      {/* Center content */}
      {/* Inner circle bg */}
      <circle cx={cx} cy={cy} r="38" fill="#0c0b0a" opacity="0.6" />

      {/* Current temperature (large) */}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="28"
        fontWeight="700"
        fill="white"
        opacity="0.9"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {current.toFixed(1)}°
      </text>

      {/* Target label */}
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="10"
        fill={targetColor}
        fontWeight="500"
        fontFamily="Inter, system-ui, sans-serif"
      >
        → {target}°
      </text>

      {/* Heating/idle indicator */}
      <text
        x={cx}
        y={cy + 30}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="7"
        fill="#5a5450"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {heating ? "HEATING" : "IDLE"}
      </text>
    </svg>
  );
}

export function ThermostatWidget({ device, customName, onRename }: WidgetProps) {
  const { value: tempValue } = useCapability(device, "measure_temperature");
  const {
    capability: target,
    value: targetValue,
    setValue: setTarget,
  } = useCapability(device, "target_temperature", { debounce: 500 });
  const {
    capability: mode,
    value: modeValue,
    setValue: setMode,
  } = useCapability(device, "thermostat_mode");

  const currentTemp = tempValue as number | undefined;
  const targetTemp = targetValue as number | undefined;
  const modeStr = modeValue as string | undefined;
  const isHeating =
    modeStr === "heat" ||
    (currentTemp != null && targetTemp != null && currentTemp < targetTemp);

  return (
    <WidgetWrapper
      title={customName ?? device.name}
      onRename={onRename}
      subtitle={
        modeStr
          ? `${modeStr.charAt(0).toUpperCase()}${modeStr.slice(1)} mode`
          : undefined
      }
      online={device.online}
      indicator={isHeating ? "on" : "off"}
    >
      {/* Dial */}
      <div className="flex flex-1 min-h-0 items-center justify-center">
        <div className="w-full max-w-[180px]">
          <ThermostatDial
            current={currentTemp ?? 0}
            target={targetTemp ?? 20}
            min={target?.min ?? 5}
            max={target?.max ?? 30}
            heating={isHeating}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="no-drag mt-1 shrink-0 space-y-2">
        {target && (
          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums text-muted">
              {target.min ?? 5}°
            </span>
            <Slider
              value={targetValue as number}
              min={target.min ?? 5}
              max={target.max ?? 30}
              step={target.step ?? 0.5}
              onChange={setTarget}
              disabled={!device.online}
              className="flex-1"
            />
            <span className="text-xs tabular-nums text-muted">
              {target.max ?? 30}°
            </span>
          </div>
        )}
        {mode?.options && (
          <EnumPicker
            options={mode.options}
            value={modeValue as string}
            onChange={setMode}
            disabled={!device.online}
          />
        )}
      </div>
    </WidgetWrapper>
  );
}
