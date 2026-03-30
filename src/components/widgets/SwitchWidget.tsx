import { WidgetWrapper } from "./WidgetWrapper";
import { Toggle } from "@/components/controls/Toggle";
import { PlugIllustration } from "@/components/illustrations/DeviceIllustrations";
import { formatValue } from "@/utils/format";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";

export function SwitchWidget({ device }: WidgetProps) {
  const { capability: onoff, setValue: setOnOff } = useCapability(device, "onoff");
  const { capability: power } = useCapability(device, "measure_power");

  const isOn = onoff?.value === true;

  return (
    <WidgetWrapper
      title={device.name}
      subtitle={isOn ? (power ? `${formatValue(power.value, power.units)} active` : "On") : "Standby"}
      online={device.online}
      indicator={isOn ? "on" : "off"}
    >
      <div className="flex flex-1 items-center justify-center">
        <PlugIllustration className="h-20 w-20" glow={isOn} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        {power && (
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tabular-nums text-white/90">
              {formatValue(power.value)}
            </span>
            <span className="text-xs text-muted">{power.units}</span>
          </div>
        )}
        {!power && <span className="text-xs text-muted">{isOn ? "Active" : "Standby"}</span>}
        {onoff && (
          <Toggle
            checked={isOn}
            onChange={(v) => setOnOff(v)}
            disabled={!device.online}
            size="sm"
          />
        )}
      </div>
    </WidgetWrapper>
  );
}
