import { WidgetWrapper } from "./WidgetWrapper";
import { Toggle } from "@/components/controls/Toggle";
import { Slider } from "@/components/controls/Slider";
import { LampIllustration } from "@/components/illustrations/DeviceIllustrations";
import { useCapability } from "@/hooks/useCapability";
import type { WidgetProps } from "./WidgetRegistry";

export function LightWidget({ device, customName, onRename }: WidgetProps) {
  const { capability: onoff, value: onoffValue, setValue: setOnOff } = useCapability(device, "onoff");
  const { capability: dim, value: dimValue, setValue: setDim } = useCapability(device, "dim", { debounce: 300 });

  const isOn = onoffValue === true;
  const brightness = dim ? Math.round((dimValue as number) * 100) : 0;

  return (
    <WidgetWrapper
      title={customName ?? device.name}
      onRename={onRename}
      subtitle={isOn ? `${brightness}% brightness` : "Off"}
      online={device.online}
      indicator={isOn ? "on" : "off"}
    >
      <div className="flex flex-1 items-center justify-center">
        <LampIllustration className="h-20 w-20" glow={isOn} />
      </div>
      <div className="mt-3 space-y-3">
        {dim && isOn && (
          <div className="no-drag flex items-center gap-3">
            <div className="rounded-lg bg-surface-dark/60 p-1.5">
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                <circle cx="8" cy="8" r="4" fill="#c8943e" opacity="0.6" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                  const r = (angle * Math.PI) / 180;
                  return (
                    <line
                      key={angle}
                      x1={8 + 5.5 * Math.cos(r)}
                      y1={8 + 5.5 * Math.sin(r)}
                      x2={8 + 7 * Math.cos(r)}
                      y2={8 + 7 * Math.sin(r)}
                      stroke="#c8943e"
                      strokeWidth="1"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                  );
                })}
              </svg>
            </div>
            <Slider
              value={dimValue as number}
              min={0}
              max={1}
              step={0.01}
              onChange={setDim}
              disabled={!device.online}
              className="flex-1"
            />
            <span className="min-w-[2.5rem] text-right text-sm font-medium text-white/70">
              {brightness}%
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Power</span>
          {onoff && (
            <Toggle
              checked={isOn}
              onChange={(v) => setOnOff(v)}
              disabled={!device.online}
              size="sm"
            />
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
}
