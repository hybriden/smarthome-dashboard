import { useMemo, useState } from "react";
import { Lightbulb, LightbulbOff, Power } from "lucide-react";
import { useDeviceStore } from "@/store/devices";
import { useZoneStore } from "@/store/zones";
import { manager } from "@/core/manager";
import { cn } from "@/utils/cn";

interface ZoneControlWidgetProps {
  zoneKey: string; // "zone:sourceId:zoneId"
}

export function ZoneControlWidget({ zoneKey }: ZoneControlWidgetProps) {
  const [, sourceId, zoneId] = zoneKey.split(":");
  const zones = useZoneStore((s) => s.zones);
  const devices = useDeviceStore((s) => s.devices);
  const [busy, setBusy] = useState(false);

  const zone = useMemo(() => {
    for (const z of zones.values()) {
      if (z.sourceId === sourceId && z.id === zoneId) return z;
    }
    return null;
  }, [zones, sourceId, zoneId]);

  // Get all zone IDs including children (recursive)
  const allZoneIds = useMemo(() => {
    const ids = new Set<string>();
    ids.add(zoneId!);

    function addChildren(parentId: string) {
      for (const z of zones.values()) {
        if (z.sourceId === sourceId && z.parentId === parentId && !ids.has(z.id)) {
          ids.add(z.id);
          addChildren(z.id);
        }
      }
    }
    addChildren(zoneId!);
    return ids;
  }, [zones, sourceId, zoneId]);

  // Find all lights in this zone tree
  const lights = useMemo(() => {
    const result: { sourceId: string; deviceId: string; capId: string; isOn: boolean }[] = [];
    for (const d of devices.values()) {
      if (d.sourceId !== sourceId || !d.zone || !allZoneIds.has(d.zone)) continue;
      const onoff = d.capabilities.find(
        (c) => c.id === "onoff" && c.settable,
      );
      if (onoff) {
        result.push({
          sourceId: d.sourceId,
          deviceId: d.id,
          capId: onoff.id,
          isOn: onoff.value === true,
        });
      }
    }
    return result;
  }, [devices, sourceId, allZoneIds]);

  const onCount = lights.filter((l) => l.isOn).length;
  const totalCount = lights.length;

  async function setAllLights(on: boolean) {
    setBusy(true);
    try {
      await Promise.all(
        lights.map((l) =>
          manager.setCapabilityValue(l.sourceId, l.deviceId, l.capId, on),
        ),
      );
    } catch (err) {
      console.error("Failed to set lights:", err);
    }
    setBusy(false);
  }

  return (
    <div className="widget-card relative flex h-full flex-col rounded-3xl border border-white/[0.06] bg-surface-card p-5">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-[15px] font-semibold text-white/90">
          {zone?.name ?? "Zone"}
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          {onCount}/{totalCount} lights on
        </p>
      </div>

      {/* Light status bar */}
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-dark">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: totalCount > 0 ? `${(onCount / totalCount) * 100}%` : "0%" }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-1 gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => setAllLights(true)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border py-4 transition-all active:scale-[0.97]",
            onCount === totalCount && totalCount > 0
              ? "border-brand/25 bg-brand/10"
              : "border-white/[0.06] hover:bg-surface-light",
            busy && "opacity-50",
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              onCount === totalCount && totalCount > 0
                ? "bg-brand/20"
                : "bg-white/[0.04]",
            )}
          >
            <Lightbulb
              size={22}
              className={
                onCount === totalCount && totalCount > 0
                  ? "text-brand"
                  : "text-muted"
              }
            />
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              onCount === totalCount && totalCount > 0
                ? "text-brand"
                : "text-muted",
            )}
          >
            All On
          </span>
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => setAllLights(false)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border py-4 transition-all active:scale-[0.97]",
            onCount === 0 && totalCount > 0
              ? "border-muted-dark/50 bg-surface-dark"
              : "border-white/[0.06] hover:bg-surface-light",
            busy && "opacity-50",
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              onCount === 0 ? "bg-muted-dark/20" : "bg-white/[0.04]",
            )}
          >
            <LightbulbOff
              size={22}
              className={onCount === 0 ? "text-muted-dark" : "text-muted"}
            />
          </div>
          <span className="text-xs font-medium text-muted">All Off</span>
        </button>
      </div>

      {/* Power indicator */}
      {onCount > 0 && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-brand/60">
          <Power size={10} />
          {onCount} light{onCount !== 1 ? "s" : ""} active
        </div>
      )}
    </div>
  );
}
