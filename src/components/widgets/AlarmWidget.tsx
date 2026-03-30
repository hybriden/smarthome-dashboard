import { ShieldAlert } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { StatusDot } from "@/components/controls/StatusDot";
import type { WidgetProps } from "./WidgetRegistry";

export function AlarmWidget({ device }: WidgetProps) {
  const alarmCaps = device.capabilities.filter((c) =>
    c.id.startsWith("alarm_"),
  );
  const anyActive = alarmCaps.some((c) => c.value === true);

  return (
    <WidgetWrapper
      title={device.name}
      online={device.online}
      icon={
        <ShieldAlert
          size={18}
          className={anyActive ? "text-accent-danger" : ""}
        />
      }
    >
      <div className="space-y-2">
        {alarmCaps.map((cap) => (
          <div key={cap.id} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{cap.title}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {cap.value ? "Triggered" : "Clear"}
              </span>
              <StatusDot
                status={cap.value ? "alarm" : "online"}
              />
            </div>
          </div>
        ))}
      </div>
    </WidgetWrapper>
  );
}
