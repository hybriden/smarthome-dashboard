import { X, Eye, EyeOff } from "lucide-react";
import { useCardConfigStore } from "@/store/cardConfig";
import type { Device } from "@/core/types";
import { cn } from "@/utils/cn";

interface CardConfigPopoverProps {
  device: Device;
  deviceKey: string;
}

export function CardConfigPopover({
  device,
  deviceKey,
}: CardConfigPopoverProps) {
  const allCapIds = device.capabilities.map((c) => c.id);
  const getVisibleCaps = useCardConfigStore((s) => s.getVisibleCaps);
  const toggleCap = useCardConfigStore((s) => s.toggleCap);
  const setEditing = useCardConfigStore((s) => s.setEditing);

  const visibleCaps = getVisibleCaps(deviceKey, allCapIds);

  return (
    <div
      className="no-drag absolute inset-x-0 top-12 z-10 mx-2 rounded-xl border border-white/[0.08] bg-surface-dark p-3 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-white/70">
          Visible fields
        </span>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="rounded p-0.5 text-muted hover:text-white/70"
        >
          <X size={14} />
        </button>
      </div>
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {device.capabilities.map((cap) => {
          const visible = visibleCaps.includes(cap.id);
          return (
            <button
              key={cap.id}
              type="button"
              onClick={() => toggleCap(deviceKey, cap.id, allCapIds)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                visible
                  ? "bg-brand/10 text-white/80"
                  : "text-muted hover:bg-surface-light",
              )}
            >
              {visible ? (
                <Eye size={12} className="shrink-0 text-brand" />
              ) : (
                <EyeOff size={12} className="shrink-0" />
              )}
              <span className="truncate">{cap.title || cap.id}</span>
              {cap.settable && (
                <span className="ml-auto shrink-0 text-[10px] text-muted-dark">
                  control
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
