import { cn } from "@/utils/cn";
import { useZones } from "@/hooks/useZones";
import { useDashboardStore } from "@/store/dashboard";

export function ZoneTabs() {
  const zones = useZones();
  const activeZone = useDashboardStore((s) => s.activeZone);
  const setActiveZone = useDashboardStore((s) => s.setActiveZone);

  if (zones.length === 0) return null;

  return (
    <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-4 py-2 scrollbar-none">
      <button
        type="button"
        onClick={() => setActiveZone(null)}
        className={cn(
          "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          activeZone === null
            ? "bg-accent text-white"
            : "text-gray-400 hover:bg-surface-light hover:text-white",
        )}
      >
        All
      </button>
      {zones.map((zone) => (
        <button
          key={`${zone.sourceId}:${zone.id}`}
          type="button"
          onClick={() => setActiveZone(zone.id)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            activeZone === zone.id
              ? "bg-accent text-white"
              : "text-gray-400 hover:bg-surface-light hover:text-white",
          )}
        >
          {zone.name}
        </button>
      ))}
    </div>
  );
}
