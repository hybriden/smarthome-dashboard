import { Thermometer } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { ValueDisplay } from "@/components/controls/ValueDisplay";
import { Slider } from "@/components/controls/Slider";
import { EnumPicker } from "@/components/controls/EnumPicker";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";

export function ThermostatWidget({ device }: WidgetProps) {
  const { capability: temp } = useCapability(device, "measure_temperature");
  const { capability: target, setValue: setTarget } = useCapability(device, "target_temperature");
  const { capability: mode, setValue: setMode } = useCapability(device, "thermostat_mode");

  return (
    <WidgetWrapper
      title={device.name}
      online={device.online}
      icon={<Thermometer size={18} />}
    >
      <div className="flex items-end justify-between gap-4">
        {temp && (
          <ValueDisplay
            value={temp.value}
            units={temp.units}
            label="Current"
          />
        )}
        {target && (
          <ValueDisplay
            value={target.value}
            units={target.units}
            label="Target"
            className="text-accent"
          />
        )}
      </div>
      {target && (
        <Slider
          value={target.value as number}
          min={target.min ?? 5}
          max={target.max ?? 30}
          step={target.step ?? 0.5}
          onChange={setTarget}
          disabled={!device.online}
          className="mt-3"
        />
      )}
      {mode?.options && (
        <EnumPicker
          options={mode.options}
          value={mode.value as string}
          onChange={setMode}
          disabled={!device.online}
        />
      )}
    </WidgetWrapper>
  );
}
