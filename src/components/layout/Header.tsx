import { Settings } from "lucide-react";
import { StatusDot } from "@/components/controls/StatusDot";
import { useConnectionStore } from "@/store/connections";
import { useSettingsStore } from "@/store/settings";

export function Header() {
  const statuses = useConnectionStore((s) => s.statuses);
  const setShowSettings = useSettingsStore((s) => s.setShowSettings);

  const connectedCount = Array.from(statuses.values()).filter(Boolean).length;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-6">
      <div className="flex items-center gap-3">
        {/* Brand mark */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15">
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
              d="M10 2L2 8.5V17a1 1 0 001 1h4.5v-5.5a1 1 0 011-1h3a1 1 0 011 1V18H17a1 1 0 001-1V8.5L10 2z"
              fill="#c8943e"
            />
          </svg>
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-white">
          Smarthome
        </h1>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <StatusDot status={connectedCount > 0 ? "online" : "offline"} />
          <span className="text-xs text-muted">
            {connectedCount} source{connectedCount !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] transition-colors hover:border-white/10 hover:bg-surface-light active:scale-95"
        >
          <Settings size={16} className="text-muted" />
        </button>
      </div>
    </header>
  );
}
