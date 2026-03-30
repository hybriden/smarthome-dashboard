import { useConnectionStore } from "@/store/connections";

export function useConnection(adapterId: string): boolean {
  return useConnectionStore((s) => s.statuses.get(adapterId) ?? false);
}
