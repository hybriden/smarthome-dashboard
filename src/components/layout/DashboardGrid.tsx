import { useMemo, useCallback } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Plus } from "lucide-react";
import { useDeviceStore } from "@/store/devices";
import { usePinnedDevicesStore } from "@/store/pinnedDevices";
import { useDashboardStore } from "@/store/dashboard";
import { useCardConfigStore } from "@/store/cardConfig";
import { getWidgetComponent } from "@/components/widgets/WidgetRegistry";
import { ZoneControlWidget } from "@/components/widgets/ZoneControlWidget";
import type { Device } from "@/core/types";

const ResponsiveGrid = WidthProvider(Responsive);

type PinnedItem =
  | { type: "device"; key: string; device: Device }
  | { type: "zone"; key: string };

function widgetSize(item: PinnedItem): { w: number; h: number } {
  if (item.type === "zone") return { w: 1, h: 2 };
  switch (item.device.deviceClass) {
    case "thermostat":
      return { w: 2, h: 3 };
    case "speaker":
      return { w: 1, h: 3 };
    case "lock":
      return { w: 1, h: 3 };
    case "garagedoor":
      return { w: 1, h: 3 };
    case "solar":
      return { w: 1, h: 3 };
    case "powermeter":
      return { w: 2, h: 3 };
    case "electricitycost":
      return { w: 1, h: 3 };
    case "evcharger":
      return { w: 2, h: 3 };
    case "light":
      return { w: 1, h: 2 };
    case "sensor":
      return { w: 2, h: 2 };
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
  const getCustomName = useCardConfigStore((s) => s.getCustomName);
  const setCustomName = useCardConfigStore((s) => s.setCustomName);

  const items = useMemo((): PinnedItem[] => {
    const result: PinnedItem[] = [];
    for (const key of pinned) {
      if (key.startsWith("zone:")) {
        result.push({ type: "zone", key });
      } else {
        const device = allDevices.get(key);
        if (device) result.push({ type: "device", key, device });
      }
    }
    return result;
  }, [pinned, allDevices]);

  function generateDefaultLayouts(cols: number): Layout[] {
    let col = 0;
    let row = 0;
    let rowMaxH = 0;

    return items.map((item): Layout => {
      const size = widgetSize(item);

      if (col + size.w > cols) {
        col = 0;
        row += rowMaxH;
        rowMaxH = 0;
      }

      const layout: Layout = {
        i: item.key,
        x: col,
        y: row,
        w: Math.min(size.w, cols),
        h: size.h,
        minW: 1,
        minH: 1,
      };

      col += layout.w;
      rowMaxH = Math.max(rowMaxH, size.h);
      return layout;
    });
  }

  const allLayouts = useMemo(() => {
    const colsMap = { lg: 6, md: 4, sm: 2 } as const;
    const result: Record<string, Layout[]> = {};

    for (const bp of ["lg", "md", "sm"] as const) {
      const saved = savedLayouts[bp];
      if (saved && saved.length > 0) {
        const savedMap = new Map(saved.map((l) => [l.i, l]));
        // Merge saved with defaults for any new items
        const defaults = generateDefaultLayouts(colsMap[bp]);
        result[bp] = defaults.map((d) => savedMap.get(d.i) ?? d);
      } else {
        result[bp] = generateDefaultLayouts(colsMap[bp]);
      }
    }

    return result;
  }, [items, savedLayouts]);

  const onLayoutChange = useCallback(
    (_current: Layout[], allBreakpointLayouts: { [key: string]: Layout[] }) => {
      setLayouts(allBreakpointLayouts);
    },
    [setLayouts],
  );

  if (items.length === 0) {
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
        layouts={allLayouts}
        breakpoints={{ lg: 1024, md: 768, sm: 0 }}
        cols={{ lg: 6, md: 4, sm: 2 }}
        rowHeight={100}
        margin={[14, 14]}
        containerPadding={[0, 0]}
        isDraggable
        isResizable
        compactType="vertical"
        draggableCancel="input, button, [role='switch'], .no-drag"
        onLayoutChange={onLayoutChange}
      >
        {items.map((item) => {
          if (item.type === "zone") {
            return (
              <div key={item.key} className="h-full">
                <ZoneControlWidget zoneKey={item.key} />
              </div>
            );
          }

          const Widget = getWidgetComponent(item.device.deviceClass);
          return (
            <div key={item.key} className="h-full">
              <Widget
                device={item.device}
                customName={getCustomName(item.key)}
                onRename={(name) => setCustomName(item.key, name)}
                onRemove={() => removeDevice(item.key)}
              />
            </div>
          );
        })}
      </ResponsiveGrid>
    </div>
  );
}
