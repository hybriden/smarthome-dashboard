import { create } from "zustand";
import { loadJson, saveJson } from "@/utils/storage";

const MAX_DEFAULT_CAPS = 4;

/** Priority order for auto-selecting which capabilities to show */
const CAP_PRIORITY: Record<string, number> = {
  onoff: 1,
  dim: 2,
  target_temperature: 3,
  measure_temperature: 4,
  thermostat_mode: 5,
  measure_power: 6,
  measure_humidity: 7,
  alarm_contact: 8,
  alarm_motion: 9,
  windowcoverings_set: 10,
  measure_battery: 11,
  locked: 12,
  volume_set: 13,
  meter_power: 14,
  measure_pressure: 15,
  measure_luminance: 16,
  speaker_playing: 17,
};

function capPriority(capId: string): number {
  return CAP_PRIORITY[capId] ?? 100;
}

export interface CardConfig {
  visibleCaps: string[];
  expanded: boolean;
  customName?: string;
}

interface CardConfigState {
  configs: Record<string, CardConfig>;
  editing: string | null;
  getVisibleCaps: (deviceKey: string, allCapIds: string[]) => string[];
  setVisibleCaps: (deviceKey: string, caps: string[]) => void;
  toggleCap: (deviceKey: string, capId: string, allCapIds: string[]) => void;
  setEditing: (deviceKey: string | null) => void;
  isExpanded: (deviceKey: string) => boolean;
  toggleExpanded: (deviceKey: string) => void;
  getCustomName: (deviceKey: string) => string | undefined;
  setCustomName: (deviceKey: string, name: string | undefined) => void;
}

export const useCardConfigStore = create<CardConfigState>((set, get) => ({
  configs: loadJson<Record<string, CardConfig>>("card-configs") ?? {},
  editing: null,

  getVisibleCaps: (deviceKey, allCapIds) => {
    const config = get().configs[deviceKey];
    if (config) return config.visibleCaps;

    // Smart default: pick top N by priority, prefer settable
    const sorted = [...allCapIds].sort((a, b) => capPriority(a) - capPriority(b));
    return sorted.slice(0, MAX_DEFAULT_CAPS);
  },

  setVisibleCaps: (deviceKey, caps) => {
    const configs = { ...get().configs, [deviceKey]: { ...get().configs[deviceKey], visibleCaps: caps, expanded: get().configs[deviceKey]?.expanded ?? false } };
    saveJson("card-configs", configs);
    set({ configs });
  },

  toggleCap: (deviceKey, capId, allCapIds) => {
    const current = get().getVisibleCaps(deviceKey, allCapIds);
    const next = current.includes(capId)
      ? current.filter((c) => c !== capId)
      : [...current, capId];
    get().setVisibleCaps(deviceKey, next);
  },

  setEditing: (deviceKey) => set({ editing: deviceKey }),

  isExpanded: (deviceKey) => get().configs[deviceKey]?.expanded ?? false,

  toggleExpanded: (deviceKey) => {
    const config = get().configs[deviceKey];
    const configs = {
      ...get().configs,
      [deviceKey]: { ...config, visibleCaps: config?.visibleCaps ?? [], expanded: !(config?.expanded ?? false) },
    };
    saveJson("card-configs", configs);
    set({ configs });
  },

  getCustomName: (deviceKey) => get().configs[deviceKey]?.customName,

  setCustomName: (deviceKey, name) => {
    const config = get().configs[deviceKey] ?? { visibleCaps: [], expanded: false };
    const configs = {
      ...get().configs,
      [deviceKey]: { ...config, customName: name || undefined },
    };
    saveJson("card-configs", configs);
    set({ configs });
  },
}));
