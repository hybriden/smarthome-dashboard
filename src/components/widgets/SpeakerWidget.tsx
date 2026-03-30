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

function Equalizer({ playing }: { playing: boolean }) {
  const bars = [
    { delay: "0s", height: "60%", activeHeight: "90%" },
    { delay: "0.15s", height: "40%", activeHeight: "65%" },
    { delay: "0.3s", height: "70%", activeHeight: "100%" },
    { delay: "0.1s", height: "50%", activeHeight: "80%" },
    { delay: "0.25s", height: "35%", activeHeight: "55%" },
    { delay: "0.05s", height: "55%", activeHeight: "75%" },
    { delay: "0.2s", height: "45%", activeHeight: "95%" },
    { delay: "0.35s", height: "60%", activeHeight: "70%" },
    { delay: "0.12s", height: "30%", activeHeight: "85%" },
  ];

  return (
    <div className="flex h-10 items-end justify-center gap-[3px]">
      {bars.map((bar, i) => (
        <div
          key={i}
          className={cn(
            "w-[3px] rounded-full",
            playing ? "bg-brand" : "bg-muted-dark",
          )}
          style={{
            height: playing ? bar.activeHeight : bar.height,
            animation: playing
              ? `eq-${i} ${0.8 + (i % 3) * 0.3}s ease-in-out ${bar.delay} infinite alternate`
              : "none",
            transition: playing ? "none" : "height 0.5s ease",
          }}
        />
      ))}
      <style>{`
        ${bars.map((bar, i) => `
          @keyframes eq-${i} {
            0% { height: 12%; }
            50% { height: ${bar.activeHeight}; }
            100% { height: ${parseInt(bar.activeHeight) * 0.4}%; }
          }
        `).join("")}
      `}</style>
    </div>
  );
}

export function SpeakerWidget({ device }: WidgetProps) {
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
      title={device.name}
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

      {/* Equalizer visualization */}
      <div className="mb-1">
        <Equalizer playing={isPlaying} />
      </div>

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
