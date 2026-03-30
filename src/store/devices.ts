import { create } from "zustand";
import type { Device } from "@/core/types";

interface DeviceState {
  devices: Map<string, Device>;
  setDevices: (devices: Device[]) => void;
  updateDevice: (device: Device) => void;
  addDevice: (device: Device) => void;
  removeDevice: (deviceId: string) => void;
  clear: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: new Map(),

  setDevices: (devices) =>
    set({
      devices: new Map(devices.map((d) => [`${d.sourceId}:${d.id}`, d])),
    }),

  updateDevice: (device) =>
    set((state) => {
      const next = new Map(state.devices);
      next.set(`${device.sourceId}:${device.id}`, device);
      return { devices: next };
    }),

  addDevice: (device) =>
    set((state) => {
      const next = new Map(state.devices);
      next.set(`${device.sourceId}:${device.id}`, device);
      return { devices: next };
    }),

  removeDevice: (deviceId) =>
    set((state) => {
      const next = new Map(state.devices);
      next.delete(deviceId);
      return { devices: next };
    }),

  clear: () => set({ devices: new Map() }),
}));
