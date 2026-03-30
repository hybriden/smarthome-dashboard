import { useMemo, useCallback } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useDevices } from "@/hooks/useDevices";
import { useDashboardStore } from "@/store/dashboard";
import { getWidgetComponent } from "@/components/widgets/WidgetRegistry";
import type { Device } from "@/core/types";

const ResponsiveGrid = WidthProvider(Responsive);

function widgetSize(device: Device): { w: number; h: number } {
  switch (device.deviceClass) {
    case "thermostat":
      return { w: 2, h: 2 };
    case "sensor":
      return { w: 1, h: 1 };
    case "alarm":
      return { w: 1, h: 1 };
    default:
      return { w: 1, h: 1 };
  }
}

export function DashboardGrid() {
  const activeZone = useDashboardStore((s) => s.activeZone);
  const savedLayouts = useDashboardStore((s) => s.layouts);
  const setLayouts = useDashboardStore((s) => s.setLayouts);
  const devices = useDevices({ zone: activeZone });

  const layouts = useMemo(() => {
    const saved = new Map(savedLayouts.map((l) => [l.i, l]));
    return devices.map((device, index): Layout => {
      const key = `${device.sourceId}:${device.id}`;
      const existing = saved.get(key);
      if (existing) return existing;
      const size = widgetSize(device);
      return {
        i: key,
        x: (index * size.w) % 4,
        y: Math.floor(index / 4) * size.h,
        w: size.w,
        h: size.h,
        minW: 1,
        minH: 1,
      };
    });
  }, [devices, savedLayouts]);

  const onLayoutChange = useCallback(
    (_current: Layout[], allLayouts: { [key: string]: Layout[] }) => {
      const lg = allLayouts["lg"] ?? _current;
      setLayouts(lg);
    },
    [setLayouts],
  );

  if (devices.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500">
        <p>No devices found. Connect a data source in Settings.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <ResponsiveGrid
        className="layout"
        layouts={{ lg: layouts, md: layouts, sm: layouts }}
        breakpoints={{ lg: 1024, md: 768, sm: 0 }}
        cols={{ lg: 6, md: 4, sm: 2 }}
        rowHeight={160}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        isDraggable
        isResizable
        compactType="vertical"
        onLayoutChange={onLayoutChange}
      >
        {devices.map((device) => {
          const Widget = getWidgetComponent(device.deviceClass);
          return (
            <div key={`${device.sourceId}:${device.id}`}>
              <Widget device={device} />
            </div>
          );
        })}
      </ResponsiveGrid>
    </div>
  );
}
