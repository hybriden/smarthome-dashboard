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
import { useCapability } from "@/hooks/useCapability";
import { manager } from "@/core/manager";
import type { WidgetProps } from "./WidgetRegistry";
import { cn } from "@/utils/cn";

function Equalizer() {
  return (
    <div className="flex h-8 items-end justify-center gap-[3px]">
      <div className="eq-bar w-[3px] rounded-full" style={{ animationDelay: "0s" }} />
      <div className="eq-bar w-[3px] rounded-full" style={{ animationDelay: "0.2s" }} />
      <div className="eq-bar w-[3px] rounded-full" style={{ animationDelay: "0.4s" }} />
      <div className="eq-bar w-[3px] rounded-full" style={{ animationDelay: "0.1s" }} />
      <div className="eq-bar w-[3px] rounded-full" style={{ animationDelay: "0.3s" }} />
      <div className="eq-bar w-[3px] rounded-full opacity-70" style={{ animationDelay: "0.15s" }} />
      <div className="eq-bar w-[3px] rounded-full" style={{ animationDelay: "0.35s" }} />
      <div className="eq-bar w-[3px] rounded-full opacity-70" style={{ animationDelay: "0.05s" }} />
      <div className="eq-bar w-[3px] rounded-full" style={{ animationDelay: "0.25s" }} />
    </div>
  );
}

export function SpeakerWidget({ device, customName, onRename }: WidgetProps) {
  const track = device.capabilities.find((c) => c.id === "speaker_track");
  const artist = device.capabilities.find((c) => c.id === "speaker_artist");
  const album = device.capabilities.find((c) => c.id === "speaker_album");
  const group = device.capabilities.find((c) => c.id === "sonos_group");

  const { value: playingValue, setValue: setPlaying } = useCapability(device, "speaker_playing");
  const { value: mutedValue, setValue: setMuted } = useCapability(device, "volume_mute");
  const { value: volumeValue, setValue: setVolume } = useCapability(device, "volume_set", { debounce: 200 });

  const isPlaying = playingValue === true;
  const isMuted = mutedValue === true;
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
      title={customName ?? device.name}
      onRename={onRename}
      subtitle={groupName ?? "Speaker"}
      online={device.online}
      indicator={isPlaying ? "on" : "off"}
    >
      {/* Now playing */}
      <div className="mb-1">
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

      {/* Equalizer visualization — only when playing */}
      {isPlaying && (
        <div className="mb-1">
          <Equalizer />
        </div>
      )}

      {/* Playback controls */}
      <div className="mb-2 flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={!device.online}
          onClick={() => send("speaker_prev", true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-light hover:text-white/80 active:scale-95"
        >
          <SkipBack size={14} fill="currentColor" />
        </button>

        <button
          type="button"
          disabled={!device.online}
          onClick={() => setPlaying(!isPlaying)}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl transition-all active:scale-95",
            isPlaying
              ? "bg-brand/15 text-brand"
              : "bg-white/[0.06] text-white/70 hover:bg-white/[0.1]",
          )}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <button
          type="button"
          disabled={!device.online}
          onClick={() => send("speaker_next", true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-light hover:text-white/80 active:scale-95"
        >
          <SkipForward size={14} fill="currentColor" />
        </button>
      </div>

      {/* Volume */}
      <div className="no-drag flex items-center gap-2">
        <button
          type="button"
          disabled={!device.online}
          onClick={() => setMuted(!isMuted)}
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
