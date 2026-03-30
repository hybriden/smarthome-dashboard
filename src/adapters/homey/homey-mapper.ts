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

function resolveTitle(title: string | Record<string, string> | null | undefined): string {
  if (!title) return "";
  if (typeof title === "string") return title;
  return title["en"] ?? Object.values(title)[0] ?? "";
}

function mapCapability(raw: {
  id: string;
  type?: string;
  title?: string | Record<string, string> | null;
  getable?: boolean;
  setable?: boolean;
  value?: unknown;
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  values?: { id: string; title: string | Record<string, string> | null }[];
}): Capability {
  // Homey uses sub-channel IDs like "onoff.output1" — look up by base capability
  const baseCapId = raw.id.split(".")[0]!;
  const meta = getCapabilityMeta(baseCapId);
  return {
    id: raw.id,
    type: (raw.type as Capability["type"]) ?? "string",
    title: resolveTitle(raw.title) || meta.title,
    value: raw.value ?? null,
    min: raw.min,
    max: raw.max,
    step: raw.step,
    units: raw.units,
    options: raw.values?.map((v) => ({
      id: v.id,
      title: resolveTitle(v.title),
    })),
    settable: raw.setable ?? false,
  };
}

function inferDeviceClass(
  homeyClass: string,
  capabilities: Capability[],
): DeviceClass {
  const mapped = CLASS_MAP[homeyClass];
  if (mapped && mapped !== "sensor" && mapped !== "other") return mapped;

  // Infer from capabilities when Homey class is generic
  const hasSettableOnoff = capabilities.some(
    (c) => c.id.startsWith("onoff") && c.settable,
  );
  const hasDim = capabilities.some((c) => c.id.startsWith("dim"));
  const hasTargetTemp = capabilities.some((c) =>
    c.id.startsWith("target_temperature"),
  );
  const hasWindowCoverings = capabilities.some((c) =>
    c.id.startsWith("windowcoverings"),
  );

  if (hasTargetTemp) return "thermostat";
  if (hasDim && hasSettableOnoff) return "light";
  if (hasWindowCoverings) return "windowcoverings";
  if (hasSettableOnoff) return "socket";

  return mapped ?? "other";
}

export function mapHomeyDevice(raw: HomeyRawDevice): Device {
  const capabilities = Object.values(raw.capabilitiesObj ?? {})
    .filter(Boolean)
    .map(mapCapability);

  return {
    id: raw.id,
    sourceId: "homey",
    name: raw.name,
    zone: raw.zone,
    deviceClass: inferDeviceClass(raw.class, capabilities),
    online: raw.available ?? true,
    capabilities,
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
