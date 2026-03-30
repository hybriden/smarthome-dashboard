import { useState, useMemo } from "react";
import { X, ChevronRight, Plus, Check, Home, Lightbulb } from "lucide-react";
import { useDeviceStore } from "@/store/devices";
import { useZoneStore } from "@/store/zones";
import { usePinnedDevicesStore } from "@/store/pinnedDevices";
import type { Device, Zone } from "@/core/types";
import { cn } from "@/utils/cn";

export function DevicePicker() {
  const showPicker = usePinnedDevicesStore((s) => s.showDevicePicker);
  const setShowPicker = usePinnedDevicesStore((s) => s.setShowDevicePicker);

  if (!showPicker) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowPicker(false)}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/[0.06] bg-surface-dark shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-base font-semibold text-white">Add Devices</h2>
          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-surface-light"
          >
            <X size={16} className="text-muted" />
          </button>
        </div>
        <PickerContent />
      </div>
    </>
  );
}

function PickerContent() {
  const [currentZone, setCurrentZone] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "Whole House" },
  ]);

  const devices = useDeviceStore((s) => s.devices);
  const zones = useZoneStore((s) => s.zones);

  const allDevices = useMemo(() => Array.from(devices.values()), [devices]);
  const allZones = useMemo(
    () => Array.from(zones.values()).sort((a, b) => a.name.localeCompare(b.name)),
    [zones],
  );

  // Child zones of current zone
  const childZones = useMemo(
    () =>
      currentZone === null
        ? allZones.filter((z) => !z.parentId)
        : allZones.filter((z) => z.parentId === currentZone),
    [allZones, currentZone],
  );

  // Devices in current zone (direct children only)
  const zoneDevices = useMemo(
    () =>
      currentZone === null
        ? [] // Don't show all devices at root — force drill-down
        : allDevices
            .filter((d) => d.zone === currentZone)
            .sort((a, b) => a.name.localeCompare(b.name)),
    [allDevices, currentZone],
  );

  // Count devices per zone (recursive — includes all nested children)
  const deviceCountByZone = useMemo(() => {
    // Direct counts first
    const direct = new Map<string, number>();
    for (const d of allDevices) {
      if (d.zone) {
        direct.set(d.zone, (direct.get(d.zone) ?? 0) + 1);
      }
    }

    // Build parent→children map
    const childrenOf = new Map<string, string[]>();
    for (const z of allZones) {
      if (z.parentId) {
        const siblings = childrenOf.get(z.parentId) ?? [];
        siblings.push(z.id);
        childrenOf.set(z.parentId, siblings);
      }
    }

    // Recursive count
    const cache = new Map<string, number>();
    function countRecursive(zoneId: string): number {
      if (cache.has(zoneId)) return cache.get(zoneId)!;
      let total = direct.get(zoneId) ?? 0;
      for (const childId of childrenOf.get(zoneId) ?? []) {
        total += countRecursive(childId);
      }
      cache.set(zoneId, total);
      return total;
    }

    const counts = new Map<string, number>();
    for (const z of allZones) {
      counts.set(z.id, countRecursive(z.id));
    }
    return counts;
  }, [allDevices, allZones]);

  function navigateToZone(zone: Zone) {
    setCurrentZone(zone.id);
    setBreadcrumbs((prev) => [...prev, { id: zone.id, name: zone.name }]);
  }

  function navigateBack(index: number) {
    const target = breadcrumbs[index]!;
    setCurrentZone(target.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] px-5 py-2.5 overflow-x-auto scrollbar-none">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.id ?? "root"} className="flex items-center gap-1 shrink-0">
            {i > 0 && <ChevronRight size={12} className="text-muted-dark" />}
            <button
              type="button"
              onClick={() => navigateBack(i)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                i === breadcrumbs.length - 1
                  ? "font-medium text-white/90"
                  : "text-muted hover:text-white/70",
              )}
            >
              {i === 0 && <Home size={12} />}
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Zones */}
        {childZones.length > 0 && (
          <div className="mb-2">
            <span className="mb-1.5 block px-2 text-[10px] font-medium uppercase tracking-wider text-muted-dark">
              Rooms
            </span>
            <div className="space-y-0.5">
              {childZones.map((zone) => (
                <button
                  key={`${zone.sourceId}:${zone.id}`}
                  type="button"
                  onClick={() => navigateToZone(zone)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-light"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                    <Home size={14} className="text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white/90">
                      {zone.name}
                    </span>
                    <span className="ml-2 text-xs text-muted">
                      {deviceCountByZone.get(zone.id) ?? 0} devices
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-muted-dark" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Zone control — offer "Lights control" for zones with lights */}
        {currentZone && <ZoneControlRow zoneId={currentZone} allDevices={allDevices} allZones={allZones} />}

        {/* Devices */}
        {zoneDevices.length > 0 && (
          <div>
            <span className="mb-1.5 block px-2 text-[10px] font-medium uppercase tracking-wider text-muted-dark">
              Devices
            </span>
            <div className="space-y-0.5">
              {zoneDevices.map((device) => (
                <DeviceRow key={`${device.sourceId}:${device.id}`} device={device} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {childZones.length === 0 && zoneDevices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted">
            <p className="text-sm">No devices in this room</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ZoneControlRow({
  zoneId,
  allDevices,
  allZones,
}: {
  zoneId: string;
  allDevices: Device[];
  allZones: Zone[];
}) {
  const addDevice = usePinnedDevicesStore((s) => s.addDevice);
  const removeDevice = usePinnedDevicesStore((s) => s.removeDevice);
  const isPinned = usePinnedDevicesStore((s) => s.isPinned);

  // Find sourceId from any device in this zone
  const sourceId = allDevices.find((d) => d.zone === zoneId)?.sourceId ?? "homey";

  // Check if zone (including children) has any lights
  const zoneIds = new Set<string>();
  zoneIds.add(zoneId);
  function addChildren(parentId: string) {
    for (const z of allZones) {
      if (z.parentId === parentId && !zoneIds.has(z.id)) {
        zoneIds.add(z.id);
        addChildren(z.id);
      }
    }
  }
  addChildren(zoneId);

  const lightCount = allDevices.filter(
    (d) => d.zone && zoneIds.has(d.zone) && d.capabilities.some((c) => c.id === "onoff" && c.settable),
  ).length;

  if (lightCount === 0) return null;

  const zoneKey = `zone:${sourceId}:${zoneId}`;
  const pinned = isPinned(zoneKey);
  const zone = allZones.find((z) => z.id === zoneId);

  return (
    <div className="mb-3">
      <span className="mb-1.5 block px-2 text-[10px] font-medium uppercase tracking-wider text-muted-dark">
        Zone Controls
      </span>
      <div
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-light"
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            pinned ? "bg-brand/15" : "bg-brand/10",
          )}
        >
          <Lightbulb size={14} className="text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-white/90">
            {zone?.name ?? "Zone"} — Lights
          </span>
          <p className="text-[11px] text-muted-dark">
            All on / all off for {lightCount} light{lightCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (pinned ? removeDevice(zoneKey) : addDevice(zoneKey))}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
            pinned
              ? "bg-brand/15 text-brand"
              : "border border-white/[0.08] text-muted hover:border-brand/30 hover:text-brand",
          )}
        >
          {pinned ? <Check size={14} /> : <Plus size={14} />}
        </button>
      </div>
    </div>
  );
}

function DeviceRow({ device }: { device: Device }) {
  const deviceKey = `${device.sourceId}:${device.id}`;
  const isPinned = usePinnedDevicesStore((s) => s.isPinned(deviceKey));
  const addDevice = usePinnedDevicesStore((s) => s.addDevice);
  const removeDevice = usePinnedDevicesStore((s) => s.removeDevice);

  const capSummary = device.capabilities
    .slice(0, 3)
    .map((c) => c.title)
    .join(", ");

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-light">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          isPinned ? "bg-brand/15" : "bg-white/[0.04]",
        )}
      >
        <span className="text-xs text-muted">
          {device.deviceClass.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-white/90">{device.name}</span>
        <p className="truncate text-[11px] text-muted-dark">{capSummary}</p>
      </div>
      <button
        type="button"
        onClick={() => (isPinned ? removeDevice(deviceKey) : addDevice(deviceKey))}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
          isPinned
            ? "bg-brand/15 text-brand"
            : "border border-white/[0.08] text-muted hover:border-brand/30 hover:text-brand",
        )}
      >
        {isPinned ? <Check size={14} /> : <Plus size={14} />}
      </button>
    </div>
  );
}
