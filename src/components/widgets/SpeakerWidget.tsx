import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { Slider } from "@/components/controls/Slider";
import { useDebouncedCapability } from "@/hooks/useDebouncedCapability";
import { manager } from "@/core/manager";
import type { WidgetProps } from "./WidgetRegistry";
import { cn } from "@/utils/cn";

export function SpeakerWidget({ device }: WidgetProps) {
  const track = device.capabilities.find((c) => c.id === "speaker_track");
  const artist = device.capabilities.find((c) => c.id === "speaker_artist");
  const album = device.capabilities.find((c) => c.id === "speaker_album");
  const playing = device.capabilities.find((c) => c.id === "speaker_playing");
  const muted = device.capabilities.find((c) => c.id === "volume_mute");
  const group = device.capabilities.find((c) => c.id === "sonos_group");

  const { value: volumeValue, setValue: setVolume } = useDebouncedCapability(
    device,
    "volume_set",
    200,
  );

  const isPlaying = playing?.value === true;
  const isMuted = muted?.value === true;
  const volumePercent = Math.round(((volumeValue as number) ?? 0) * 100);
  const trackName = (track?.value as string) || "Not playing";
  const artistName = artist?.value as string | null;
  const albumName = album?.value as string | null;
  const groupName = group?.value as string | null;

  function send(capId: string, value: unknown) {
    manager.setCapabilityValue(device.sourceId, device.id, capId, value);
  }

  return (
    <WidgetWrapper
      title={device.name}
      subtitle={groupName ?? "Speaker"}
      online={device.online}
      indicator={isPlaying ? "on" : "off"}
    >
      {/* Now playing */}
      <div className="mb-3 min-h-[40px]">
        <p
          className={cn(
            "truncate text-sm font-medium",
            isPlaying ? "text-white/90" : "text-muted",
          )}
        >
          {trackName}
        </p>
        {artistName && (
          <p className="truncate text-xs text-muted">{artistName}</p>
        )}
        {!artistName && albumName && (
          <p className="truncate text-xs text-muted">{albumName}</p>
        )}
      </div>

      {/* Playback controls */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={!device.online}
          onClick={() => send("speaker_prev", true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-light hover:text-white/80 active:scale-95"
        >
          <SkipBack size={16} fill="currentColor" />
        </button>

        <button
          type="button"
          disabled={!device.online}
          onClick={() => send("speaker_playing", !isPlaying)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl transition-all active:scale-95",
            isPlaying
              ? "bg-brand/15 text-brand"
              : "bg-white/[0.06] text-white/70 hover:bg-white/[0.1]",
          )}
        >
          {isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <button
          type="button"
          disabled={!device.online}
          onClick={() => send("speaker_next", true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-light hover:text-white/80 active:scale-95"
        >
          <SkipForward size={16} fill="currentColor" />
        </button>
      </div>

      {/* Volume */}
      <div className="no-drag flex items-center gap-2">
        <button
          type="button"
          disabled={!device.online}
          onClick={() => send("volume_mute", !isMuted)}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            isMuted
              ? "text-brand-danger"
              : "text-muted hover:text-white/70",
          )}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <Slider
          value={(volumeValue as number) ?? 0}
          min={0}
          max={1}
          step={0.01}
          onChange={setVolume}
          disabled={!device.online || isMuted}
          className="flex-1"
        />
        <span
          className={cn(
            "min-w-[2rem] text-right text-xs tabular-nums",
            isMuted ? "text-brand-danger" : "text-muted",
          )}
        >
          {isMuted ? "Mute" : `${volumePercent}%`}
        </span>
      </div>
    </WidgetWrapper>
  );
}
