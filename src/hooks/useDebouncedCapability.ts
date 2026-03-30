import { useState, useCallback, useRef, useEffect } from "react";
import { manager } from "@/core/manager";
import type { Capability, Device } from "@/core/types";

export function useDebouncedCapability(
  device: Device,
  capabilityId: string,
  delay = 300,
) {
  const capability = device.capabilities.find(
    (c) => c.id === capabilityId,
  ) as Capability | undefined;

  const [localValue, setLocalValue] = useState(capability?.value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isDragging = useRef(false);

  // Sync from server when not dragging
  useEffect(() => {
    if (!isDragging.current) {
      setLocalValue(capability?.value);
    }
  }, [capability?.value]);

  const setValue = useCallback(
    (value: unknown) => {
      isDragging.current = true;
      setLocalValue(value);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        isDragging.current = false;
        manager
          .setCapabilityValue(device.sourceId, device.id, capabilityId, value)
          .catch((err) => console.error("Failed to set capability:", err));
      }, delay);
    },
    [device.sourceId, device.id, capabilityId, delay],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { capability, value: localValue, setValue };
}
