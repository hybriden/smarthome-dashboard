import { Zap, Battery, Activity } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { Slider } from "@/components/controls/Slider";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";
import { cn } from "@/utils/cn";

type ChargeState = "plugged_in_charging" | "plugged_in_paused" | "plugged_in" | "plugged_out" | "plugged_in_discharging";

const STATE_META: Record<ChargeState, { label: string; color: string; icon: "charging" | "paused" | "plugged" | "idle" }> = {
  plugged_in_charging: { label: "Charging", color: "#5cb85c", icon: "charging" },
  plugged_in_discharging: { label: "Discharging", color: "#c8943e", icon: "charging" },
  plugged_in_paused: { label: "Paused", color: "#c8943e", icon: "paused" },
  plugged_in: { label: "Plugged in", color: "#3b82c8", icon: "plugged" },
  plugged_out: { label: "Unplugged", color: "#4a4440", icon: "idle" },
};

function ChargerVisualization({ watts, state, currentA, maxA, voltage, phases }: {
  watts: number;
  state: ChargeState;
  currentA: number;
  maxA: number;
  voltage: number;
  phases: [number, number, number];
}) {
  const isCharging = state === "plugged_in_charging";
  const isPlugged = state !== "plugged_out";
  const intensity = Math.min(watts / 11000, 1); // 11kW max for 3-phase
  const meta = STATE_META[state] ?? STATE_META.plugged_out;
  const color = meta.color;

  const cx = 130;
  const cy = 78;
  const r = 52;

  // Arc
  const startAngle = 150;
  const sweepDeg = 240;
  const toRad = (d: number) => (d * Math.PI) / 180;
  function pt(deg: number, radius: number) {
    const rad = toRad(deg);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }
  function arc(s: number, e: number, radius: number) {
    const sp = pt(s, radius);
    const ep = pt(e, radius);
    return `M ${sp.x} ${sp.y} A ${radius} ${radius} 0 ${e - s > 180 ? 1 : 0} 1 ${ep.x} ${ep.y}`;
  }

  const currentPct = maxA > 0 ? Math.min(currentA / maxA, 1) : 0;
  const fillAngle = startAngle + currentPct * sweepDeg;

  // Phase bar positions
  const phaseMax = maxA > 0 ? maxA : 40;

  return (
    <svg viewBox="0 0 260 165" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>
        <linearGradient id="evArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2d8a4e" />
          <stop offset="50%" stopColor="#5cb85c" />
          <stop offset="100%" stopColor="#8de88d" />
        </linearGradient>
        <linearGradient id="evArcIdle" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b6eb5" />
          <stop offset="100%" stopColor="#5b8ed5" />
        </linearGradient>
        <filter id="evGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="evPulse">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ======= MAIN GAUGE ======= */}

      {/* Track */}
      <path d={arc(startAngle, startAngle + sweepDeg, r)} stroke="#1e1c19" strokeWidth="8" strokeLinecap="round" fill="none" />

      {/* Filled arc */}
      {currentA > 0 && (
        <path
          d={arc(startAngle, fillAngle, r)}
          stroke={isCharging ? "url(#evArcGrad)" : "url(#evArcIdle)"}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          filter="url(#evGlow)"
        />
      )}

      {/* Tick marks */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const angle = startAngle + pct * sweepDeg;
        const inner = pt(angle, r + 6);
        const outer = pt(angle, r + 10);
        return (
          <line key={pct} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#4a4440" strokeWidth="1" strokeLinecap="round" />
        );
      })}

      {/* Leading edge glow */}
      {currentA > 0 && (
        <circle cx={pt(fillAngle, r).x} cy={pt(fillAngle, r).y} r="5" fill={color} opacity={0.5} filter="url(#evPulse)">
          <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Center: car silhouette + plug */}
      <g transform={`translate(${cx - 22}, ${cy - 16})`}>
        {/* Car body */}
        <path d="M8 20 L8 12 Q8 6 14 4 L30 4 Q36 6 36 12 L36 20 Q36 24 32 24 L12 24 Q8 24 8 20Z"
          fill="#0c0b0a" stroke={isPlugged ? color : "#2a2622"} strokeWidth="1.2" opacity={isPlugged ? 0.9 : 0.5} />
        {/* Windshield */}
        <path d="M13 8 L14 5 L30 5 L31 8 Z" fill={isPlugged ? color : "#2a2622"} opacity="0.15" />
        {/* Wheels */}
        <circle cx="14" cy="24" r="3" fill="#0c0b0a" stroke={isPlugged ? color : "#2a2622"} strokeWidth="0.8" opacity="0.6" />
        <circle cx="30" cy="24" r="3" fill="#0c0b0a" stroke={isPlugged ? color : "#2a2622"} strokeWidth="0.8" opacity="0.6" />
        {/* Headlights */}
        <rect x="9" y="12" width="3" height="2" rx="0.5" fill={isCharging ? "#8de88d" : isPlugged ? color : "#2a2622"} opacity={isCharging ? 0.8 : 0.3} />
        <rect x="32" y="12" width="3" height="2" rx="0.5" fill={isCharging ? "#8de88d" : isPlugged ? color : "#2a2622"} opacity={isCharging ? 0.8 : 0.3} />

        {/* Charging bolt on car */}
        {isCharging && (
          <g transform="translate(18, 8)" filter="url(#evPulse)">
            <path d="M5 0 L1 6 L4 6 L2 11 L8 4 L5 4 Z" fill="#5cb85c" opacity="0.9">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
            </path>
          </g>
        )}

        {/* Plug indicator when plugged */}
        {isPlugged && !isCharging && (
          <circle cx="22" cy="14" r="3" fill="none" stroke={color} strokeWidth="1" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
        )}
      </g>

      {/* Status text under car */}
      <text x={cx} y={cy + 32} textAnchor="middle" fontSize="8" fill={color} fontWeight="500" opacity="0.8">
        {meta.label.toUpperCase()}
      </text>

      {/* ======= ENERGY FLOW PARTICLES (when charging) ======= */}
      {isCharging && (
        <g>
          {/* Cable from right side to car */}
          <path d={`M${cx + r + 12} ${cy} Q${cx + r - 5} ${cy - 20} ${cx + 20} ${cy - 5}`} stroke={color} strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="4 3" />
          {/* Flowing particles */}
          <circle r="3" fill="#5cb85c" opacity="0.9" filter="url(#evPulse)">
            <animateMotion dur={`${2 - intensity * 0.8}s`} repeatCount="indefinite" path={`M${cx + r + 12} ${cy} Q${cx + r - 5} ${cy - 20} ${cx + 20} ${cy - 5}`} />
          </circle>
          <circle r="2" fill="#8de88d" opacity="0.6">
            <animateMotion dur={`${2 - intensity * 0.8}s`} repeatCount="indefinite" begin="0.6s" path={`M${cx + r + 12} ${cy} Q${cx + r - 5} ${cy - 20} ${cx + 20} ${cy - 5}`} />
          </circle>
          <circle r="1.5" fill="#5cb85c" opacity="0.4">
            <animateMotion dur={`${2 - intensity * 0.8}s`} repeatCount="indefinite" begin="1.2s" path={`M${cx + r + 12} ${cy} Q${cx + r - 5} ${cy - 20} ${cx + 20} ${cy - 5}`} />
          </circle>
        </g>
      )}

      {/* ======= PHASE BARS (right side) ======= */}
      <g transform="translate(218, 20)">
        <text x="12" y="0" textAnchor="middle" fontSize="7" fill="#7a7168">PHASES</text>
        {(["L1", "L2", "L3"] as const).map((label, i) => {
          const phaseA = phases[i] ?? 0;
          const pct = Math.min(phaseA / phaseMax, 1);
          const y = 8 + i * 30;
          return (
            <g key={label}>
              <text x="-2" y={y + 13} textAnchor="end" fontSize="7" fill="#5a5450">{label}</text>
              {/* Bar track */}
              <rect x="2" y={y + 5} width="20" height="10" rx="2" fill="#1e1c19" />
              {/* Bar fill */}
              <rect x="2" y={y + 5} width={Math.max(20 * pct, pct > 0 ? 3 : 0)} height="10" rx="2" fill={isCharging ? "#5cb85c" : "#3b6eb5"} opacity={0.7 + pct * 0.3}>
                {isCharging && pct > 0 && (
                  <animate attributeName="opacity" values={`${0.6 + pct * 0.2};${0.9};${0.6 + pct * 0.2}`} dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                )}
              </rect>
              {/* Value */}
              <text x="26" y={y + 13} fontSize="7" fill="#7a7168">{phaseA.toFixed(1)}A</text>
            </g>
          );
        })}
        {/* Voltage */}
        <text x="12" y="105" textAnchor="middle" fontSize="7" fill="#5a5450">{voltage}V</text>
      </g>
    </svg>
  );
}

