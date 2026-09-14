import React, { useEffect, useRef, useState } from 'react';
import { CharacterId, CharacterInfo } from '../types';
import { getCastleBackground, getCharacterSprite } from '../game/pixelSprites';
import { audio } from '../audio/sound';
import { Play, Volume2, VolumeX, Sparkles, HelpCircle } from 'lucide-react';

interface SplashScreenProps {
  onStartGame: (selectedChar: CharacterId) => void;
  highScore: number;
}

const CHARACTERS: CharacterInfo[] = [
  {
    id: 'fox',
    name: 'Kiko si Rubah',
    species: 'Rubah Petualang',
    description: 'Lincah, berani, dan suka melompat melewati batang kayu!',
    primaryColor: '#f97316',
    accentColor: '#c2410c',
  },
  {
    id: 'bunny',
    name: 'Mochi si Kelinci',
    species: 'Kelinci Hutan',
    description: 'Telinga panjang yang menggemaskan dengan lompatan tinggi!',
    primaryColor: '#f472b6',
    accentColor: '#db2777',
  },
  {
    id: 'panda',
    name: 'Piko si Panda Merah',
    species: 'Panda Merah',
    description: 'Ekor belang yang tebal dan selalu ceria menjelajah rimba!',
    primaryColor: '#b45309',
    accentColor: '#78350f',
  },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStartGame, highScore }) => {
  const [selectedChar, setSelectedChar] = useState<CharacterId>('fox');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background castle forest animation
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    const castleBg = getCastleBackground(640, 480, false);
    ctx.drawImage(castleBg, 0, 0, 640, 480);
  }, []);

  // Animated Character Preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % 4;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const spr = getCharacterSprite(selectedChar, frame, false, false);
      ctx.drawImage(spr, 16, 12, 64, 64);
    }, 120);

    return () => clearInterval(interval);
  }, [selectedChar]);

  const handleStart = () => {
    audio.playLevelUp();
    onStartGame(selectedChar);
  };

  const toggleSound = () => {
    const next = audio.toggleSound();
    setSoundOn(next);
  };

  const toggleMusic = () => {
    const next = audio.toggleMusic();
    setMusicOn(next);
  };

  return (
    <div className="relative w-full max-w-[640px] aspect-[16/17] rounded-lg overflow-hidden border-4 border-amber-950 shadow-2xl flex flex-col justify-between p-5 text-white bg-slate-950 select-none">
      {/* Background Pixel Castle & Forest */}
      <canvas
        id="splash-bg-canvas"
        ref={bgCanvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full object-cover pixelated opacity-90 pointer-events-none"
      />

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-stone-900/90 px-3 py-1.5 rounded border-2 border-amber-700/80">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-pixel text-[11px] text-amber-300">
            SKOR TERTINGGI: {highScore}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="splash-sound-toggle-btn"
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="p-2 rounded bg-stone-900/90 border-2 border-amber-700/80 hover:bg-stone-800 text-amber-300 transition"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>
          <button
            id="splash-music-toggle-btn"
            onClick={toggleMusic}
            className={`px-2 py-1.5 rounded text-[10px] font-pixel border-2 transition ${
              musicOn
                ? 'bg-amber-600 border-amber-400 text-white'
                : 'bg-stone-900/90 border-amber-700/80 text-amber-300'
            }`}
          >
            BGM: {musicOn ? 'ON' : 'OFF'}
          </button>
          <button
            id="splash-help-btn"
            onClick={() => setShowHowToPlay(true)}
            aria-label="Cara Bermain"
            className="p-2 rounded bg-stone-900/90 border-2 border-amber-700/80 hover:bg-stone-800 text-amber-300 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Title & Game Logo */}
      <div className="relative z-10 text-center my-auto flex flex-col items-center">
        <div className="inline-block px-4 py-1 mb-2 bg-emerald-900/90 border-2 border-emerald-500 rounded text-emerald-300 text-[10px] font-pixel tracking-wider shadow">
          PETUALANGAN HUTAN 2D PIXEL-ART
        </div>

        <h1 className="font-pixel text-2xl sm:text-3xl text-amber-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.9)] tracking-tight leading-snug">
          RIMBA PIXEL
          <span className="block text-emerald-400 text-3xl sm:text-4xl mt-1">RUNNER</span>
        </h1>

        <p className="font-arcade text-stone-200 text-sm sm:text-base mt-2 max-w-md drop-shadow">
          Lari otomatis di 3 jalur hutan fantasi, lompat lewati rintangan, hindari monster, dan taklukkan 2 level!
        </p>

        {/* Character Selector Section */}
        <div className="mt-4 bg-stone-900/90 border-4 border-amber-900 rounded-xl p-3 w-full max-w-md shadow-2xl backdrop-blur-sm">
          <div className="text-[10px] font-pixel text-amber-400 mb-2">PILIH KARAKTER HEWAN:</div>

          {/* 3 Character Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {CHARACTERS.map((char) => {
              const isSelected = selectedChar === char.id;
              return (
                <button
                  key={char.id}
                  id={`char-btn-${char.id}`}
                  onClick={() => {
                    setSelectedChar(char.id);
                    audio.playJump();
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition ${
                    isSelected
                      ? 'bg-amber-600/30 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-stone-950/60 border-stone-700 hover:border-amber-600/60 opacity-80'
                  }`}
                >
                  <span className="font-pixel text-[10px] text-amber-200 truncate w-full">
                    {char.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-stone-400 font-arcade mt-0.5">
                    {char.species}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Character Preview Box */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-800">
            <div className="w-16 h-16 bg-stone-950 border-2 border-amber-500/70 rounded-lg flex items-center justify-center relative overflow-hidden">
              <canvas
                id="char-preview-canvas"
                ref={previewCanvasRef}
                width={96}
                height={96}
                className="w-full h-full pixelated"
              />
            </div>
            <div className="text-left flex-1">
              <div className="font-pixel text-xs text-amber-300">
                {CHARACTERS.find((c) => c.id === selectedChar)?.name}
              </div>
              <p className="text-[11px] font-arcade text-stone-300 mt-0.5 leading-snug">
                {CHARACTERS.find((c) => c.id === selectedChar)?.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Start Button & Controls Hint */}
      <div className="relative z-10 flex flex-col items-center gap-3 mt-2">
        <button
          id="btn-start-game"
          onClick={handleStart}
          className="pixel-btn w-full max-w-xs py-3.5 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 border-amber-200 text-stone-950 font-pixel text-sm sm:text-base flex items-center justify-center gap-2 rounded shadow-xl tracking-wider cursor-pointer"
        >
          <Play className="w-5 h-5 fill-stone-950" />
          <span>MULAI MAIN (START)</span>
        </button>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-arcade text-stone-300 bg-black/60 px-3 py-1.5 rounded border border-stone-800">
          <span>🎮 KONTROL:</span>
          <span className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300 border border-stone-700">⬅️ / ➡️ / A / D : Jalur</span>
          <span className="bg-stone-800 px-1.5 py-0.5 rounded text-emerald-300 border border-stone-700">⬆️ / W / Spasi : Lompat</span>
          <span className="bg-stone-800 px-1.5 py-0.5 rounded text-sky-300 border border-stone-700">⬇️ / S : Turun / Guling</span>
        </div>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border-4 border-amber-600 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2 mb-3">
              <h2 className="font-pixel text-xs sm:text-sm text-amber-300">PANDUAN BERMAIN</h2>
              <button
                id="btn-close-howtoplay"
                onClick={() => setShowHowToPlay(false)}
                className="text-stone-400 hover:text-white font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-stone-300 font-arcade">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span><strong>3 Jalur:</strong> Karakter hewanmu berlari otomatis. Berpindah jalur untuk menghindari rintangan dan mengumpulkan koin.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span><strong>Melompat:</strong> Tekan panah Atas, W, atau Spasi untuk melompati batang pohon, celah jurang, jembatan rusak, semak berduri, dan slime.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">3.</span>
                <span><strong>Turun / Berguling (Slide):</strong> Tekan panah Bawah, S, atau tombol <strong>TURUN</strong>. Jika di udara, karakter akan langsung menukik ke tanah. Jika di tanah, karakter berguling untuk merunduk di bawah dahan gantung, meluncur di bawah semak berduri, dan mentackle slime!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">4.</span>
                <span><strong>Musuh:</strong> Slime dapat dilompati atau ditackle dengan berguling untuk skor bonus! Namun <strong>Monster Hutan bertanduk</strong> tidak dapat dilompati/ditackle dan wajib dihindari dengan pindah jalur.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">5.</span>
                <span><strong>2 Level:</strong> Level 1 (Hutan Tenang - 500m) ➔ Level 2 (Hutan Berbahaya - 1000m total kecepatan lebih tinggi & monster bertebaran!).</span>
              </div>
            </div>

            <button
              id="btn-close-howtoplay-bottom"
              onClick={() => setShowHowToPlay(false)}
              className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-500 border-2 border-amber-300 text-stone-950 font-pixel text-xs rounded"
            >
              MENGERTI!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
