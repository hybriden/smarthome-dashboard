import { WidgetWrapper } from "./WidgetWrapper";
import { Slider } from "@/components/controls/Slider";
import { EnumPicker } from "@/components/controls/EnumPicker";
import { ThermostatIllustration } from "@/components/illustrations/DeviceIllustrations";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";

export function ThermostatWidget({ device }: WidgetProps) {
  const { value: tempValue } = useCapability(device, "measure_temperature");
  const { capability: target, value: targetValue, setValue: setTarget } = useCapability(device, "target_temperature", { debounce: 500 });
  const { capability: mode, value: modeValue, setValue: setMode } = useCapability(device, "thermostat_mode");

  const currentTemp = tempValue as number | undefined;
  const targetTemp = targetValue as number | undefined;
  const modeStr = modeValue as string | undefined;

  return (
    <WidgetWrapper
      title={device.name}
      subtitle={modeStr ? `${modeStr.charAt(0).toUpperCase()}${modeStr.slice(1)} mode` : undefined}
      online={device.online}
      indicator="on"
    >
      <div className="flex flex-1 items-center justify-center gap-6">
        <div className="relative">
          <ThermostatIllustration className="h-24 w-24" />
          {currentTemp != null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
              <span className="text-2xl font-bold tabular-nums text-white">
                {currentTemp.toFixed(0)}
              </span>
              <span className="text-[10px] text-muted">°C</span>
            </div>
          )}
        </div>
        {targetTemp != null && (
          <div className="text-center">
            <span className="text-xs text-muted">Target</span>
            <div className="mt-1 text-3xl font-light tabular-nums text-brand">
              {targetTemp}
              <span className="text-lg text-brand-dim">°</span>
            </div>
          </div>
        )}
      </div>

      <div className="no-drag mt-3 space-y-3">
        {target && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{target.min ?? 5}°</span>
            <Slider
              value={targetValue as number}
              min={target.min ?? 5}
              max={target.max ?? 30}
              step={target.step ?? 0.5}
              onChange={setTarget}
              disabled={!device.online}
              className="flex-1"
            />
            <span className="text-xs text-muted">{target.max ?? 30}°</span>
          </div>
        )}
        {mode?.options && (
          <EnumPicker
            options={mode.options}
            value={modeValue as string}
            onChange={setMode}
            disabled={!device.online}
          />
        )}
      </div>
    </WidgetWrapper>
  );
}
