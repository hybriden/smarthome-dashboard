import { useCallback } from "react";
import { manager } from "@/core/manager";
import type { Capability, Device } from "@/core/types";

export function useCapability(device: Device, capabilityId: string) {
  const capability = device.capabilities.find(
    (c) => c.id === capabilityId,
  ) as Capability | undefined;

  const setValue = useCallback(
    async (value: unknown) => {
      await manager.setCapabilityValue(
        device.sourceId,
        device.id,
        capabilityId,
        value,
      );
    },
    [device.sourceId, device.id, capabilityId],
  );

  return { capability, setValue };
}
