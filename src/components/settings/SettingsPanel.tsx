import { X } from "lucide-react";
import { useSettingsStore } from "@/store/settings";
import { listAdapterRegistrations } from "@/core/registry";
import { AdapterSettings } from "./AdapterSettings";

export function SettingsPanel() {
  const showSettings = useSettingsStore((s) => s.showSettings);
  const setShowSettings = useSettingsStore((s) => s.setShowSettings);
  const registrations = listAdapterRegistrations();

  if (!showSettings) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowSettings(false)}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/[0.06] bg-surface-dark shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-base font-semibold text-white">Settings</h2>
          <button
            type="button"
            onClick={() => setShowSettings(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-surface-light"
          >
            <X size={16} className="text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
              Data Sources
            </h3>
            <div className="space-y-3">
              {registrations.map((reg) => (
                <AdapterSettings key={reg.id} registration={reg} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
