import { X, Moon, Sun } from "lucide-react";
import { useSettingsStore } from "@/store/settings";
import { listAdapterRegistrations } from "@/core/registry";
import { AdapterSettings } from "./AdapterSettings";
import { cn } from "@/utils/cn";

export function SettingsPanel() {
  const showSettings = useSettingsStore((s) => s.showSettings);
  const setShowSettings = useSettingsStore((s) => s.setShowSettings);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const registrations = listAdapterRegistrations();

  if (!showSettings) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setShowSettings(false)}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface-dark shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            type="button"
            onClick={() => setShowSettings(false)}
            className="rounded-lg p-2 hover:bg-surface-light"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <h3 className="mb-2 text-sm font-medium text-gray-400">Appearance</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm",
                  theme === "dark"
                    ? "border-accent bg-accent/10 text-white"
                    : "border-white/10 text-gray-400",
                )}
              >
                <Moon size={16} /> Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm",
                  theme === "light"
                    ? "border-accent bg-accent/10 text-white"
                    : "border-white/10 text-gray-400",
                )}
              >
                <Sun size={16} /> Light
              </button>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium text-gray-400">
              Data Sources
            </h3>
            <div className="space-y-4">
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
