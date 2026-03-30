import { ArrowDown, ArrowUp, Zap } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import type { WidgetProps } from "./WidgetRegistry";
import { cn } from "@/utils/cn";

function PowerFlow({ importing, exporting }: { importing: number; exporting: number }) {
  const net = importing - exporting;
  const isExporting = net < 0;
  const maxW = 10000; // scale for visual
  const importPct = Math.min(importing / maxW, 1);
  const exportPct = Math.min(exporting / maxW, 1);

  return (
    <svg viewBox="0 0 160 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      {/* House */}
      <g transform="translate(55, 5)">
        <path d="M25 0 L0 18 L5 18 L5 35 L45 35 L45 18 L50 18 Z"
          fill="#1e1c19" stroke={isExporting ? "#5cb85c" : "#c8943e"} strokeWidth="1" />
        <rect x="18" y="20" width="14" height="15" rx="1" fill="#0c0b0a" stroke="#2a2622" strokeWidth="0.5" />
        <text x="25" y="31" textAnchor="middle" fontSize="6" fill="#7a7168">
          {Math.abs(net) >= 1000 ? `${(Math.abs(net)/1000).toFixed(1)}kW` : `${Math.abs(net)}W`}
        </text>
      </g>

      {/* Grid (left) */}
      <g transform="translate(2, 20)">
        <rect x="0" y="0" width="30" height="24" rx="3" fill="#1e1c19" stroke="#2a2622" strokeWidth="1" />
        <text x="15" y="10" textAnchor="middle" fontSize="5" fill="#7a7168">GRID</text>
        <rect x="5" y="13" width="20" height="7" rx="1" fill="#0c0b0a" />
        {/* Import bar */}
        <rect x="5" y="13" width={20 * importPct} height="7" rx="1" fill="#c8943e" opacity="0.6" />
      </g>

      {/* Import arrow (grid → house) */}
      {importing > 0 && (
        <g>
          <line x1="34" y1="32" x2="54" y2="28" stroke="#c8943e" strokeWidth="1.5" opacity="0.6" />
          <circle r="2" fill="#c8943e" opacity="0.8">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M34 32 L54 28" />
          </circle>
          <circle r="1.5" fill="#c8943e" opacity="0.5">
            <animateMotion dur="1.5s" repeatCount="indefinite" begin="0.5s" path="M34 32 L54 28" />
          </circle>
        </g>
      )}

      {/* Solar (right) */}
      <g transform="translate(128, 20)">
        <rect x="0" y="0" width="30" height="24" rx="3" fill="#1e1c19" stroke="#2a2622" strokeWidth="1" />
        <text x="15" y="10" textAnchor="middle" fontSize="5" fill="#7a7168">SOLAR</text>
        <rect x="5" y="13" width="20" height="7" rx="1" fill="#0c0b0a" />
        {/* Export bar */}
        <rect x="5" y="13" width={20 * exportPct} height="7" rx="1" fill="#5cb85c" opacity="0.6" />
      </g>

      {/* Export arrow (house → grid) or solar → house */}
      {exporting > 0 && (
        <g>
          <line x1="126" y1="28" x2="106" y2="28" stroke="#5cb85c" strokeWidth="1.5" opacity="0.6" />
          <circle r="2" fill="#5cb85c" opacity="0.8">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M126 28 L106 28" />
          </circle>
        </g>
      )}

      {/* Bottom labels */}
      <text x="17" y="60" textAnchor="middle" fontSize="6" fill="#c8943e">
        {importing >= 1000 ? `${(importing/1000).toFixed(1)} kW` : `${importing} W`}
      </text>
      <text x="80" y="60" textAnchor="middle" fontSize="5" fill="#7a7168">
        {isExporting ? "← exporting" : "importing →"}
      </text>
      <text x="143" y="60" textAnchor="middle" fontSize="6" fill="#5cb85c">
        {exporting >= 1000 ? `${(exporting/1000).toFixed(1)} kW` : `${exporting} W`}
      </text>
    </svg>
  );
}

export function PowerMeterWidget({ device }: WidgetProps) {
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
      title={device.name}
      subtitle={isExporting ? "Exporting to grid" : "Importing from grid"}
      online={device.online}
      indicator={isExporting ? "on" : "off"}
    >
      {/* Power flow diagram */}
      <div className="mb-2 flex-1 min-h-0">
        <PowerFlow importing={importing} exporting={exporting} />
      </div>

      {/* Current power */}
      <div className="mb-2 text-center">
        <div className="flex items-center justify-center gap-1">
          <Zap size={14} className={isExporting ? "text-brand-success" : "text-brand"} />
          <span className={cn("text-xl font-bold tabular-nums", isExporting ? "text-brand-success" : "text-white/90")}>
            {Math.abs(net) >= 1000 ? `${(Math.abs(net)/1000).toFixed(1)}` : Math.abs(net)}
          </span>
          <span className="text-xs text-muted">
            {Math.abs(net) >= 1000 ? "kW" : "W"} {isExporting ? "out" : "in"}
          </span>
        </div>
      </div>

      {/* Today's energy */}
      <div className="flex justify-between rounded-lg bg-surface-dark/50 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <ArrowDown size={10} className="text-brand" />
          <div>
            <span className="text-[11px] font-medium tabular-nums text-white/80">
              {((importKwh?.value as number) ?? 0).toFixed(1)}
            </span>
            <span className="ml-0.5 text-[9px] text-muted">kWh</span>
          </div>
        </div>
        <div className="h-auto w-px bg-white/[0.06]" />
        <div className="flex items-center gap-1.5">
          <ArrowUp size={10} className="text-brand-success" />
          <div>
            <span className="text-[11px] font-medium tabular-nums text-white/80">
              {((exportKwh?.value as number) ?? 0).toFixed(1)}
            </span>
            <span className="ml-0.5 text-[9px] text-muted">kWh</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
