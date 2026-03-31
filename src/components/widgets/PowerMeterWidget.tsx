import { ArrowDown, ArrowUp, Zap } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import type { WidgetProps } from "./WidgetRegistry";
import { cn } from "@/utils/cn";

function EnergyFlowVisualization({ importing, exporting }: { importing: number; exporting: number }) {
  const net = importing - exporting;
  const isExporting = net < 0;
  const maxW = 10000;
  const importIntensity = Math.min(importing / maxW, 1);
  const exportIntensity = Math.min(exporting / maxW, 1);

  // Center ring — represents the home
  const cx = 160;
  const cy = 85;
  const ringR = 30;

  // Power arc on center ring
  const netAbs = Math.abs(net);
  const netIntensity = Math.min(netAbs / maxW, 1);
  const arcSweep = netIntensity * 300; // max 300° sweep

  function describeArc(startDeg: number, endDeg: number, r: number, ox: number, oy: number) {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const s = { x: ox + r * Math.cos(toRad(startDeg)), y: oy + r * Math.sin(toRad(startDeg)) };
    const e = { x: ox + r * Math.cos(toRad(endDeg)), y: oy + r * Math.sin(toRad(endDeg)) };
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  // Node positions
  const gridX = 30, gridY = 85;
  const solarX = 290, solarY = 45;

  // Connection paths
  const gridToHome = `M${gridX + 22} ${gridY} Q${cx - 40} ${cy - 15} ${cx - ringR} ${cy}`;
  const solarToHome = `M${solarX - 20} ${solarY + 10} Q${cx + 40} ${cy - 25} ${cx + ringR - 5} ${cy - 15}`;

  const importColor = "#c8943e";
  const exportColor = "#5cb85c";
  const activeColor = isExporting ? exportColor : importColor;

  return (
    <svg viewBox="0 0 320 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>
        {/* Import gradient — amber */}
        <linearGradient id="importGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c8943e" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#c8943e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c8943e" stopOpacity="0.1" />
        </linearGradient>
        {/* Export gradient — green */}
        <linearGradient id="exportGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5cb85c" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#5cb85c" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#5cb85c" stopOpacity="0.1" />
        </linearGradient>
        {/* Ring gradient */}
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isExporting ? "#2d8a4e" : "#8b6a2f"} />
          <stop offset="50%" stopColor={activeColor} />
          <stop offset="100%" stopColor={isExporting ? "#5cb85c" : "#e0b05e"} />
        </linearGradient>
        {/* Glow filters */}
        <filter id="amsPulseGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="amsNodeGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="amsLineGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ======= CONNECTION LINES ======= */}

      {/* Grid → Home connection line (base) */}
      <path d={gridToHome} stroke="#2a2622" strokeWidth="2" fill="none" />
      {/* Grid → Home active glow */}
      {importing > 0 && (
        <path d={gridToHome} stroke={importColor} strokeWidth="2" fill="none" opacity={0.3 + importIntensity * 0.4} filter="url(#amsLineGlow)" />
      )}

      {/* Solar → Home connection line (base) */}
      <path d={solarToHome} stroke="#2a2622" strokeWidth="2" fill="none" />
      {/* Solar → Home active glow */}
      {exporting > 0 && (
        <path d={solarToHome} stroke={exportColor} strokeWidth="2" fill="none" opacity={0.3 + exportIntensity * 0.4} filter="url(#amsLineGlow)" />
      )}

      {/* ======= FLOWING PARTICLES ======= */}

      {/* Import particles — grid to home */}
      {importing > 0 && (
        <g>
          <circle r="3.5" fill={importColor} opacity="0.9" filter="url(#amsPulseGlow)">
            <animateMotion dur={`${2.5 - importIntensity * 1}s`} repeatCount="indefinite" path={gridToHome} />
          </circle>
          <circle r="2.5" fill="#e0b05e" opacity="0.6">
            <animateMotion dur={`${2.5 - importIntensity * 1}s`} repeatCount="indefinite" begin="0.8s" path={gridToHome} />
          </circle>
          <circle r="2" fill={importColor} opacity="0.4">
            <animateMotion dur={`${2.5 - importIntensity * 1}s`} repeatCount="indefinite" begin="1.6s" path={gridToHome} />
          </circle>
        </g>
      )}

      {/* Export particles — solar to home (or home producing) */}
      {exporting > 0 && (
        <g>
          <circle r="3" fill={exportColor} opacity="0.9" filter="url(#amsPulseGlow)">
            <animateMotion dur={`${2.5 - exportIntensity * 1}s`} repeatCount="indefinite" path={solarToHome} />
          </circle>
          <circle r="2" fill="#8de88d" opacity="0.5">
            <animateMotion dur={`${2.5 - exportIntensity * 1}s`} repeatCount="indefinite" begin="0.7s" path={solarToHome} />
          </circle>
        </g>
      )}

      {/* ======= GRID NODE (left) ======= */}
      <g>
        {/* Grid outer ring */}
        <circle cx={gridX} cy={gridY} r="22" fill="#0c0b0a" stroke="#2a2622" strokeWidth="1.5" />
        {importing > 0 && (
          <circle cx={gridX} cy={gridY} r="22" fill="none" stroke={importColor} strokeWidth="1" opacity={0.2 + importIntensity * 0.3}>
            <animate attributeName="r" values="20;24;20" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values={`${0.15 + importIntensity * 0.2};${0.05};${0.15 + importIntensity * 0.2}`} dur="3s" repeatCount="indefinite" />
          </circle>
        )}
        {/* Grid tower icon */}
        <g transform={`translate(${gridX - 8}, ${gridY - 12})`} opacity="0.7">
          {/* Tower body */}
          <path d="M8 0 L4 24 L12 24 Z" fill="none" stroke={importing > 0 ? importColor : "#4a4440"} strokeWidth="1.2" />
          {/* Cross arms */}
          <line x1="0" y1="8" x2="16" y2="8" stroke={importing > 0 ? importColor : "#4a4440"} strokeWidth="1" />
          <line x1="2" y1="14" x2="14" y2="14" stroke={importing > 0 ? importColor : "#4a4440"} strokeWidth="0.8" />
          {/* Wires */}
          <line x1="0" y1="8" x2="-4" y2="4" stroke={importing > 0 ? importColor : "#4a4440"} strokeWidth="0.5" opacity="0.6" />
          <line x1="16" y1="8" x2="20" y2="4" stroke={importing > 0 ? importColor : "#4a4440"} strokeWidth="0.5" opacity="0.6" />
        </g>
        {/* Label */}
        <text x={gridX} y={gridY + 34} textAnchor="middle" fontSize="8" fill="#7a7168" fontWeight="500">GRID</text>
      </g>

      {/* ======= SOLAR NODE (right) ======= */}
      <g>
        <circle cx={solarX} cy={solarY} r="20" fill="#0c0b0a" stroke="#2a2622" strokeWidth="1.5" />
        {exporting > 0 && (
          <circle cx={solarX} cy={solarY} r="20" fill="none" stroke={exportColor} strokeWidth="1" opacity={0.2 + exportIntensity * 0.3}>
            <animate attributeName="r" values="18;22;18" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values={`${0.15 + exportIntensity * 0.2};${0.05};${0.15 + exportIntensity * 0.2}`} dur="3.5s" repeatCount="indefinite" />
          </circle>
        )}
        {/* Sun icon */}
        <circle cx={solarX} cy={solarY} r="6" fill={exporting > 0 ? exportColor : "#2a2622"} opacity={exporting > 0 ? 0.7 : 0.4}>
          {exporting > 0 && (
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2.5s" repeatCount="indefinite" />
          )}
        </circle>
        {/* Sun rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={angle}
              x1={solarX + 9 * Math.cos(rad)}
              y1={solarY + 9 * Math.sin(rad)}
              x2={solarX + 13 * Math.cos(rad)}
              y2={solarY + 13 * Math.sin(rad)}
              stroke={exporting > 0 ? exportColor : "#2a2622"}
              strokeWidth="1"
              strokeLinecap="round"
              opacity={exporting > 0 ? 0.5 : 0.3}
            />
          );
        })}
        <text x={solarX} y={solarY + 30} textAnchor="middle" fontSize="8" fill="#7a7168" fontWeight="500">SOLAR</text>
      </g>

      {/* ======= HOME NODE (center) — the main ring ======= */}
      <g>
        {/* Outer decorative ring */}
        <circle cx={cx} cy={cy} r={ringR + 6} fill="none" stroke="#1e1c19" strokeWidth="1" />

        {/* Background track */}
        <path
          d={describeArc(-210, 90, ringR, cx, cy)}
          stroke="#1e1c19"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Active power arc */}
        {netAbs > 0 && (
          <path
            d={describeArc(-210, -210 + arcSweep, ringR, cx, cy)}
            stroke="url(#ringGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            filter="url(#amsLineGlow)"
          />
        )}

        {/* Center background */}
        <circle cx={cx} cy={cy} r={ringR - 6} fill="#0c0b0a" opacity="0.8" />

        {/* House icon in center */}
        <g transform={`translate(${cx - 10}, ${cy - 12})`} opacity="0.8">
          <path d="M10 0 L0 9 L2 9 L2 18 L18 18 L18 9 L20 9 Z"
            fill="none" stroke={activeColor} strokeWidth="1.2" strokeLinejoin="round" />
          {/* Door */}
          <rect x="8" y="11" width="5" height="7" rx="0.5" fill="none" stroke={activeColor} strokeWidth="0.8" opacity="0.6" />
          {/* Window */}
          <rect x="3.5" y="10" width="3.5" height="3" rx="0.3" fill={activeColor} opacity="0.2" />
          <rect x="13.5" y="10" width="3.5" height="3" rx="0.3" fill={activeColor} opacity="0.2" />
        </g>

        {/* Rotating energy ring when active */}
        {netAbs > 0 && (
          <g opacity={0.15 + netIntensity * 0.2}>
            <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`${isExporting ? -360 : 360} ${cx} ${cy}`} dur="20s" repeatCount="indefinite" />
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x = cx + (ringR + 6) * Math.cos(rad);
              const y = cy + (ringR + 6) * Math.sin(rad);
              return <circle key={angle} cx={x} cy={y} r="1" fill={activeColor} />;
            })}
          </g>
        )}
      </g>

      {/* ======= POWER VALUES ON CONNECTIONS ======= */}

      {/* Import power label */}
      {importing > 0 && (
        <g>
          <rect x="72" y="58" width="44" height="16" rx="4" fill="#0c0b0a" stroke={importColor} strokeWidth="0.5" opacity="0.9" />
          <text x="94" y="69" textAnchor="middle" fontSize="8" fill={importColor} fontWeight="600">
            {importing >= 1000 ? `${(importing/1000).toFixed(1)}kW` : `${importing}W`}
          </text>
        </g>
      )}

      {/* Export power label */}
      {exporting > 0 && (
        <g>
          <rect x="205" y="38" width="44" height="16" rx="4" fill="#0c0b0a" stroke={exportColor} strokeWidth="0.5" opacity="0.9" />
          <text x="227" y="49" textAnchor="middle" fontSize="8" fill={exportColor} fontWeight="600">
            {exporting >= 1000 ? `${(exporting/1000).toFixed(1)}kW` : `${exporting}W`}
          </text>
        </g>
      )}

      {/* ======= BOTTOM AREA — net power ======= */}
      <text x={cx} y="150" textAnchor="middle" fontSize="10" fill={activeColor} fontWeight="600" opacity="0.8">
        {isExporting ? "EXPORTING" : "IMPORTING"}
      </text>
      <text x={cx} y="164" textAnchor="middle" fontSize="7" fill="#4a4440">
        {netAbs >= 1000 ? `${(netAbs/1000).toFixed(1)} kW` : `${netAbs} W`} {isExporting ? "to grid" : "from grid"}
      </text>
    </svg>
  );
}

