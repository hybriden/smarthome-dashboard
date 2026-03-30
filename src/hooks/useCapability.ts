import { useState, useCallback, useRef, useEffect } from "react";
import { manager } from "@/core/manager";
import type { Capability, Device } from "@/core/types";

/**
 * Unified capability hook with optimistic updates.
 *
 * - Instant UI feedback on every setValue call
 * - Optional debounce for continuous controls (sliders)
 * - Syncs back from server when not pending
 * - Reverts on API error
 */
export function useCapability(
  device: Device,
  capabilityId: string,
  options?: { debounce?: number },
) {
  const capability = device.capabilities.find(
    (c) => c.id === capabilityId,
  ) as Capability | undefined;

  const serverValue = capability?.value;
  const debounce = options?.debounce ?? 0;

  const [localValue, setLocalValue] = useState(serverValue);
  const pendingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const revertRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync from server when not pending
  useEffect(() => {
    if (!pendingRef.current) {
      setLocalValue(serverValue);
    }
  }, [serverValue]);

  // Clear pending when server catches up
  useEffect(() => {
    if (pendingRef.current && serverValue === localValue) {
      pendingRef.current = false;
      if (revertRef.current) clearTimeout(revertRef.current);
    }
  }, [serverValue, localValue]);

  const sendToServer = useCallback(
    (value: unknown) => {
      manager
        .setCapabilityValue(device.sourceId, device.id, capabilityId, value)
        .catch((err) => {
          console.error("Failed to set capability:", err);
          // Revert on error
          pendingRef.current = false;
          setLocalValue(serverValue);
        });
    },
    [device.sourceId, device.id, capabilityId, serverValue],
  );

  const setValue = useCallback(
    (value: unknown) => {
      // Optimistic: update UI immediately
      setLocalValue(value);
      pendingRef.current = true;

      // Safety: revert after 6s if server never confirms
      if (revertRef.current) clearTimeout(revertRef.current);
      revertRef.current = setTimeout(() => {
        pendingRef.current = false;
      }, 6000);

      if (debounce > 0) {
        // Debounced: wait for user to stop (sliders)
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => sendToServer(value), debounce);
      } else {
        // Immediate: send right away (toggles, buttons)
        sendToServer(value);
      }
    },
    [debounce, sendToServer],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (revertRef.current) clearTimeout(revertRef.current);
    };
  }, []);

  return { capability, value: localValue, setValue };
}
