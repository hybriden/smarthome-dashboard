import { WidgetWrapper } from "./WidgetWrapper";
import type { WidgetProps } from "./WidgetRegistry";
import { Sun, Zap, TrendingUp } from "lucide-react";

function SolarIllustration({ watts, maxWatts = 5000 }: { watts: number; maxWatts?: number }) {
  const producing = watts > 0;
  const intensity = Math.min(watts / maxWatts, 1);
  const cx = 90;
  const cy = 90;
  const r = 62;

  // Arc geometry — 220° sweep
  const startAngle = 160;
  const sweepDeg = 220;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

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

  const fillAngle = startAngle + intensity * sweepDeg;

  // Sun ray angles
  const rayCount = 12;
  const rays = Array.from({ length: rayCount }, (_, i) => (360 / rayCount) * i);

  return (
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>
        {/* Production arc gradient — green to gold to orange */}
        <linearGradient id="solarArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2d8a4e" />
          <stop offset="40%" stopColor="#5cb85c" />
          <stop offset="70%" stopColor="#c8943e" />
          <stop offset="100%" stopColor="#e8a832" />
        </linearGradient>
        {/* Sun core gradient */}
        <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd475" />
          <stop offset="50%" stopColor="#e8a832" />
          <stop offset="100%" stopColor="#c8943e" />
        </radialGradient>
        {/* Glow filters */}
        <filter id="solarGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sunGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="particleGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background subtle radial */}
      <circle cx={cx} cy={cy} r="85" fill="#0c0b0a" opacity="0.3" />

      {/* Sun illustration in center — only when producing */}
      {producing ? (
        <g>
          {/* Outer sun halo */}
          <circle cx={cx} cy={cy} r={28 + intensity * 6} fill="#c8943e" opacity={0.03 + intensity * 0.05} />
          <circle cx={cx} cy={cy} r={20 + intensity * 4} fill="#e8a832" opacity={0.05 + intensity * 0.08}>
            <animate attributeName="r" values={`${18 + intensity * 4};${22 + intensity * 5};${18 + intensity * 4}`} dur="4s" repeatCount="indefinite" />
          </circle>

          {/* Rotating sun rays */}
          <g opacity={0.15 + intensity * 0.3}>
            <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="60s" repeatCount="indefinite" />
            {rays.map((angle) => {
              const rad = toRad(angle);
              const inner = 16 + intensity * 2;
              const outer = 24 + intensity * 8;
              return (
                <line
                  key={angle}
                  x1={cx + inner * Math.cos(rad)}
                  y1={cy + inner * Math.sin(rad)}
                  x2={cx + outer * Math.cos(rad)}
                  y2={cy + outer * Math.sin(rad)}
                  stroke="#e8a832"
                  strokeWidth={angle % 60 === 0 ? 2 : 1}
                  strokeLinecap="round"
                  opacity={angle % 60 === 0 ? 1 : 0.5}
                />
              );
            })}
          </g>

          {/* Sun core */}
          <circle cx={cx} cy={cy} r={12 + intensity * 2} fill="url(#sunCore)" opacity={0.6 + intensity * 0.4} filter="url(#sunGlow)">
            <animate attributeName="opacity" values={`${0.5 + intensity * 0.3};${0.7 + intensity * 0.3};${0.5 + intensity * 0.3}`} dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Inner bright core */}
          <circle cx={cx} cy={cy} r={5 + intensity * 2} fill="#ffd475" opacity={0.4 + intensity * 0.4} />
        </g>
      ) : (
        <g>
          {/* Moon / inactive state */}
          <circle cx={cx} cy={cy} r="14" fill="#1e1c19" stroke="#2a2622" strokeWidth="1" />
          <circle cx={cx - 4} cy={cy - 3} r="14" fill="#0c0b0a" />
          {/* Stars */}
          {[
            [50, 55], [130, 60], [65, 120], [115, 130], [45, 85], [140, 95],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={0.8 + (i % 3) * 0.3} fill="#c2c2c2" opacity={0.2 + (i % 3) * 0.1}>
              <animate attributeName="opacity" values={`${0.15 + (i % 3) * 0.1};${0.35};${0.15 + (i % 3) * 0.1}`} dur={`${3 + i * 0.7}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}

      {/* Arc track (background) */}
      <path
        d={describeArc(startAngle, startAngle + sweepDeg, r)}
        stroke="#1e1c19"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Arc filled portion */}
      {producing && (
        <path
          d={describeArc(startAngle, fillAngle, r)}
          stroke="url(#solarArcGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          filter="url(#solarGlow)"
        />
      )}

      {/* Tick marks on arc */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const angle = startAngle + pct * sweepDeg;
        const inner = pointOnArc(angle, r + 6);
        const outer = pointOnArc(angle, r + 10);
        return (
          <line
            key={pct}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="#4a4440"
            strokeWidth="1"
            strokeLinecap="round"
          />
        );
      })}

      {/* Arc end cap glow — the leading edge */}
      {producing && (
        <circle
          cx={pointOnArc(fillAngle, r).x}
          cy={pointOnArc(fillAngle, r).y}
          r="5"
          fill="#e8a832"
          opacity={0.3 + intensity * 0.4}
          filter="url(#particleGlow)"
        >
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Floating energy particles when producing */}
      {producing && (
        <g>
          {/* Particles spiraling outward from sun */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i * 72) + 15;
            const rad = toRad(angle);
            const pathStr = `M${cx} ${cy} Q${cx + 25 * Math.cos(rad)} ${cy + 25 * Math.sin(rad)} ${cx + 45 * Math.cos(rad + 0.3)} ${cy + 45 * Math.sin(rad + 0.3)}`;
            return (
              <circle key={i} r={1 + (i % 2) * 0.5} fill="#e8a832" opacity={0.3 + intensity * 0.4} filter="url(#particleGlow)">
                <animateMotion dur={`${3 + i * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.6}s`} path={pathStr} />
                <animate attributeName="opacity" values={`0;${0.4 + intensity * 0.4};0`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.6}s`} />
              </circle>
            );
          })}
        </g>
      )}
    </svg>
  );
}

