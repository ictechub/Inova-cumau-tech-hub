"use client";

import * as React from "react";

// TODO(rádio): URL de stream ainda não fornecida pela Inova Cumaú — placeholder
// explícito até a URL real (Icecast/Shoutcast/mp3) ser definida. Ver "Pendente"
// no CLAUDE.md.
const RADIO_STREAM_URL = "https://stream.example.com/inova-cumau-radio.mp3";

// TODO(rádio): título/descrição "tocando agora" ainda não vêm de nenhuma API/embed
// real — texto estático até essa integração ser definida. Ver "Pendente" no
// CLAUDE.md.
const NOW_PLAYING_TITLE = "Rádio Web Inova Cumaú";
const NOW_PLAYING_DESCRIPTION =
  "Inovação amazônica 24h · programação a definir";

type RadioPlayerContextValue = {
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  analyser: AnalyserNode | null;
  togglePlay: () => void;
  setVolume: (value: number) => void;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
  nowPlayingTitle: string;
  nowPlayingDescription: string;
};

const RadioPlayerContext = React.createContext<RadioPlayerContextValue | null>(
  null,
);

export function RadioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const sourceRef = React.useRef<MediaElementAudioSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(0.7);
  const [muted, setMuted] = React.useState(false);
  const [analyser, setAnalyser] = React.useState<AnalyserNode | null>(null);

  const ensureAudioGraph = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio || sourceRef.current) return;

    const AudioContextConstructor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioContext = new AudioContextConstructor();
    const newAnalyser = audioContext.createAnalyser();
    newAnalyser.fftSize = 256;
    newAnalyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaElementSource(audio);
    source.connect(newAnalyser);
    newAnalyser.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    sourceRef.current = source;
    setAnalyser(newAnalyser);
  }, []);

  React.useEffect(() => {
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const togglePlay = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    ensureAudioGraph();
    audioContextRef.current?.resume();

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {
        // Placeholder stream URL não resolve para áudio real ainda — falha
        // esperada até a URL definitiva ser fornecida (ver CLAUDE.md).
        setIsPlaying(false);
      });
    }
  }, [ensureAudioGraph, isPlaying]);

  const value = React.useMemo<RadioPlayerContextValue>(
    () => ({
      isPlaying,
      volume,
      muted,
      analyser,
      togglePlay,
      setVolume,
      setMuted,
      nowPlayingTitle: NOW_PLAYING_TITLE,
      nowPlayingDescription: NOW_PLAYING_DESCRIPTION,
    }),
    [isPlaying, volume, muted, analyser, togglePlay],
  );

  return (
    <RadioPlayerContext.Provider value={value}>
      <audio
        ref={audioRef}
        src={RADIO_STREAM_URL}
        preload="none"
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {children}
    </RadioPlayerContext.Provider>
  );
}

export function useRadioPlayer() {
  const context = React.useContext(RadioPlayerContext);
  if (!context) {
    throw new Error("useRadioPlayer must be used within a RadioPlayerProvider");
  }
  return context;
}
