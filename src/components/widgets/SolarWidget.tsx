import { WidgetWrapper } from "./WidgetWrapper";
import type { WidgetProps } from "./WidgetRegistry";

function SolarIllustration({ watts }: { watts: number }) {
  const producing = watts > 0;
  const intensity = Math.min(watts / 3000, 1); // normalize to 0-1 for 3kW system

  return (
    <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="skyGrad2" x1="80" y1="0" x2="80" y2="100">
          <stop offset="0%" stopColor={producing ? "#1a2a3a" : "#0c0b0a"} />
          <stop offset="100%" stopColor="#0c0b0a" />
        </linearGradient>
      </defs>

      {/* Sun */}
      {producing && (
        <g>
          {/* Sun glow */}
          <circle cx="130" cy="20" r="25" fill="#c8943e" fillOpacity={0.06 + intensity * 0.1} />
          <circle cx="130" cy="20" r="15" fill="#c8943e" fillOpacity={0.1 + intensity * 0.15} />
          {/* Sun body */}
          <circle cx="130" cy="20" r="8" fill="#c8943e" fillOpacity={0.4 + intensity * 0.4}>
            <animate attributeName="fillOpacity" values={`${0.4 + intensity * 0.3};${0.6 + intensity * 0.4};${0.4 + intensity * 0.3}`} dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const r = (angle * Math.PI) / 180;
            return (
              <line
                key={angle}
                x1={130 + 11 * Math.cos(r)}
                y1={20 + 11 * Math.sin(r)}
                x2={130 + 14 * Math.cos(r)}
                y2={20 + 14 * Math.sin(r)}
                stroke="#c8943e"
                strokeWidth="1"
                strokeLinecap="round"
                opacity={0.3 + intensity * 0.5}
              />
            );
          })}
        </g>
      )}

      {/* Stars when not producing */}
      {!producing && (
        <g opacity="0.3">
          <circle cx="30" cy="15" r="1" fill="#c2c2c2" />
          <circle cx="70" cy="10" r="0.8" fill="#c2c2c2" />
          <circle cx="110" cy="20" r="1.2" fill="#c2c2c2" />
          <circle cx="140" cy="12" r="0.6" fill="#c2c2c2" />
        </g>
      )}

      {/* Ground line */}
      <line x1="0" y1="88" x2="160" y2="88" stroke="#2a2622" strokeWidth="1" />

      {/* Solar panel - angled */}
      <g transform="translate(25, 40)">
        {/* Panel frame */}
        <path
          d="M0 40 L20 8 L100 8 L80 40 Z"
          fill="#1e1c19"
          stroke={producing ? "#c8943e" : "#2a2622"}
          strokeWidth="1.5"
        />

        {/* Panel cells - 3x2 grid */}
        {[0, 1, 2].map((col) =>
          [0, 1].map((row) => {
            const x = 6 + col * 25 + row * -5;
            const y = 12 + row * 14;
            return (
              <rect
                key={`${col}-${row}`}
                x={x}
                y={y}
                width="22"
                height="12"
                rx="1"
                fill={producing ? `rgba(200, 148, 62, ${0.08 + intensity * 0.15})` : "#151412"}
                stroke={producing ? "#c8943e" : "#2a2622"}
                strokeWidth="0.5"
                opacity={producing ? 0.6 + intensity * 0.4 : 0.4}
              />
            );
          }),
        )}

        {/* Panel support pole */}
        <line x1="50" y1="40" x2="50" y2="48" stroke="#2a2622" strokeWidth="3" />
        <rect x="42" y="46" width="16" height="3" rx="1" fill="#2a2622" />
      </g>

      {/* Energy flow arrows when producing */}
      {producing && (
        <g>
          {/* Animated energy dots flowing from panel to house */}
          <circle cx="0" cy="0" r="2" fill="#c8943e" opacity="0.6">
            <animateMotion dur="2s" repeatCount="indefinite" path="M95 55 Q110 50 125 65 Q135 75 140 85" />
          </circle>
          <circle cx="0" cy="0" r="1.5" fill="#c8943e" opacity="0.4">
            <animateMotion dur="2s" repeatCount="indefinite" begin="0.7s" path="M95 55 Q110 50 125 65 Q135 75 140 85" />
          </circle>
        </g>
      )}
    </svg>
  );
}

export function SolarWidget({ device }: WidgetProps) {
  // Find capabilities
  const todayEnergy = device.capabilities.find((c) => c.id === "meter_power");
  const lifetimeEnergy = device.capabilities.find((c) => c.id.startsWith("meter_power."));
  const currentPower = device.capabilities.find((c) => c.id.includes("number1") || (c.units === "W" && c.id !== "meter_power"));

  const watts = (currentPower?.value as number) ?? 0;
  const todayKwh = (todayEnergy?.value as number) ?? 0;
  const lifetimeKwh = (lifetimeEnergy?.value as number) ?? 0;
  const producing = watts > 0;

  return (
    <WidgetWrapper
      title={device.name}
      subtitle={producing ? "Producing" : "Inactive"}
      online={device.online}
      indicator={producing ? "on" : "off"}
    >
      {/* Illustration */}
      <div className="mb-3 h-24">
        <SolarIllustration watts={watts} />
      </div>

      {/* Current power */}
      <div className="mb-3 text-center">
        <span className={`text-2xl font-bold tabular-nums ${producing ? "text-brand" : "text-muted"}`}>
          {watts >= 1000 ? `${(watts / 1000).toFixed(1)}` : watts.toFixed(0)}
        </span>
        <span className={`ml-1 text-sm ${producing ? "text-brand-dim" : "text-muted-dark"}`}>
          {watts >= 1000 ? "kW" : "W"}
        </span>
      </div>

      {/* Stats */}
      <div className="flex justify-between rounded-xl bg-surface-dark/50 px-3 py-2">
        <div className="text-center">
          <span className="block text-xs font-medium tabular-nums text-white/80">
            {todayKwh.toFixed(1)}
          </span>
          <span className="text-[10px] text-muted">kWh today</span>
        </div>
        <div className="h-auto w-px bg-white/[0.06]" />
        <div className="text-center">
          <span className="block text-xs font-medium tabular-nums text-white/80">
            {lifetimeKwh >= 1000 ? `${(lifetimeKwh / 1000).toFixed(1)}` : lifetimeKwh.toFixed(0)}
          </span>
          <span className="text-[10px] text-muted">
            {lifetimeKwh >= 1000 ? "MWh total" : "kWh total"}
          </span>
        </div>
      </div>
    </WidgetWrapper>
  );
}
