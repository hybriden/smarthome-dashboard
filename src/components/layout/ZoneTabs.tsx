import { cn } from "@/utils/cn";
import { useZones } from "@/hooks/useZones";
import { useDashboardStore } from "@/store/dashboard";

export function ZoneTabs() {
  const zones = useZones();
  const activeZone = useDashboardStore((s) => s.activeZone);
  const setActiveZone = useDashboardStore((s) => s.setActiveZone);

  if (zones.length === 0) return null;

  return (
    <div className="flex shrink-0 gap-1.5 overflow-x-auto px-6 py-3 scrollbar-none">
      <button
        type="button"
        onClick={() => setActiveZone(null)}
        className={cn(
          "whitespace-nowrap rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200",
          activeZone === null
            ? "bg-brand/15 text-brand"
            : "text-muted hover:bg-surface-light hover:text-white/70",
        )}
      >
        All Rooms
      </button>
      {zones.map((zone) => (
        <button
          key={`${zone.sourceId}:${zone.id}`}
          type="button"
          onClick={() => setActiveZone(zone.id)}
          className={cn(
            "whitespace-nowrap rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200",
            activeZone === zone.id
              ? "bg-brand/15 text-brand"
              : "text-muted hover:bg-surface-light hover:text-white/70",
          )}
        >
          {zone.name}
        </button>
      ))}
    </div>
  );
}