export function SolarWidget({ device, customName, onRename, onRemove }: WidgetProps) {
  const todayEnergy = device.capabilities.find((c) => c.id === "meter_power");
  const lifetimeEnergy = device.capabilities.find((c) => c.id.startsWith("meter_power."));
  const currentPower = device.capabilities.find((c) => c.id.includes("number1") || (c.units === "W" && c.id !== "meter_power"));

  const watts = (currentPower?.value as number) ?? 0;
  const todayKwh = (todayEnergy?.value as number) ?? 0;
  const lifetimeKwh = (lifetimeEnergy?.value as number) ?? 0;
  const producing = watts > 0;

  return (
    <WidgetWrapper
      title={customName ?? device.name}
      onRename={onRename}
      onRemove={onRemove}
      subtitle={producing ? "Producing" : "Inactive"}
      online={device.online}
      indicator={producing ? "on" : "off"}
    >
      {/* Illustration */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="w-full max-w-[200px]">
          <SolarIllustration watts={watts} />
        </div>
      </div>

      {/* Current power — prominent */}
      <div className="mt-1 shrink-0 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {producing ? (
            <Sun size={16} className="text-brand" />
          ) : (
            <Zap size={16} className="text-muted-dark" />
          )}
          <span className={`text-2xl font-bold tabular-nums ${producing ? "text-white" : "text-muted"}`}>
            {watts >= 1000 ? `${(watts / 1000).toFixed(1)}` : watts.toFixed(0)}
          </span>
          <span className={`text-xs ${producing ? "text-brand-dim" : "text-muted-dark"}`}>
            {watts >= 1000 ? "kW" : "W"}
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-1 shrink-0 flex justify-between rounded-xl bg-surface-dark/60 px-2 py-1.5">
        <div className="flex items-center gap-1.5">
          <Zap size={10} className="text-brand-success" />
          <div>
            <span className="text-[11px] font-medium tabular-nums text-white/80">
              {todayKwh.toFixed(1)}
            </span>
            <span className="ml-0.5 text-[9px] text-muted">kWh</span>
          </div>
        </div>
        <div className="h-auto w-px bg-white/[0.06]" />
        <div className="flex items-center gap-1.5">
          <TrendingUp size={10} className="text-brand" />
          <div>
            <span className="text-[11px] font-medium tabular-nums text-white/80">
              {lifetimeKwh >= 1000 ? `${(lifetimeKwh / 1000).toFixed(1)}` : lifetimeKwh.toFixed(0)}
            </span>
            <span className="ml-0.5 text-[9px] text-muted">
              {lifetimeKwh >= 1000 ? "MWh" : "kWh"}
            </span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
