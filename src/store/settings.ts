import { create } from "zustand";
import { loadJson, saveJson } from "@/utils/storage";

export interface AdapterConfig {
  adapterId: string;
  enabled: boolean;
  config: Record<string, string>;
}

interface SettingsState {
  theme: "dark" | "light";
  adapterConfigs: AdapterConfig[];
  showSettings: boolean;
  setTheme: (theme: "dark" | "light") => void;
  setAdapterConfig: (adapterId: string, config: Record<string, string>) => void;
  toggleAdapter: (adapterId: string, enabled: boolean) => void;
  setShowSettings: (show: boolean) => void;
}

const defaults: AdapterConfig[] = [
  { adapterId: "demo", enabled: true, config: {} },
];

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: loadJson<"dark" | "light">("theme") ?? "dark",
  adapterConfigs: loadJson<AdapterConfig[]>("adapter-configs") ?? defaults,
  showSettings: false,

  setTheme: (theme) => {
    saveJson("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },

  setAdapterConfig: (adapterId, config) => {
    const configs = get().adapterConfigs.map((c) =>
      c.adapterId === adapterId ? { ...c, config } : c,
    );
    if (!configs.find((c) => c.adapterId === adapterId)) {
      configs.push({ adapterId, enabled: false, config });
    }
    saveJson("adapter-configs", configs);
    set({ adapterConfigs: configs });
  },

  toggleAdapter: (adapterId, enabled) => {
    const configs = get().adapterConfigs.map((c) =>
      c.adapterId === adapterId ? { ...c, enabled } : c,
    );
    if (!configs.find((c) => c.adapterId === adapterId)) {
      configs.push({ adapterId, enabled, config: {} });
    }
    saveJson("adapter-configs", configs);
    set({ adapterConfigs: configs });
  },

  setShowSettings: (showSettings) => set({ showSettings }),
}));
