import { Gauge } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { ValueDisplay } from "@/components/controls/ValueDisplay";
import type { WidgetProps } from "./WidgetRegistry";

export function SensorWidget({ device }: WidgetProps) {
  const readCaps = device.capabilities.filter((c) => !c.settable);

  return (
    <WidgetWrapper
      title={device.name}
      online={device.online}
      icon={<Gauge size={18} />}
    >
      <div className="flex flex-wrap items-end justify-around gap-3">
        {readCaps.map((cap) => (
          <ValueDisplay
            key={cap.id}
            value={cap.value}
            units={cap.units}
            label={cap.title}
          />
        ))}
      </div>
    </WidgetWrapper>
  );
}
