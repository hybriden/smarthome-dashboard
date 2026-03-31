import { WidgetWrapper } from "./WidgetWrapper";
import { AlarmIllustration } from "@/components/illustrations/DeviceIllustrations";
import type { WidgetProps } from "./WidgetRegistry";

export function AlarmWidget({ device, customName, onRename }: WidgetProps) {
  const alarmCaps = device.capabilities.filter((c) => c.id.startsWith("alarm_"));
  const anyActive = alarmCaps.some((c) => c.value === true);

  return (
    <WidgetWrapper
      title={customName ?? device.name}
      onRename={onRename}
      subtitle={anyActive ? "Triggered" : "All clear"}
      online={device.online}
      indicator={anyActive ? "alarm" : "on"}
    >
      <div className="flex flex-1 items-center justify-center">
        <AlarmIllustration className="h-20 w-20" triggered={anyActive} />
      </div>
      <div className="mt-2 space-y-1.5">
        {alarmCaps.map((cap) => (
          <div key={cap.id} className="flex items-center justify-between">
            <span className="text-xs text-muted">{cap.title}</span>
            <span
              className={
                cap.value
                  ? "text-xs font-medium text-brand-danger"
                  : "text-xs text-brand-success/70"
              }
            >
              {cap.value ? "Active" : "Clear"}
            </span>
          </div>
        ))}
      </div>
    </WidgetWrapper>
  );
}
