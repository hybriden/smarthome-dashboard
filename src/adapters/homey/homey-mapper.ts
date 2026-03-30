import type { Device, DeviceClass, Capability, Zone } from "@/core/types";
import type { HomeyRawDevice, HomeyRawZone } from "./types";
import { getCapabilityMeta } from "./homey-capabilities";

const CLASS_MAP: Record<string, DeviceClass> = {
  light: "light",
  thermostat: "thermostat",
  sensor: "sensor",
  socket: "socket",
  speaker: "speaker",
  lock: "lock",
  windowcoverings: "windowcoverings",
  camera: "camera",
  homealarm: "alarm",
};

function resolveTitle(title: string | Record<string, string>): string {
  if (typeof title === "string") return title;
  return title["en"] ?? Object.values(title)[0] ?? "";
}

function mapCapability(raw: {
  id: string;
  type: string;
  title: string | Record<string, string>;
  getable: boolean;
  setable: boolean;
  value: unknown;
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  values?: { id: string; title: string | Record<string, string> }[];
}): Capability {
  const meta = getCapabilityMeta(raw.id);
  return {
    id: raw.id,
    type: raw.type as Capability["type"],
    title: resolveTitle(raw.title) || meta.title,
    value: raw.value,
    min: raw.min,
    max: raw.max,
    step: raw.step,
    units: raw.units,
    options: raw.values?.map((v) => ({
      id: v.id,
      title: resolveTitle(v.title),
    })),
    settable: raw.setable,
  };
}

export function mapHomeyDevice(raw: HomeyRawDevice): Device {
  return {
    id: raw.id,
    sourceId: "homey",
    name: raw.name,
    zone: raw.zone,
    deviceClass: CLASS_MAP[raw.class] ?? "other",
    online: raw.available,
    capabilities: Object.values(raw.capabilitiesObj).map(mapCapability),
  };
}

export function mapHomeyZone(raw: HomeyRawZone): Zone {
  return {
    id: raw.id,
    sourceId: "homey",
    name: raw.name,
    parentId: raw.parent ?? undefined,
    icon: raw.icon,
  };
}
