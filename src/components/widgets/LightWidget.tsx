import { Lightbulb } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { Toggle } from "@/components/controls/Toggle";
import { Slider } from "@/components/controls/Slider";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";

export function LightWidget({ device }: WidgetProps) {
  const { capability: onoff, setValue: setOnOff } = useCapability(device, "onoff");
  const { capability: dim, setValue: setDim } = useCapability(device, "dim");

  const isOn = onoff?.value === true;

  return (
    <WidgetWrapper
      title={device.name}
      online={device.online}
      icon={<Lightbulb size={18} className={isOn ? "text-accent-warm" : ""} />}
    >
      <div className="flex items-center justify-between">
        {dim && (
          <span className="text-2xl font-bold tabular-nums">
            {Math.round((dim.value as number) * 100)}%
          </span>
        )}
        {onoff && (
          <Toggle
            checked={isOn}
            onChange={(v) => setOnOff(v)}
            disabled={!device.online}
          />
        )}
      </div>
      {dim && isOn && (
        <Slider
          value={dim.value as number}
          min={0}
          max={1}
          step={0.01}
          onChange={setDim}
          disabled={!device.online}
          className="mt-3"
        />
      )}
    </WidgetWrapper>
  );
}
