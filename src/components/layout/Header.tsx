import { Home, Settings } from "lucide-react";
import { StatusDot } from "@/components/controls/StatusDot";
import { useConnectionStore } from "@/store/connections";
import { useSettingsStore } from "@/store/settings";

export function Header() {
  const statuses = useConnectionStore((s) => s.statuses);
  const setShowSettings = useSettingsStore((s) => s.setShowSettings);

  const connectedCount = Array.from(statuses.values()).filter(Boolean).length;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
      <div className="flex items-center gap-2">
        <Home size={22} className="text-accent" />
        <h1 className="text-lg font-semibold">Smarthome</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <StatusDot status={connectedCount > 0 ? "online" : "offline"} />
          <span className="text-xs text-gray-400">
            {connectedCount} source{connectedCount !== 1 && "s"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="rounded-lg p-2 transition-colors hover:bg-surface-light active:bg-surface"
        >
          <Settings size={20} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
