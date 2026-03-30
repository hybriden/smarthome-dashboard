import { useDeviceStore } from "@/store/devices";
import type { Device } from "@/core/types";

export function useDevice(sourceId: string, deviceId: string): Device | undefined {
  return useDeviceStore((s) => s.devices.get(`${sourceId}:${deviceId}`));
}
