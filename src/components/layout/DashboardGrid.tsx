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
    case "light":
      return { w: 1, h: 2 };
    case "sensor":
      return { w: 1, h: 2 };
    case "alarm":
      return { w: 1, h: 2 };
    default:
      return { w: 1, h: 2 };
  }
}

export function DashboardGrid() {
  const activeZone = useDashboardStore((s) => s.activeZone);
  const savedLayouts = useDashboardStore((s) => s.layouts);
  const setLayouts = useDashboardStore((s) => s.setLayouts);
  const devices = useDevices({ zone: activeZone });

  const layouts = useMemo(() => {
    const saved = new Map(savedLayouts.map((l) => [l.i, l]));
    let col = 0;
    let row = 0;
    let rowMaxH = 0;
    const cols = 6;

    return devices.map((device): Layout => {
      const key = `${device.sourceId}:${device.id}`;
      const existing = saved.get(key);
      if (existing) return existing;
      const size = widgetSize(device);

      if (col + size.w > cols) {
        col = 0;
        row += rowMaxH;
        rowMaxH = 0;
      }

      const layout: Layout = {
        i: key,
        x: col,
        y: row,
        w: size.w,
        h: size.h,
        minW: 1,
        minH: 1,
      };

      col += size.w;
      rowMaxH = Math.max(rowMaxH, size.h);
      return layout;
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
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-surface-card">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <path d="M12 2L2 9.5V20a2 2 0 002 2h16a2 2 0 002-2V9.5L12 2z" stroke="#4a4440" strokeWidth="1.5" fill="none" />
              <path d="M9 22V12h6v10" stroke="#4a4440" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="text-sm text-muted">No devices found</p>
          <p className="mt-1 text-xs text-muted-dark">Connect a data source in Settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-4 py-2">
      <ResponsiveGrid
        className="layout"
        layouts={{ lg: layouts, md: layouts, sm: layouts }}
        breakpoints={{ lg: 1024, md: 768, sm: 0 }}
        cols={{ lg: 6, md: 4, sm: 2 }}
        rowHeight={130}
        margin={[14, 14]}
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
