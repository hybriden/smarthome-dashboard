import { Power } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { Toggle } from "@/components/controls/Toggle";
import { PlugIllustration } from "@/components/illustrations/DeviceIllustrations";
import { formatValue } from "@/utils/format";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";
import type { Capability } from "@/core/types";
import { cn } from "@/utils/cn";
import { manager } from "@/core/manager";

function findCaps(capabilities: Capability[]) {
  const onoffs = capabilities.filter(
    (c) => c.id.startsWith("onoff") && c.settable,
  );
  const power = capabilities.find((c) => c.id.startsWith("measure_power"));
  return { onoffs, power };
}

function OnOffToggle({
  device,
  cap,
  large,
}: {
  device: { sourceId: string; id: string; online: boolean };
  cap: Capability;
  large?: boolean;
}) {
  const isOn = cap.value === true;
  const label =
    cap.title !== "On/Off" ? cap.title : cap.id.includes(".") ? cap.id.split(".")[1] : "";

  return (
    <button
      type="button"
      disabled={!device.online}
      onClick={() =>
        manager.setCapabilityValue(device.sourceId, device.id, cap.id, !isOn)
      }
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 transition-all",
        large ? "py-4" : "py-3",
        isOn
          ? "border-brand/25 bg-brand/10"
          : "border-white/[0.06] bg-surface-dark/50",
        device.online ? "hover:bg-brand/15 active:scale-[0.98]" : "opacity-50",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
          isOn ? "bg-brand/20" : "bg-white/[0.04]",
        )}
      >
        <Power
          size={18}
          className={cn(
            "transition-colors",
            isOn ? "text-brand" : "text-muted-dark",
          )}
        />
      </div>
      <div className="flex-1 text-left">
        {label && (
          <span className="block text-[11px] capitalize text-muted">{label}</span>
        )}
        <span
          className={cn(
            "text-sm font-medium",
            isOn ? "text-brand" : "text-muted",
          )}
        >
          {isOn ? "On" : "Off"}
        </span>
      </div>
    </button>
  );
}

export function SwitchWidget({ device, customName, onRename }: WidgetProps) {
  const { onoffs, power } = findCaps(device.capabilities);

  // Fallback: try exact "onoff" for simple devices
  const { capability: simpleOnoff, setValue: setSimpleOnoff } = useCapability(
    device,
    "onoff",
  );

  const hasMultipleOutputs = onoffs.length > 1;
  const hasPower = !!power;
  const anyOn = onoffs.some((c) => c.value === true) || simpleOnoff?.value === true;

  // Simple switch with power (e.g. smart plug)
  if (!hasMultipleOutputs && hasPower) {
    const isOn = simpleOnoff?.value === true || onoffs[0]?.value === true;
    return (
      <WidgetWrapper
        title={customName ?? device.name}
        onRename={onRename}
        subtitle={isOn ? `${formatValue(power.value, power.units)} active` : "Standby"}
        online={device.online}
        indicator={isOn ? "on" : "off"}
      >
        <div className="flex flex-1 items-center justify-center">
          <PlugIllustration className="h-20 w-20" glow={isOn} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tabular-nums text-white/90">
              {formatValue(power.value)}
            </span>
            <span className="text-xs text-muted">{power.units}</span>
          </div>
          {(simpleOnoff || onoffs[0]) && (
            <Toggle
              checked={isOn ?? false}
              onChange={(v) => {
                if (simpleOnoff) setSimpleOnoff(v);
                else if (onoffs[0])
                  manager.setCapabilityValue(
                    device.sourceId,
                    device.id,
                    onoffs[0].id,
                    v,
                  );
              }}
              disabled={!device.online}
              size="sm"
            />
          )}
        </div>
      </WidgetWrapper>
    );
  }

  // Toggle-only: garage doors, relays, simple switches without power
  return (
    <WidgetWrapper
      title={customName ?? device.name}
        onRename={onRename}
      subtitle={anyOn ? "Active" : "Off"}
      online={device.online}
      indicator={anyOn ? "on" : "off"}
    >
      <div className="flex flex-1 flex-col justify-center gap-2">
        {onoffs.length > 0 ? (
          onoffs.map((cap) => (
            <OnOffToggle
              key={cap.id}
              device={device}
              cap={cap}
              large={onoffs.length === 1}
            />
          ))
        ) : simpleOnoff ? (
          <OnOffToggle device={device} cap={simpleOnoff} large />
        ) : null}
      </div>
    </WidgetWrapper>
  );
}
