import { create } from "zustand";
import type { Zone } from "@/core/types";

interface ZoneState {
  zones: Map<string, Zone>;
  setZones: (zones: Zone[]) => void;
  clear: () => void;
}

export const useZoneStore = create<ZoneState>((set) => ({
  zones: new Map(),

  setZones: (zones) =>
    set({
      zones: new Map(zones.map((z) => [`${z.sourceId}:${z.id}`, z])),
    }),

  clear: () => set({ zones: new Map() }),
}));
