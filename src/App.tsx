/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameScreen, CharacterId, GameStats } from './types';
import { GameEngine } from './game/gameEngine';
import { GameCanvas } from './components/GameCanvas';
import { SplashScreen } from './components/SplashScreen';
import { HUD } from './components/HUD';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { LevelBanner } from './components/LevelBanner';
import { audio } from './audio/sound';
import { Play, Home } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('SPLASH');
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('rimba_high_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [activeLevelBanner, setActiveLevelBanner] = useState<1 | 2 | null>(null);
  const engine = useMemo(() => new GameEngine('fox'), []);
  const [hudStats, setHudStats] = useState<GameStats>(engine.stats);
  const bannerTimeoutRef = useRef<number | null>(null);

  // Sync engine events
  useEffect(() => {
    engine.onGameOver = () => {
      setScreen('GAMEOVER');
      setHighScore((prev) => {
        const newBest = Math.max(prev, engine.stats.score);
        localStorage.setItem('rimba_high_score', newBest.toString());
        return newBest;
      });
    };

    engine.onVictory = () => {
      setScreen('VICTORY');
      setHighScore((prev) => {
        const newBest = Math.max(prev, engine.stats.score);
        localStorage.setItem('rimba_high_score', newBest.toString());
        return newBest;
      });
    };

    engine.onLevelChange = (newLevel) => {
      showBanner(newLevel);
    };
  }, [engine]);

  // Sync HUD stats frequently during gameplay
  useEffect(() => {
    if (screen !== 'PLAYING' && screen !== 'PAUSED') return;

    const interval = setInterval(() => {
      setHudStats({ ...engine.stats });
    }, 100);

    return () => clearInterval(interval);
  }, [engine, screen]);

  const showBanner = (lvl: 1 | 2) => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    setActiveLevelBanner(lvl);
    bannerTimeoutRef.current = window.setTimeout(() => {
      setActiveLevelBanner(null);
    }, 3200);
  };

  const handleStartGame = (charId: CharacterId) => {
    engine.reset(charId);
    setHudStats({ ...engine.stats });
    setScreen('PLAYING');
    showBanner(1);
  };

  const handleRestart = () => {
    engine.reset();
    setHudStats({ ...engine.stats });
    setScreen('PLAYING');
    showBanner(1);
    audio.playLevelUp();
  };

  const handleBackToMenu = () => {
    engine.reset();
    setScreen('SPLASH');
  };

  const handleTogglePause = () => {
    setScreen((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
  };

  return (
    <main className="min-h-screen w-full bg-stone-950 flex flex-col items-center justify-center p-2 sm:p-4 text-stone-100 select-none">
      <div className="relative w-full max-w-[640px] flex flex-col items-center">
        {/* Active Game Screen Render */}
        {screen === 'SPLASH' && (
          <SplashScreen
            onStartGame={handleStartGame}
            highScore={highScore}
          />
        )}

        {(screen === 'PLAYING' || screen === 'PAUSED' || screen === 'GAMEOVER' || screen === 'VICTORY') && (
          <div className="relative w-full aspect-[16/17] flex items-center justify-center">
            {/* The Main 2D Pixel-Art Canvas */}
            <GameCanvas
              engine={engine}
              isPaused={screen === 'PAUSED' || screen === 'GAMEOVER' || screen === 'VICTORY'}
            />

            {/* In-Game HUD overlay */}
            <HUD
              stats={hudStats}
              isPaused={screen === 'PAUSED'}
              onTogglePause={handleTogglePause}
              onMoveLeft={() => engine.moveLeft()}
              onMoveRight={() => engine.moveRight()}
              onJump={() => engine.jump()}
              onDrop={() => engine.rollOrDrop()}
            />

            {/* Level Announcement Banner */}
            {activeLevelBanner && (
              <LevelBanner level={activeLevelBanner} />
            )}

            {/* Pause Modal */}
            {screen === 'PAUSED' && (
              <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-stone-900 border-4 border-amber-600 rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl">
                  <h3 className="font-pixel text-xl text-amber-300 mb-2">GAME PAUSED</h3>
                  <p className="font-arcade text-xs text-stone-400 mb-5">
                    Hewanmu sedang beristirahat di jalur hutan.
                  </p>

                  <div className="space-y-3">
                    <button
                      id="pause-resume-btn"
                      onClick={() => setScreen('PLAYING')}
                      className="pixel-btn w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border-emerald-300 text-stone-950 font-pixel text-xs rounded-lg flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-stone-950" />
                      <span>LANJUTKAN</span>
                    </button>

                    <button
                      id="pause-menu-btn"
                      onClick={handleBackToMenu}
                      className="pixel-btn w-full py-2 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 border-stone-600 text-stone-300 font-pixel text-xs rounded-lg flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      <span>KEMBALI KE MENU</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Screen */}
            {screen === 'GAMEOVER' && (
              <GameOverModal
                stats={hudStats}
                highScore={highScore}
                onRestart={handleRestart}
                onBackToMenu={handleBackToMenu}
              />
            )}

            {/* Victory Screen */}
            {screen === 'VICTORY' && (
              <VictoryModal
                stats={hudStats}
                highScore={highScore}
                onRestart={handleRestart}
                onBackToMenu={handleBackToMenu}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
