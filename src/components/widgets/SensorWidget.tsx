import { WidgetWrapper } from "./WidgetWrapper";
import { SensorIllustration } from "@/components/illustrations/DeviceIllustrations";
import { formatValue } from "@/utils/format";
import type { WidgetProps } from "./WidgetRegistry";

export function SensorWidget({ device }: WidgetProps) {
  const readCaps = device.capabilities.filter((c) => !c.settable);

  return (
    <WidgetWrapper
      title={device.name}
      subtitle={`${readCaps.length} reading${readCaps.length !== 1 ? "s" : ""}`}
      online={device.online}
      indicator="on"
    >
      <div className="flex flex-1 items-center gap-4">
        <SensorIllustration className="h-16 w-16 shrink-0" />
        <div className="flex flex-1 flex-col gap-2">
          {readCaps.map((cap) => (
            <div key={cap.id} className="flex items-baseline justify-between">
              <span className="text-xs text-muted">{cap.title}</span>
              <span className="text-lg font-semibold tabular-nums text-white/90">
                {formatValue(cap.value, cap.units)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </WidgetWrapper>
  );
}
