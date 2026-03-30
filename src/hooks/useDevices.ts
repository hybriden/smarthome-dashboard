import { useMemo } from "react";
import { useDeviceStore } from "@/store/devices";
import type { Device, DeviceClass } from "@/core/types";

export function useDevices(filters?: {
  zone?: string | null;
  deviceClass?: DeviceClass;
  sourceId?: string;
}): Device[] {
  const devices = useDeviceStore((s) => s.devices);

  return useMemo(() => {
    let list = Array.from(devices.values());
    if (filters?.zone) {
      list = list.filter((d) => d.zone === filters.zone);
    }
    if (filters?.deviceClass) {
      list = list.filter((d) => d.deviceClass === filters.deviceClass);
    }
    if (filters?.sourceId) {
      list = list.filter((d) => d.sourceId === filters.sourceId);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [devices, filters?.zone, filters?.deviceClass, filters?.sourceId]);
}