export function EVChargerWidget({ device, customName, onRename }: WidgetProps) {
  const power = device.capabilities.find(c => c.id === "measure_power");
  const stateEnum = device.capabilities.find(c => c.id === "evcharger_charging_state");
  const voltage = device.capabilities.find(c => c.id === "measure_voltage");
  const p1 = device.capabilities.find(c => c.id === "measure_current.p1");
  const p2 = device.capabilities.find(c => c.id === "measure_current.p2");
  const p3 = device.capabilities.find(c => c.id === "measure_current.p3");
  const offeredCurrent = device.capabilities.find(c => c.id === "measure_current.offered");
  const lastCharge = device.capabilities.find(c => c.id === "meter_power.lastCharge");
  const lifetime = device.capabilities.find(c => c.id === "meter_power");
  const { capability: targetCurrent, value: targetCurrentVal, setValue: setTargetCurrent } = useCapability(device, "target_charger_current", { debounce: 500 });

  const watts = (power?.value as number) ?? 0;
  const state = ((stateEnum?.value as string) ?? "plugged_out") as ChargeState;
  const meta = STATE_META[state] ?? STATE_META.plugged_out;
  const isCharging = state === "plugged_in_charging";
  const currentA = (offeredCurrent?.value as number) ?? 0;
  const maxA = (targetCurrent?.max as number) ?? 40;
  const phases: [number, number, number] = [
    (p1?.value as number) ?? 0,
    (p2?.value as number) ?? 0,
    (p3?.value as number) ?? 0,
  ];
  const lastKwh = (lastCharge?.value as number) ?? 0;
  const lifetimeKwh = (lifetime?.value as number) ?? 0;

  return (
    <WidgetWrapper
      title={customName ?? device.name}
      onRename={onRename}
      subtitle={meta.label}
      online={device.online}
      indicator={isCharging ? "on" : state === "plugged_out" ? "off" : "on"}
    >
      {/* Visualization */}
      <div className="flex-1 min-h-0">
        <ChargerVisualization
          watts={watts}
          state={state}
          currentA={currentA}
          maxA={maxA}
          voltage={(voltage?.value as number) ?? 230}
          phases={phases}
        />
      </div>

      {/* Power readout */}
      <div className="mb-1 shrink-0 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <Zap size={16} className={isCharging ? "text-brand-success" : "text-muted"} />
          <span className={cn("text-2xl font-bold tabular-nums", isCharging ? "text-white" : "text-muted")}>
            {watts >= 1000 ? `${(watts / 1000).toFixed(1)}` : watts}
          </span>
          <span className="text-xs text-muted">
            {watts >= 1000 ? "kW" : "W"}
          </span>
        </div>
      </div>

      {/* Current limit slider */}
      {targetCurrent && (
        <div className="no-drag mb-1 shrink-0 flex items-center gap-3">
          <span className="text-[10px] text-muted whitespace-nowrap">{targetCurrent.min ?? 0}A</span>
          <Slider
            value={targetCurrentVal as number}
            min={targetCurrent.min ?? 0}
            max={targetCurrent.max ?? 40}
            step={targetCurrent.step ?? 1}
            onChange={setTargetCurrent}
            disabled={!device.online}
            className="flex-1"
          />
          <span className="text-[10px] text-muted whitespace-nowrap">{targetCurrent.max ?? 40}A</span>
        </div>
      )}

      {/* Stats */}
      <div className="shrink-0 flex justify-between rounded-xl bg-surface-dark/60 px-2 py-1.5">
        <div className="flex items-center gap-1.5">
          <Battery size={10} className="text-brand" />
          <div>
            <span className="text-[11px] font-medium tabular-nums text-white/80">
              {lastKwh.toFixed(1)}
            </span>
            <span className="ml-0.5 text-[9px] text-muted">kWh last</span>
          </div>
        </div>
        <div className="h-auto w-px bg-white/[0.06]" />
        <div className="flex items-center gap-1.5">
          <Activity size={10} className="text-brand-success" />
          <div>
            <span className="text-[11px] font-medium tabular-nums text-white/80">
              {lifetimeKwh >= 1000 ? `${(lifetimeKwh / 1000).toFixed(1)}` : lifetimeKwh.toFixed(0)}
            </span>
            <span className="ml-0.5 text-[9px] text-muted">
              {lifetimeKwh >= 1000 ? "MWh" : "kWh"} total
            </span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
