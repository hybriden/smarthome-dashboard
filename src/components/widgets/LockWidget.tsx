import { Shield, ShieldCheck, ShieldAlert, DoorOpen, BatteryWarning } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { manager } from "@/core/manager";
import type { WidgetProps } from "./WidgetRegistry";
import { cn } from "@/utils/cn";

type LockState = "locked" | "unlocked" | "open";

function LockIllustration({ state }: { state: LockState }) {
  const isLocked = state === "locked";
  const isOpen = state === "open";

  return (
    <svg viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      {/* Lock glow */}
      {isLocked && (
        <circle cx="50" cy="90" r="45" fill="#5cb85c" fillOpacity="0.04" />
      )}
      {!isLocked && (
        <circle cx="50" cy="90" r="45" fill="#d9534f" fillOpacity="0.04" />
      )}

      {/* Shackle */}
      <path
        d={
          isOpen
            ? "M30 60 L30 35 A20 20 0 0 1 70 35 L70 28"
            : "M30 60 L30 35 A20 20 0 0 1 70 35 L70 60"
        }
        stroke={isLocked ? "#5cb85c" : isOpen ? "#d9534f" : "#c8943e"}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        style={{ transition: "d 0.4s ease" }}
      />

      {/* Lock body */}
      <rect
        x="20"
        y="58"
        width="60"
        height="52"
        rx="8"
        fill="#1e1c19"
        stroke={isLocked ? "#5cb85c" : isOpen ? "#d9534f" : "#c8943e"}
        strokeWidth="2"
      />

      {/* Inner panel */}
      <rect x="26" y="64" width="48" height="40" rx="4" fill="#0c0b0a" />

      {/* Keyhole */}
      <circle
        cx="50"
        cy="80"
        r="6"
        fill={isLocked ? "#5cb85c" : isOpen ? "#d9534f" : "#c8943e"}
        opacity="0.3"
      />
      <circle
        cx="50"
        cy="80"
        r="3"
        fill={isLocked ? "#5cb85c" : isOpen ? "#d9534f" : "#c8943e"}
        opacity="0.7"
      />
      <rect
        x="48.5"
        y="83"
        width="3"
        height="10"
        rx="1.5"
        fill={isLocked ? "#5cb85c" : isOpen ? "#d9534f" : "#c8943e"}
        opacity="0.5"
      />

      {/* Status indicator light */}
      <circle
        cx="50"
        cy="68"
        r="2"
        fill={isLocked ? "#5cb85c" : isOpen ? "#d9534f" : "#c8943e"}
      >
        {!isLocked && (
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>
    </svg>
  );
}

export function LockWidget({ device }: WidgetProps) {
  // Find lock capabilities
  const lockEnum = device.capabilities.find((c) => c.id === "lock_unlock_open");
  const lockedBool = device.capabilities.find((c) => c.id === "locked");
  const doorContact = device.capabilities.find((c) => c.id === "alarm_contact");
  const batteryAlarm = device.capabilities.find((c) => c.id === "alarm_battery");

  // Determine current state
  let lockState: LockState = "locked";
  if (lockEnum) {
    lockState = (lockEnum.value as string) as LockState;
  } else if (lockedBool) {
    lockState = lockedBool.value ? "locked" : "unlocked";
  }

  const isDoorOpen = doorContact?.value === true;
  const isBatteryLow = batteryAlarm?.value === true;

  function setLockState(state: LockState) {
    if (lockEnum) {
      manager.setCapabilityValue(device.sourceId, device.id, lockEnum.id, state);
    } else if (lockedBool) {
      manager.setCapabilityValue(
        device.sourceId,
        device.id,
        lockedBool.id,
        state === "locked",
      );
    }
  }

  const stateLabel =
    lockState === "locked" ? "Locked" : lockState === "open" ? "Open" : "Unlocked";
  const StateIcon =
    lockState === "locked" ? ShieldCheck : lockState === "open" ? ShieldAlert : Shield;

  return (
    <WidgetWrapper
      title={device.name}
      subtitle={stateLabel}
      online={device.online}
      indicator={lockState === "locked" ? "on" : "alarm"}
    >
      <div className="flex flex-1 items-center gap-4">
        {/* Lock illustration */}
        <div className="h-28 w-20 shrink-0">
          <LockIllustration state={lockState} />
        </div>

        {/* Status + controls */}
        <div className="flex flex-1 flex-col gap-2">
          {/* State indicator */}
          <div className="flex items-center gap-2">
            <StateIcon
              size={16}
              className={cn(
                lockState === "locked" && "text-brand-success",
                lockState === "unlocked" && "text-brand",
                lockState === "open" && "text-brand-danger",
              )}
            />
            <span
              className={cn(
                "text-sm font-semibold",
                lockState === "locked" && "text-brand-success",
                lockState === "unlocked" && "text-brand",
                lockState === "open" && "text-brand-danger",
              )}
            >
              {stateLabel}
            </span>
          </div>

          {/* Status badges */}
          <div className="flex gap-1.5">
            {doorContact && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium",
                  isDoorOpen
                    ? "bg-brand-danger/10 text-brand-danger"
                    : "bg-brand-success/10 text-brand-success",
                )}
              >
                <DoorOpen size={10} />
                {isDoorOpen ? "Open" : "Closed"}
              </span>
            )}
            {batteryAlarm && isBatteryLow && (
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-danger/10 px-2 py-0.5 text-[10px] font-medium text-brand-danger">
                <BatteryWarning size={10} />
                Low
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        {lockEnum?.options?.length ? (
          // Yale-style: three state buttons
          <>
            <button
              type="button"
              disabled={!device.online}
              onClick={() => setLockState("open")}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-xs font-medium transition-all active:scale-[0.97]",
                lockState === "open"
                  ? "bg-brand-danger/15 text-brand-danger"
                  : "border border-white/[0.06] text-muted hover:bg-surface-light hover:text-white/70",
              )}
            >
              Open
            </button>
            <button
              type="button"
              disabled={!device.online}
              onClick={() => setLockState("unlocked")}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-xs font-medium transition-all active:scale-[0.97]",
                lockState === "unlocked"
                  ? "bg-brand/15 text-brand"
                  : "border border-white/[0.06] text-muted hover:bg-surface-light hover:text-white/70",
              )}
            >
              Unlock
            </button>
            <button
              type="button"
              disabled={!device.online}
              onClick={() => setLockState("locked")}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-xs font-medium transition-all active:scale-[0.97]",
                lockState === "locked"
                  ? "bg-brand-success/15 text-brand-success"
                  : "border border-white/[0.06] text-muted hover:bg-surface-light hover:text-white/70",
              )}
            >
              Lock
            </button>
          </>
        ) : (
          // Simple lock/unlock toggle
          <button
            type="button"
            disabled={!device.online}
            onClick={() =>
              setLockState(lockState === "locked" ? "unlocked" : "locked")
            }
            className={cn(
              "w-full rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.97]",
              lockState === "locked"
                ? "border border-brand-success/25 bg-brand-success/10 text-brand-success"
                : "border border-brand-danger/25 bg-brand-danger/10 text-brand-danger",
            )}
          >
            {lockState === "locked" ? "Unlock" : "Lock"}
          </button>
        )}
      </div>
    </WidgetWrapper>
  );
}
