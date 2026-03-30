import { ChevronUp, ChevronDown } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { GarageDoorIllustration } from "@/components/illustrations/DeviceIllustrations";
import { manager } from "@/core/manager";
import type { WidgetProps } from "./WidgetRegistry";
import { cn } from "@/utils/cn";

export function GarageDoorWidget({ device }: WidgetProps) {
  // Find the first settable onoff (output1 is the door relay)
  const doorCap = device.capabilities.find(
    (c) => c.id.startsWith("onoff") && c.settable,
  );

  const isOpen = doorCap?.value === true;

  function toggle() {
    if (!doorCap) return;
    manager.setCapabilityValue(
      device.sourceId,
      device.id,
      doorCap.id,
      !isOpen,
    );
  }

  return (
    <WidgetWrapper
      title={device.name}
      subtitle={isOpen ? "Open" : "Closed"}
      online={device.online}
      indicator={isOpen ? "on" : "off"}
    >
      {/* Door illustration */}
      <div className="flex flex-1 items-center justify-center">
        <GarageDoorIllustration className="h-24 w-full max-w-[200px]" open={isOpen} />
      </div>

      {/* Open/Close button */}
      <button
        type="button"
        disabled={!device.online || !doorCap}
        onClick={toggle}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition-all active:scale-[0.97]",
          isOpen
            ? "border border-brand/25 bg-brand/10 text-brand hover:bg-brand/20"
            : "border border-white/[0.08] bg-surface-dark text-white/70 hover:bg-surface-light",
          (!device.online || !doorCap) && "cursor-not-allowed opacity-40",
        )}
      >
        {isOpen ? (
          <>
            <ChevronDown size={16} />
            Close Door
          </>
        ) : (
          <>
            <ChevronUp size={16} />
            Open Door
          </>
        )}
      </button>
    </WidgetWrapper>
  );
}
