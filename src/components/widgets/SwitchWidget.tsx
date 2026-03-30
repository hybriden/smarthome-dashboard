import { Plug } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { Toggle } from "@/components/controls/Toggle";
import { ValueDisplay } from "@/components/controls/ValueDisplay";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";

export function SwitchWidget({ device }: WidgetProps) {
  const { capability: onoff, setValue: setOnOff } = useCapability(device, "onoff");
  const { capability: power } = useCapability(device, "measure_power");

  return (
    <WidgetWrapper
      title={device.name}
      online={device.online}
      icon={<Plug size={18} />}
    >
      <div className="flex items-center justify-between">
        {power && (
          <ValueDisplay value={power.value} units={power.units} size="sm" />
        )}
        {onoff && (
          <Toggle
            checked={onoff.value === true}
            onChange={(v) => setOnOff(v)}
            disabled={!device.online}
          />
        )}
      </div>
    </WidgetWrapper>
  );
}
