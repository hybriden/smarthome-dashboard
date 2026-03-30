import { WidgetWrapper } from "./WidgetWrapper";
import { Toggle } from "@/components/controls/Toggle";
import { Slider } from "@/components/controls/Slider";
import { EnumPicker } from "@/components/controls/EnumPicker";
import { formatValue } from "@/utils/format";
import { useCapability } from "@/hooks/useCapability";
import { useDebouncedCapability } from "@/hooks/useDebouncedCapability";
import type { Capability, Device } from "@/core/types";
import type { WidgetProps } from "./WidgetRegistry";

function SliderRow({ device, cap }: { device: Device; cap: Capability }) {
  const { value, setValue } = useDebouncedCapability(device, cap.id);

  return (
    <div className="no-drag">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{cap.title}</span>
        <span className="font-medium text-white/70">{formatValue(value, cap.units)}</span>
      </div>
      <Slider
        value={value as number}
        min={cap.min!}
        max={cap.max!}
        step={cap.step}
        onChange={setValue}
        disabled={!device.online}
        className="mt-1.5"
      />
    </div>
  );
}

function CapabilityRow({ device, cap }: { device: Device; cap: Capability }) {
  const { setValue } = useCapability(device, cap.id);

  if (cap.type === "boolean" && cap.settable) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{cap.title}</span>
        <Toggle
          checked={cap.value === true}
          onChange={setValue}
          size="sm"
          disabled={!device.online}
        />
      </div>
    );
  }

  if (cap.type === "number" && cap.settable && cap.min != null && cap.max != null) {
    return <SliderRow device={device} cap={cap} />;
  }

  if (cap.type === "enum" && cap.settable && cap.options) {
    return (
      <div className="no-drag">
        <span className="mb-1.5 block text-xs text-muted">{cap.title}</span>
        <EnumPicker
          options={cap.options}
          value={cap.value as string}
          onChange={setValue}
          disabled={!device.online}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted">{cap.title}</span>
      <span className="text-sm font-medium text-white/70">
        {formatValue(cap.value, cap.units)}
      </span>
    </div>
  );
}

export function GenericWidget({ device }: WidgetProps) {
  return (
    <WidgetWrapper
      title={device.name}
      subtitle={device.deviceClass}
      online={device.online}
      indicator={device.online ? "on" : "off"}
    >
      <div className="space-y-3 overflow-y-auto">
        {device.capabilities.map((cap) => (
          <CapabilityRow key={cap.id} device={device} cap={cap} />
        ))}
      </div>
    </WidgetWrapper>
  );
}
