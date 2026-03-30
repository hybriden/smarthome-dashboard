import { create } from "zustand";
import { loadJson, saveJson } from "@/utils/storage";

interface PinnedDevicesState {
  /** Device keys in display order: "sourceId:deviceId" */
  pinned: string[];
  showDevicePicker: boolean;
  addDevice: (key: string) => void;
  removeDevice: (key: string) => void;
  isPinned: (key: string) => boolean;
  reorder: (pinned: string[]) => void;
  setShowDevicePicker: (show: boolean) => void;
}

export const usePinnedDevicesStore = create<PinnedDevicesState>((set, get) => ({
  pinned: loadJson<string[]>("pinned-devices") ?? [],
  showDevicePicker: false,

  addDevice: (key) => {
    const pinned = get().pinned;
    if (pinned.includes(key)) return;
    const next = [...pinned, key];
    saveJson("pinned-devices", next);
    set({ pinned: next });
  },

  removeDevice: (key) => {
    const next = get().pinned.filter((k) => k !== key);
    saveJson("pinned-devices", next);
    set({ pinned: next });
  },

  isPinned: (key) => get().pinned.includes(key),

  reorder: (pinned) => {
    saveJson("pinned-devices", pinned);
    set({ pinned });
  },

  setShowDevicePicker: (showDevicePicker) => set({ showDevicePicker }),
}));
