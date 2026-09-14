import React from 'react';
import { GameStats } from '../types';
import { Trophy, RotateCcw, Home, Sparkles, Coins, MapPin, Award } from 'lucide-react';

interface VictoryModalProps {
  stats: GameStats;
  highScore: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  highScore,
  onRestart,
  onBackToMenu,
}) => {
  const isNewRecord = stats.score >= highScore;

  return (
    <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-stone-900 border-4 border-amber-500 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(245,158,11,0.4)] text-center relative overflow-hidden">
        {/* Celebration sparkles badge */}
        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg">
          <Trophy className="w-9 h-9 text-amber-300 animate-bounce" />
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-400/80 rounded-full text-amber-300 font-pixel text-[10px] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>PETUALANG SEJATI!</span>
        </div>

        <h2 className="font-pixel text-2xl sm:text-3xl text-amber-300 drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] tracking-tight">
          SELAMAT! MENANG!
        </h2>
        <p className="text-xs font-arcade text-stone-300 mt-1">
          Kamu sukses menaklukkan Hutan Berbahaya dan mencapai benteng fantasi!
        </p>

        {isNewRecord && (
          <div className="mt-2 text-[10px] font-pixel text-emerald-400 bg-emerald-950/80 border border-emerald-500 py-1 px-2 rounded">
            🏆 SKOR TERTINGGI BARU TERCIPTA!
          </div>
        )}

        {/* Stats Grid */}
        <div className="bg-stone-950 border-2 border-amber-900/80 rounded-xl p-3.5 my-4 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-arcade border-b border-stone-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-stone-400">
              <Award className="w-4 h-4 text-amber-400" />
              Total Skor:
            </span>
            <span className="font-pixel text-sm text-amber-300">{stats.score}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-arcade border-b border-stone-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-stone-400">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Jarak Berhasil:
            </span>
            <span className="font-pixel text-xs text-stone-200">{Math.floor(stats.distance)} meter</span>
          </div>

          <div className="flex items-center justify-between text-xs font-arcade">
            <span className="flex items-center gap-1.5 text-stone-400">
              <Coins className="w-4 h-4 text-yellow-400" />
              Koin Terkumpul:
            </span>
            <span className="font-pixel text-xs text-yellow-300">{stats.coins}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            id="victory-restart-btn"
            onClick={onRestart}
            className="pixel-btn w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 border-amber-200 text-stone-950 font-pixel text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>MAIN LAGI (RESTART)</span>
          </button>

          <button
            id="victory-menu-btn"
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
