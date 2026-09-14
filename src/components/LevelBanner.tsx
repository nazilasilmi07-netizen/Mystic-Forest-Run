import React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';

interface LevelBannerProps {
  level: 1 | 2;
  onDismiss?: () => void;
}

export const LevelBanner: React.FC<LevelBannerProps> = ({ level }) => {
  return (
    <div className="absolute top-20 left-0 right-0 z-30 flex justify-center pointer-events-none px-4 select-none animate-bounce">
      <div
        className={`px-6 py-3 rounded-xl border-4 shadow-2xl flex items-center gap-3 ${
          level === 1
            ? 'bg-emerald-900/95 border-emerald-400 text-emerald-100 shadow-emerald-900/60'
            : 'bg-purple-950/95 border-rose-500 text-purple-100 shadow-purple-900/80 animate-pulse'
        }`}
      >
        {level === 1 ? (
          <Sparkles className="w-6 h-6 text-emerald-400" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        )}

        <div className="text-center">
          <div className="text-[10px] font-pixel tracking-widest text-amber-300">
            {level === 1 ? 'MEMASUKI WILAYAH' : 'PERINGATAN BAHAYA!'}
          </div>
          <div className="text-sm sm:text-base font-pixel font-bold mt-0.5">
            {level === 1 ? 'LEVEL 1: HUTAN' : 'LEVEL 2: HUTAN BERBAHAYA!'}
          </div>
          <div className="text-[10px] font-arcade text-stone-300">
            {level === 1 ? 'Hindari batang kayu, batu, & kumpulkan koin' : 'Kecepatan bertambah, monster & slime muncul!'}
          </div>
        </div>
      </div>
    </div>
  );
};
