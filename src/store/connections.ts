import { create } from "zustand";

interface ConnectionState {
  statuses: Map<string, boolean>;
  setConnected: (adapterId: string, connected: boolean) => void;
  clear: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  statuses: new Map(),

  setConnected: (adapterId, connected) =>
    set((state) => {
      const next = new Map(state.statuses);
      next.set(adapterId, connected);
      return { statuses: next };
    }),

  clear: () => set({ statuses: new Map() }),
}));
