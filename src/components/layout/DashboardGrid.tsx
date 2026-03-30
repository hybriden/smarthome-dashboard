import { useMemo, useCallback } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Plus, Trash2 } from "lucide-react";
import { useDeviceStore } from "@/store/devices";
import { usePinnedDevicesStore } from "@/store/pinnedDevices";
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
  const allDevices = useDeviceStore((s) => s.devices);
  const pinned = usePinnedDevicesStore((s) => s.pinned);
  const removeDevice = usePinnedDevicesStore((s) => s.removeDevice);
  const setShowPicker = usePinnedDevicesStore((s) => s.setShowDevicePicker);
  const savedLayouts = useDashboardStore((s) => s.layouts);
  const setLayouts = useDashboardStore((s) => s.setLayouts);

  const devices = useMemo(
    () =>
      pinned
        .map((key) => allDevices.get(key))
        .filter((d): d is Device => d != null),
    [pinned, allDevices],
  );

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
            <Plus size={24} className="text-muted" />
          </div>
          <p className="text-sm text-white/70">Your dashboard is empty</p>
          <p className="mt-1 text-xs text-muted">Add devices to get started</p>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="mt-4 rounded-xl bg-brand/15 px-6 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand/25"
          >
            Add Devices
          </button>
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
        draggableCancel="input, button, [role='switch'], .no-drag"
        onLayoutChange={onLayoutChange}
      >
        {devices.map((device) => {
          const key = `${device.sourceId}:${device.id}`;
          const Widget = getWidgetComponent(device.deviceClass);
          return (
            <div key={key} className="group relative">
              <Widget device={device} />
              <button
                type="button"
                onClick={() => removeDevice(key)}
                className="no-drag absolute -right-1 -top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-surface-dark border border-white/[0.08] text-muted hover:bg-brand-danger/20 hover:text-brand-danger group-hover:flex transition-colors"
              >
                <Trash2 size={10} />
              </button>
            </div>
          );
        })}
      </ResponsiveGrid>
    </div>
  );
}
