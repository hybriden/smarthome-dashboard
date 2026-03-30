import type { Device } from "@/core/types";
import { useCapability } from "./useCapability";

/**
 * @deprecated Use useCapability(device, id, { debounce: ms }) directly.
 * Kept for backwards compatibility.
 */
export function useDebouncedCapability(
  device: Device,
  capabilityId: string,
  delay = 300,
) {
  return useCapability(device, capabilityId, { debounce: delay });
}
