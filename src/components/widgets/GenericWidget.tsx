import { Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { Toggle } from "@/components/controls/Toggle";
import { Slider } from "@/components/controls/Slider";
import { EnumPicker } from "@/components/controls/EnumPicker";
import { formatValue } from "@/utils/format";
import { useCapability } from "@/hooks/useCapability";
import { useCardConfigStore } from "@/store/cardConfig";
import { CardConfigPopover } from "./CardConfigPopover";
import type { Capability, Device } from "@/core/types";
import type { WidgetProps } from "./WidgetRegistry";

function SliderRow({ device, cap }: { device: Device; cap: Capability }) {
  const { value, setValue } = useCapability(device, cap.id, { debounce: 300 });

  return (
    <div className="no-drag">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{cap.title}</span>
        <span className="font-medium text-white/70">
          {formatValue(value, cap.units)}
        </span>
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
  const { value, setValue } = useCapability(device, cap.id);

  if (cap.type === "boolean" && cap.settable) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{cap.title}</span>
        <Toggle
          checked={value === true}
          onChange={setValue}
          size="sm"
          disabled={!device.online}
        />
      </div>
    );
  }

  if (
    cap.type === "number" &&
    cap.settable &&
    cap.min != null &&
    cap.max != null
  ) {
    return <SliderRow device={device} cap={cap} />;
  }

  if (cap.type === "enum" && cap.settable && cap.options) {
    return (
      <div className="no-drag">
        <span className="mb-1.5 block text-xs text-muted">{cap.title}</span>
        <EnumPicker
          options={cap.options}
          value={value as string}
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
        {formatValue(value, cap.units)}
      </span>
    </div>
  );
}

export function GenericWidget({ device }: WidgetProps) {
  const deviceKey = `${device.sourceId}:${device.id}`;
  const allCapIds = device.capabilities.map((c) => c.id);
  const getVisibleCaps = useCardConfigStore((s) => s.getVisibleCaps);
  const isExpanded = useCardConfigStore((s) => s.isExpanded);
  const toggleExpanded = useCardConfigStore((s) => s.toggleExpanded);
  const editing = useCardConfigStore((s) => s.editing);
  const setEditing = useCardConfigStore((s) => s.setEditing);

  const visibleCapIds = getVisibleCaps(deviceKey, allCapIds);
  const expanded = isExpanded(deviceKey);

  const visibleCaps = device.capabilities.filter((c) =>
    visibleCapIds.includes(c.id),
  );
  const hiddenCount = device.capabilities.length - visibleCaps.length;
  const capsToShow = expanded ? device.capabilities : visibleCaps;

  return (
    <WidgetWrapper
      title={device.name}
      subtitle={device.deviceClass}
      online={device.online}
      indicator={device.online ? "on" : "off"}
    >
      {/* Configure button */}
      <button
        type="button"
        onClick={() => setEditing(editing === deviceKey ? null : deviceKey)}
        className="absolute right-3 top-3 rounded-lg p-1 text-muted-dark transition-colors hover:bg-surface-light hover:text-muted"
      >
        <Settings2 size={13} />
      </button>

      {/* Config popover */}
      {editing === deviceKey && (
        <CardConfigPopover device={device} deviceKey={deviceKey} />
      )}

      {/* Capabilities */}
      <div className="space-y-2.5 overflow-y-auto">
        {capsToShow.map((cap) => (
          <CapabilityRow key={cap.id} device={device} cap={cap} />
        ))}
      </div>

      {/* Expand/collapse */}
      {hiddenCount > 0 && !expanded && (
        <button
          type="button"
          onClick={() => toggleExpanded(deviceKey)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1 text-[11px] text-muted transition-colors hover:bg-surface-light hover:text-white/70"
        >
          <ChevronDown size={12} />
          {hiddenCount} more
        </button>
      )}
      {expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => toggleExpanded(deviceKey)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1 text-[11px] text-muted transition-colors hover:bg-surface-light hover:text-white/70"
        >
          <ChevronUp size={12} />
          Show less
        </button>
      )}
    </WidgetWrapper>
  );
}
