import { Blinds } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { Slider } from "@/components/controls/Slider";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";

export function CoverWidget({ device }: WidgetProps) {
  const { capability: pos, setValue: setPos } = useCapability(
    device,
    "windowcoverings_set",
  );

  return (
    <WidgetWrapper
      title={device.name}
      online={device.online}
      icon={<Blinds size={18} />}
    >
      {pos && (
        <>
          <div className="mb-2 text-center text-2xl font-bold tabular-nums">
            {Math.round((pos.value as number) * 100)}%
          </div>
          <Slider
            value={pos.value as number}
            min={0}
            max={1}
            step={0.01}
            onChange={setPos}
            disabled={!device.online}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Open</span>
            <span>Closed</span>
          </div>
        </>
      )}
    </WidgetWrapper>
  );
}
