import { create } from "zustand";
import type { Layout } from "react-grid-layout";
import { loadJson, saveJson } from "@/utils/storage";

type Layouts = Record<string, Layout[]>;

interface DashboardState {
  layouts: Layouts;
  activeZone: string | null;
  setLayouts: (layouts: Layouts) => void;
  setActiveZone: (zone: string | null) => void;
}

// Migrate old format (flat array) to new format (per-breakpoint)
function loadLayouts(): Layouts {
  const raw = loadJson<Layouts | Layout[]>("dashboard-layouts");
  if (!raw) return {};
  if (Array.isArray(raw)) {
    // Old format — treat as lg
    return { lg: raw, md: raw, sm: raw };
  }
  return raw;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  layouts: loadLayouts(),
  activeZone: null,

  setLayouts: (layouts) => {
    saveJson("dashboard-layouts", layouts);
    set({ layouts });
  },

  setActiveZone: (activeZone) => set({ activeZone }),
}));
