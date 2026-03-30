import { create } from "zustand";
import type { Layout } from "react-grid-layout";
import { loadJson, saveJson } from "@/utils/storage";

interface DashboardState {
  layouts: Layout[];
  activeZone: string | null;
  setLayouts: (layouts: Layout[]) => void;
  setActiveZone: (zone: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  layouts: loadJson<Layout[]>("dashboard-layouts") ?? [],
  activeZone: null,

  setLayouts: (layouts) => {
    saveJson("dashboard-layouts", layouts);
    set({ layouts });
  },

  setActiveZone: (activeZone) => set({ activeZone }),
}));
