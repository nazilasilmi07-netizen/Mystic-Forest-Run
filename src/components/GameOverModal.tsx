import React from 'react';
import { GameStats } from '../types';
import { RotateCcw, Home, Skull, Trophy, Coins, MapPin } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  highScore: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  onRestart,
  onBackToMenu,
}) => {
  const isNewHighScore = stats.score > highScore;

  return (
    <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-stone-900 border-4 border-rose-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center relative overflow-hidden">
        {/* Top Skull / Defeat Icon */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-950 border-2 border-rose-500 flex items-center justify-center shadow-lg">
          <Skull className="w-8 h-8 text-rose-400 animate-bounce" />
        </div>

        {/* Title */}
        <h2 className="font-pixel text-2xl text-rose-400 drop-shadow tracking-tight">
          GAME OVER
        </h2>
        <p className="text-xs font-arcade text-stone-300 mt-1">
          Petualanganmu terhenti di {stats.level === 1 ? 'Level 1 (Hutan)' : 'Level 2 (Hutan Berbahaya)'}!
        </p>

        {isNewHighScore && (
          <div className="mt-2.5 inline-block px-3 py-1 bg-amber-500/20 border border-amber-400 rounded-full text-amber-300 font-pixel text-[10px] animate-pulse">
            🎉 REKOR SKOR BARU! 🎉
          </div>
        )}

        {/* Score Stats Grid */}
        <div className="bg-stone-950 border-2 border-stone-800 rounded-xl p-3.5 my-4 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-arcade border-b border-stone-800/80 pb-1.5">
            <span className="flex items-center gap-1.5 text-stone-400">
              <Trophy className="w-4 h-4 text-amber-400" />
              Skor Akhir:
            </span>
            <span className="font-pixel text-sm text-amber-300">{stats.score}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-arcade border-b border-stone-800/80 pb-1.5">
            <span className="flex items-center gap-1.5 text-stone-400">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Jarak Tempuh:
            </span>
            <span className="font-pixel text-xs text-stone-200">{Math.floor(stats.distance)} m</span>
          </div>

          <div className="flex items-center justify-between text-xs font-arcade">
            <span className="flex items-center gap-1.5 text-stone-400">
              <Coins className="w-4 h-4 text-yellow-400" />
              Koin Dikumpul:
            </span>
            <span className="font-pixel text-xs text-yellow-300">{stats.coins}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            id="gameover-restart-btn"
            onClick={onRestart}
            className="pixel-btn w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border-emerald-300 text-stone-950 font-pixel text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>RESTART (MAIN LAGI)</span>
          </button>

          <button
            id="gameover-menu-btn"
            onClick={onBackToMenu}
            className="pixel-btn w-full py-2.5 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 border-stone-600 text-stone-200 font-pixel text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>KEMBALI KE MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
