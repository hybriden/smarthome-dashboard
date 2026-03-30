import { WidgetWrapper } from "./WidgetWrapper";
import { Slider } from "@/components/controls/Slider";
import { BlindsIllustration } from "@/components/illustrations/DeviceIllustrations";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";

export function CoverWidget({ device }: WidgetProps) {
  const { capability: pos, value: posValue, setValue: setPos } = useCapability(device, "windowcoverings_set", { debounce: 300 });
  const percent = pos ? Math.round((posValue as number) * 100) : 0;

  return (
    <WidgetWrapper
      title={device.name}
      subtitle={`${percent}% closed`}
      online={device.online}
      indicator="on"
    >
      <div className="flex flex-1 items-center justify-center">
        <BlindsIllustration className="h-20 w-20" openPercent={percent} />
      </div>
      {pos && (
        <div className="no-drag mt-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted">Open</span>
            <Slider
              value={posValue as number}
              min={0}
              max={1}
              step={0.01}
              onChange={setPos}
              disabled={!device.online}
              className="flex-1"
            />
            <span className="text-[10px] text-muted">Closed</span>
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
}