export function PowerMeterWidget({ device, customName, onRename }: WidgetProps) {
  const importW = device.capabilities.find(c => c.title === "Import" && c.units === "W");
  const exportW = device.capabilities.find(c => c.title === "Export" && c.units === "W");
  const importKwh = device.capabilities.find(c => c.title === "Import kwh");
  const exportKwh = device.capabilities.find(c => c.title === "Export kwh");

  const importing = (importW?.value as number) ?? 0;
  const exporting = (exportW?.value as number) ?? 0;
  const net = importing - exporting;
  const isExporting = net < 0;

  return (
    <WidgetWrapper
      title={customName ?? device.name}
      onRename={onRename}
      subtitle={isExporting ? "Exporting to grid" : "Importing from grid"}
      online={device.online}
      indicator={isExporting ? "on" : "off"}
    >
      {/* Energy flow visualization */}
      <div className="flex-1 min-h-0">
        <EnergyFlowVisualization importing={importing} exporting={exporting} />
      </div>

      {/* Current net power — large */}
      <div className="mb-2 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <Zap size={16} className={isExporting ? "text-brand-success" : "text-brand"} />
          <span className={cn("text-2xl font-bold tabular-nums", isExporting ? "text-brand-success" : "text-white")}>
            {Math.abs(net) >= 1000 ? `${(Math.abs(net)/1000).toFixed(1)}` : Math.abs(net)}
          </span>
          <span className="text-xs text-muted">
            {Math.abs(net) >= 1000 ? "kW" : "W"} {isExporting ? "out" : "in"}
          </span>
        </div>
      </div>

      {/* Today's energy totals */}
      <div className="flex justify-between rounded-xl bg-surface-dark/60 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <ArrowDown size={10} className="text-brand" />
          <div>
            <span className="text-[11px] font-medium tabular-nums text-white/80">
              {((importKwh?.value as number) ?? 0).toFixed(1)}
            </span>
            <span className="ml-0.5 text-[9px] text-muted">kWh in</span>
          </div>
        </div>
        <div className="h-auto w-px bg-white/[0.06]" />
        <div className="flex items-center gap-1.5">
          <ArrowUp size={10} className="text-brand-success" />
          <div>
            <span className="text-[11px] font-medium tabular-nums text-white/80">
              {((exportKwh?.value as number) ?? 0).toFixed(1)}
            </span>
            <span className="ml-0.5 text-[9px] text-muted">kWh out</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
