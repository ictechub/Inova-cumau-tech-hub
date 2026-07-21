"use client";

import * as React from "react";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconVolume,
  IconVolume2,
  IconVolume3,
  IconVolumeOff,
} from "@tabler/icons-react";

import { useRadioPlayer } from "@/components/radio-player-provider";

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  if (muted || volume === 0) return <IconVolumeOff className="size-4" />;
  if (volume < 0.34) return <IconVolume3 className="size-4" />;
  if (volume < 0.67) return <IconVolume2 className="size-4" />;
  return <IconVolume className="size-4" />;
}

export function SiteHeaderRadioBadge() {
  const { isPlaying, volume, muted, togglePlay, setMuted, nowPlayingTitle, nowPlayingDescription } =
    useRadioPlayer();

  const nowPlayingText = `${nowPlayingTitle} · ${nowPlayingDescription}`;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-muted/50 px-2 py-1.5">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pausar rádio" : "Tocar rádio"}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {isPlaying ? (
          <IconPlayerPauseFilled className="size-3" />
        ) : (
          <IconPlayerPlayFilled className="size-3" />
        )}
      </button>

      <div className="w-32 min-w-0 overflow-hidden xl:w-44">
        <div className="animate-marquee whitespace-nowrap text-[11px] font-medium tracking-wide text-foreground">
          <span className="mr-10">{nowPlayingText}</span>
          <span className="mr-10">{nowPlayingText}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMuted((prev) => !prev)}
        aria-label={muted ? "Reativar som" : "Silenciar"}
        className="flex size-6 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <VolumeIcon volume={volume} muted={muted} />
      </button>
    </div>
  );
}
