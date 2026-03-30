import { useMemo } from "react";
import { useZoneStore } from "@/store/zones";
import type { Zone } from "@/core/types";

export function useZones(): Zone[] {
  const zones = useZoneStore((s) => s.zones);
  return useMemo(
    () => Array.from(zones.values()).sort((a, b) => a.name.localeCompare(b.name)),
    [zones],
  );
}
