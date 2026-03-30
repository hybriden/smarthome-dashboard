import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Toggle } from "@/components/controls/Toggle";
import { StatusDot } from "@/components/controls/StatusDot";
import { useSettingsStore } from "@/store/settings";
import { useConnection } from "@/hooks/useConnection";
import type { AdapterRegistration } from "@/core/types";
import { cn } from "@/utils/cn";

interface AdapterSettingsProps {
  registration: AdapterRegistration;
}

export function AdapterSettings({ registration }: AdapterSettingsProps) {
  const [expanded, setExpanded] = useState(false);
  const adapterConfigs = useSettingsStore((s) => s.adapterConfigs);
  const toggleAdapter = useSettingsStore((s) => s.toggleAdapter);
  const setAdapterConfig = useSettingsStore((s) => s.setAdapterConfig);
  const connected = useConnection(registration.id);

  const saved = adapterConfigs.find((c) => c.adapterId === registration.id);
  const enabled = saved?.enabled ?? false;
  const config = saved?.config ?? {};

  const hasConfigFields = registration.configFields.length > 0;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface-card p-4">
      <div className="flex items-center gap-3">
        {hasConfigFields && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-muted"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/90">{registration.name}</span>
            <StatusDot status={connected ? "online" : "offline"} />
          </div>
        </div>
        <Toggle
          checked={enabled}
          onChange={(v) => toggleAdapter(registration.id, v)}
          size="sm"
        />
      </div>

      {expanded && hasConfigFields && (
        <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
          {registration.configFields.map((field) => (
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
