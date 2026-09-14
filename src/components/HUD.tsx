import React, { useState } from 'react';
import { GameStats } from '../types';
import { audio } from '../audio/sound';
import { Heart, Coins, Trophy, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  isPaused: boolean;
  onTogglePause: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onDrop: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isPaused,
  onTogglePause,
  onMoveLeft,
  onMoveRight,
  onJump,
  onDrop,
}) => {
  const [soundOn, setSoundOn] = useState(audio.isSoundEnabled());

  const toggleSound = () => {
    const next = audio.toggleSound();
    setSoundOn(next);
  };

  const levelTarget = stats.level === 1 ? 500 : 1000;
  const levelStart = stats.level === 1 ? 0 : 500;
  const progressPercent = Math.min(100, Math.max(0, ((stats.distance - levelStart) / (levelTarget - levelStart)) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top Header Dashboard */}
      <div className="flex items-start justify-between gap-2 pointer-events-auto">
        {/* Left: Hearts & Level */}
        <div className="flex flex-col gap-1.5">
          {/* Hearts container */}
          <div className="flex items-center gap-1.5 bg-black/75 px-3 py-1.5 rounded-lg border-2 border-amber-900/80 backdrop-blur-xs">
            <span className="text-[10px] font-pixel text-rose-300 mr-1 hidden sm:inline">NYAWA:</span>
            {[1, 2, 3].map((heartIndex) => {
              const isFilled = heartIndex <= stats.lives;
              return (
                <Heart
                  key={heartIndex}
                  className={`w-5 h-5 transition-transform ${
                    isFilled
                      ? 'fill-rose-500 text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)] scale-105'
                      : 'fill-stone-800 text-stone-600 scale-90 opacity-60'
                  }`}
                />
              );
            })}
          </div>

          {/* Current Level Badge */}
          <div
            className={`px-2.5 py-1 rounded-md text-[10px] font-pixel border-2 self-start flex items-center gap-1 shadow ${
              stats.level === 1
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
                : 'bg-purple-950/90 text-purple-300 border-purple-500 animate-pulse'
            }`}
          >
            <span>{stats.level === 1 ? '🌲 LEVEL 1: HUTAN' : '⚠️ LEVEL 2: HUTAN BERBAHAYA'}</span>
          </div>
        </div>

        {/* Center: Distance Progress Bar */}
        <div className="flex-1 max-w-[200px] flex flex-col items-center bg-black/75 px-3 py-1.5 rounded-lg border-2 border-stone-800 backdrop-blur-xs">
          <div className="flex justify-between w-full text-[10px] font-pixel text-stone-300 mb-1">
            <span>JARAK:</span>
            <span className="text-amber-300">{Math.floor(stats.distance)}m / {levelTarget}m</span>
          </div>
          <div className="w-full bg-stone-900 rounded-full h-2.5 overflow-hidden border border-stone-700">
            <div
              className={`h-full transition-all duration-150 ${
                stats.level === 1
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                  : 'bg-gradient-to-r from-purple-500 to-rose-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Coins, Score & Actions */}
        <div className="flex flex-col items-end gap-1.5">
          {/* Coins & Score */}
          <div className="flex items-center gap-2 bg-black/75 px-3 py-1.5 rounded-lg border-2 border-amber-900/80 backdrop-blur-xs">
            {/* Coins */}
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-500" />
              <span className="font-pixel text-xs text-amber-300">{stats.coins}</span>
            </div>

            <div className="w-px h-4 bg-stone-700 mx-1" />

            {/* Score */}
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-pixel text-xs text-white">{stats.score}</span>
            </div>
          </div>

          {/* Pause & Sound controls */}
          <div className="flex items-center gap-1.5">
            <button
              id="hud-sound-btn"
              onClick={toggleSound}
              aria-label="Toggle Sound"
              className="p-1.5 rounded bg-black/75 border-2 border-stone-700 hover:border-amber-500 text-stone-200 hover:text-amber-300 transition"
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>
            <button
              id="hud-pause-btn"
              onClick={onTogglePause}
              aria-label="Pause Game"
              className="p-1.5 rounded bg-black/75 border-2 border-stone-700 hover:border-amber-500 text-stone-200 hover:text-amber-300 transition"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom On-Screen Controls (for Mobile and Mouse) */}
      <div className="pointer-events-auto flex items-end justify-between w-full pb-2 px-1">
        {/* Left / Right Lane switch buttons */}
        <div className="flex items-center gap-2">
          <button
            id="touch-btn-left"
            onClick={onMoveLeft}
            aria-label="Geser Kiri"
            className="pixel-btn w-14 h-14 bg-stone-900/90 hover:bg-stone-800 active:bg-amber-600 border-amber-600/80 rounded-xl flex flex-col items-center justify-center text-amber-300 shadow-xl"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
            <span className="text-[8px] font-pixel mt-0.5">KIRI</span>
          </button>

          <button
            id="touch-btn-right"
            onClick={onMoveRight}
            aria-label="Geser Kanan"
            className="pixel-btn w-14 h-14 bg-stone-900/90 hover:bg-stone-800 active:bg-amber-600 border-amber-600/80 rounded-xl flex flex-col items-center justify-center text-amber-300 shadow-xl"
          >
            <ArrowRight className="w-6 h-6 stroke-[3]" />
            <span className="text-[8px] font-pixel mt-0.5">KANAN</span>
          </button>
        </div>

        {/* Jump & Drop buttons */}
        <div className="flex items-center gap-2">
          <button
            id="touch-btn-drop"
            onClick={onDrop}
            aria-label="Turun / Guling"
            className="pixel-btn w-14 h-14 bg-stone-900/95 hover:bg-stone-800 active:bg-sky-600 border-2 border-sky-500 rounded-xl flex flex-col items-center justify-center text-sky-300 shadow-xl"
          >
            <ArrowDown className="w-6 h-6 stroke-[3]" />
            <span className="text-[8px] font-pixel mt-0.5">TURUN</span>
          </button>

          <button
            id="touch-btn-jump"
            onClick={onJump}
            aria-label="Melompat"
            className="pixel-btn w-16 h-16 bg-gradient-to-t from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400 active:scale-95 border-emerald-300 rounded-xl flex flex-col items-center justify-center text-white shadow-2xl"
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
            <span className="text-[9px] font-pixel mt-0.5">LOMPAT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
