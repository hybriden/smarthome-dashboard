import { useMemo } from "react";
import { ChevronUp, ChevronDown, Battery, Thermometer } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { GarageDoorIllustration } from "@/components/illustrations/DeviceIllustrations";
import { useDeviceStore } from "@/store/devices";
import { manager } from "@/core/manager";
import type { WidgetProps } from "./WidgetRegistry";
import { cn } from "@/utils/cn";

export function GarageDoorWidget({ device, customName, onRename }: WidgetProps) {
  const allDevices = useDeviceStore((s) => s.devices);

  // Find the matching contact sensor: "Garasjeport Høyre" → "Garasjeport Høyre Sensor"
  const sensor = useMemo(() => {
    for (const d of allDevices.values()) {
      if (
        d.sourceId === device.sourceId &&
        d.name.startsWith(device.name) &&
        d.name.includes("Sensor")
      ) {
        return d;
      }
    }
    return null;
  }, [allDevices, device.sourceId, device.name]);

  // Get sensor data
  const contactAlarm = sensor?.capabilities.find(
    (c) => c.id === "alarm_contact",
  );
  const battery = sensor?.capabilities.find(
    (c) => c.id === "measure_battery",
  );
  const temperature = sensor?.capabilities.find(
    (c) => c.id === "measure_temperature",
  );

  // Door state from contact sensor (alarm_contact: true = open, false = closed)
  const isOpen = contactAlarm ? contactAlarm.value === true : false;

  // Find the first settable onoff (output1 is the door relay)
  const doorCap = device.capabilities.find(
    (c) => c.id.startsWith("onoff") && c.settable,
  );

  function toggle() {
    if (!doorCap) return;
    manager.setCapabilityValue(
      device.sourceId,
      device.id,
      doorCap.id,
      true,
    );
    // Pulse: send true then false after 500ms (momentary relay)
    setTimeout(() => {
      manager.setCapabilityValue(
        device.sourceId,
        device.id,
        doorCap.id,
        false,
      );
    }, 500);
  }

  const batteryLevel = battery?.value as number | undefined;
  const temp = temperature?.value as number | undefined;

  return (
    <WidgetWrapper
      title={customName ?? device.name}
      onRename={onRename}
      subtitle={isOpen ? "Open" : "Closed"}
      online={device.online}
      indicator={isOpen ? "alarm" : "on"}
    >
      {/* Door illustration */}
      <div className="flex flex-1 min-h-0 items-center justify-center">
        <GarageDoorIllustration className="h-20 w-full max-w-[200px] max-h-full" open={isOpen} />
      </div>

      {/* Sensor info */}
      {sensor && (
        <div className="mb-2 flex items-center justify-center gap-3 text-[10px] text-muted">
          {batteryLevel != null && (
            <span className={cn("flex items-center gap-1", batteryLevel < 20 && "text-brand-danger")}>
              <Battery size={10} />
              {batteryLevel}%
            </span>
          )}
          {temp != null && (
            <span className="flex items-center gap-1">
              <Thermometer size={10} />
              {temp.toFixed(1)}°C
            </span>
          )}
          {!contactAlarm && (
            <span className="text-brand-danger">No sensor</span>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        disabled={!device.online || !doorCap}
        onClick={toggle}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-medium transition-all active:scale-[0.97]",
          isOpen
            ? "border border-brand/25 bg-brand/10 text-brand hover:bg-brand/20"
            : "border border-white/[0.08] bg-surface-dark text-white/70 hover:bg-surface-light",
          (!device.online || !doorCap) && "cursor-not-allowed opacity-40",
        )}
      >
        {isOpen ? (
          <>
            <ChevronDown size={16} />
            Close Door
          </>
        ) : (
          <>
            <ChevronUp size={16} />
            Open Door
          </>
        )}
      </button>
    </WidgetWrapper>
  );
}
