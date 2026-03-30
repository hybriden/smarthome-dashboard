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
    <div className="rounded-xl border border-white/10 bg-surface p-3">
      <div className="flex items-center gap-3">
        {hasConfigFields && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{registration.name}</span>
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
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
          {registration.configFields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs text-gray-400">
                {field.label}
                {field.required && <span className="text-accent-danger"> *</span>}
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
                  "w-full rounded-lg border border-white/10 bg-surface-dark px-3 py-2 text-sm",
                  "placeholder-gray-600 focus:border-accent focus:outline-none",
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
