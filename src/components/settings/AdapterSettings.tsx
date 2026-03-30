import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Toggle } from "@/components/controls/Toggle";
import { StatusDot } from "@/components/controls/StatusDot";
import { useSettingsStore } from "@/store/settings";
import { useConnection } from "@/hooks/useConnection";
import { startHomeyLogin, loadAuth, clearAuth } from "@/adapters/homey/homey-auth";
import type { AdapterRegistration } from "@/core/types";
import { cn } from "@/utils/cn";

interface AdapterSettingsProps {
  registration: AdapterRegistration;
}

export function AdapterSettings({ registration }: AdapterSettingsProps) {
  const [expanded, setExpanded] = useState(registration.id === "homey");
  const adapterConfigs = useSettingsStore((s) => s.adapterConfigs);
  const toggleAdapter = useSettingsStore((s) => s.toggleAdapter);
  const setAdapterConfig = useSettingsStore((s) => s.setAdapterConfig);
  const connected = useConnection(registration.id);

  const saved = adapterConfigs.find((c) => c.adapterId === registration.id);
  const enabled = saved?.enabled ?? false;
  const config = saved?.config ?? {};

  const isHomey = registration.id === "homey";
  const homeyAuth = isHomey ? loadAuth() : null;
  const hasConfigFields = registration.configFields.length > 0;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface-card p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-muted"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/90">{registration.name}</span>
            <StatusDot status={connected ? "online" : "offline"} />
          </div>
          {isHomey && homeyAuth && (
            <span className="text-[11px] text-brand-success/70">Authenticated</span>
          )}
        </div>
        <Toggle
          checked={enabled}
          onChange={(v) => toggleAdapter(registration.id, v)}
          size="sm"
        />
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
          {/* Homey OAuth login */}
          {isHomey && (
            <div className="space-y-2">
              {!homeyAuth ? (
                <button
                  type="button"
                  onClick={() => startHomeyLogin()}
                  className="w-full rounded-xl bg-brand/15 px-4 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand/25"
                >
                  Connect with Homey
                </button>
              ) : (
                <div className="flex items-center justify-between rounded-xl bg-brand-success/10 px-3 py-2">
                  <div>
                    <span className="text-xs font-medium text-brand-success">Connected to Homey</span>
                    {homeyAuth.homeyLocalUrl && (
                      <p className="text-[11px] text-muted">{homeyAuth.homeyLocalUrl}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearAuth();
                      toggleAdapter("homey", false);
                    }}
                    className="rounded-lg px-2 py-1 text-xs text-muted hover:text-brand-danger"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Config fields */}
          {hasConfigFields && registration.configFields.map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-xs text-muted">
                {field.label}
                {field.required && <span className="text-brand-danger"> *</span>}
              </label>
              <input
                type={field.type === "password" ? "password" : "text"}
                placeholder={field.placeholder}
                value={config[field.key] ?? ""}
                onChange={(e) =>
                  setAdapterConfig(registration.id, {
                    ...config,
                    [field.key]: e.target.value,
                  })
                }
                className={cn(
                  "w-full rounded-xl border border-white/[0.06] bg-surface-dark px-3 py-2.5 text-sm text-white/80",
                  "placeholder-muted-dark/60 focus:border-brand/30 focus:outline-none focus:ring-1 focus:ring-brand/20",
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
