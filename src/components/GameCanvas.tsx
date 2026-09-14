import React, { useEffect, useRef } from 'react';
import { GameEngine, LEVEL_1_CONFIG, LEVEL_2_CONFIG } from '../game/gameEngine';
import {
  getCharacterSprite,
  getObstacleSprite,
  getEnemySprite,
  getCollectibleSprite,
  getTreeSprite,
  getCastleBackground,
} from '../game/pixelSprites';

interface GameCanvasProps {
  engine: GameEngine;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isPaused) {
        engine.update(dt);
      }

      // --- RENDERING ---
      const w = canvas.width;
      const h = canvas.height;
      const isLevel2 = engine.stats.level === 2;
      const levelConfig = isLevel2 ? LEVEL_2_CONFIG : LEVEL_1_CONFIG;

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      // Screen Shake
      if (engine.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * engine.screenShake;
        const shakeY = (Math.random() - 0.5) * engine.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Clear background
      ctx.clearRect(0, 0, w, h);

      // 2. Horizon and Base constants
      const horizonY = h * 0.36;
      const baseY = h * 0.90;
      const centerX = w * 0.5;
      const baseTrackWidth = w * 0.72;
      const horizonTrackWidth = w * 0.08;
      const laneSpacingBase = baseTrackWidth / 3;

      // 3. Draw Parallax Background (Sky, Castle, Distant Forest)
      const castleBg = getCastleBackground(w, Math.floor(horizonY + 30), isLevel2);
      ctx.drawImage(castleBg, 0, 0, w, horizonY + 30);

      // 4. Ground Fill (Forest floor)
      ctx.fillStyle = levelConfig.groundColor;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // 5. Perspective Running Trail (3 Lanes converging to horizon)
      // Draw road polygon
      ctx.fillStyle = levelConfig.laneColor;
      ctx.beginPath();
      ctx.moveTo(centerX - horizonTrackWidth * 0.5, horizonY);
      ctx.lineTo(centerX + horizonTrackWidth * 0.5, horizonY);
      ctx.lineTo(centerX + baseTrackWidth * 0.5, baseY + 40);
      ctx.lineTo(centerX - baseTrackWidth * 0.5, baseY + 40);
      ctx.closePath();
      ctx.fill();

      // Road grass borders (pixel border details)
      ctx.fillStyle = isLevel2 ? '#581c87' : '#15803d';
      // Left border
      ctx.beginPath();
      ctx.moveTo(centerX - horizonTrackWidth * 0.5 - 4, horizonY);
      ctx.lineTo(centerX - horizonTrackWidth * 0.5, horizonY);
      ctx.lineTo(centerX - baseTrackWidth * 0.5, baseY + 40);
      ctx.lineTo(centerX - baseTrackWidth * 0.5 - 12, baseY + 40);
      ctx.closePath();
      ctx.fill();

      // Right border
      ctx.beginPath();
      ctx.moveTo(centerX + horizonTrackWidth * 0.5, horizonY);
      ctx.lineTo(centerX + horizonTrackWidth * 0.5 + 4, horizonY);
      ctx.lineTo(centerX + baseTrackWidth * 0.5 + 12, baseY + 40);
      ctx.lineTo(centerX + baseTrackWidth * 0.5, baseY + 40);
      ctx.closePath();
      ctx.fill();

      // Animated scrolling road dashes / cobblestone steps
      const scrollOffset = (engine.stats.distance * 8) % 40;
      ctx.strokeStyle = isLevel2 ? '#3b0764' : '#5a2507';
      ctx.lineWidth = 2;

      for (let zStep = 100; zStep < 980; zStep += 60) {
        const adjustedZ = (zStep - scrollOffset + 1000) % 1000;
        const normZ = Math.max(0, (1000 - adjustedZ) / 1000);
        const scale = Math.pow(normZ, 1.7);
        const y = horizonY + (baseY - horizonY) * scale;
        const widthAtZ = horizonTrackWidth + (baseTrackWidth - horizonTrackWidth) * scale;

        ctx.beginPath();
        ctx.moveTo(centerX - widthAtZ * 0.48, y);
        ctx.lineTo(centerX + widthAtZ * 0.48, y);
        ctx.stroke();
      }

      // Lane separator dotted lines
      const laneDividers = [-0.5, 0.5]; // Between lane 0-1 and lane 1-2
      for (const div of laneDividers) {
        for (let z = 60; z < 960; z += 40) {
          const adjZ = (z - scrollOffset + 1000) % 1000;
          const normZ = (1000 - adjZ) / 1000;
          const scale = Math.pow(normZ, 1.7);
          const y = horizonY + (baseY - horizonY) * scale;
          const laneSpacing = laneSpacingBase * scale;
          const x = centerX + div * laneSpacing;
          const dashH = Math.max(2, 8 * scale);

          ctx.fillStyle = isLevel2 ? '#7e22ce' : '#d97706';
          ctx.fillRect(x - 1, y, 2, dashH);
        }
      }

      // 6. Helper: Projection function (z: 0..1000, lane: -1..1 or custom)
      const project = (laneOffset: number, z: number) => {
        const normZ = Math.max(0.02, Math.min(1.05, (1000 - z) / 1000));
        const scale = Math.pow(normZ, 1.75);
        const y = horizonY + (baseY - horizonY) * scale;
        const laneSpacing = laneSpacingBase * scale;
        const x = centerX + laneOffset * laneSpacing;
        return { x, y, scale };
      };

      // 7. Rivers & Wooden Bridges (drawn on ground)
      for (const river of engine.rivers) {
        if (river.zStart < 1000 && river.zEnd > -30) {
          const pStart = project(0, river.zStart);
          const pEnd = project(0, river.zEnd);
          const y1 = Math.min(pStart.y, pEnd.y);
          const y2 = Math.max(pStart.y, pEnd.y);
          const riverH = Math.max(8, y2 - y1);

          // River water
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(0, y1, w, riverH);
          ctx.fillStyle = '#38bdf8';
          // River wave ripple
          const waveX = (Date.now() / 40) % 30;
          for (let rx = 0; rx < w; rx += 25) {
            ctx.fillRect((rx + waveX) % w, y1 + riverH * 0.5, 12, 2);
          }

          // Wooden bridge planks over lanes
          const lanes: [number, number, number] = [-1, 0, 1];
          for (let li = 0; li < 3; li++) {
            const hasBridge = river.bridgeLanes[li];
            const p = project(lanes[li], (river.zStart + river.zEnd) / 2);
            const bw = laneSpacingBase * p.scale * 0.95;
            const bh = riverH;

            if (hasBridge) {
              // Sturdy wooden bridge
              ctx.fillStyle = '#78350f';
              ctx.fillRect(p.x - bw * 0.5, y1, bw, bh);
              // Planks
              ctx.fillStyle = '#451a03';
              for (let py = y1; py < y2; py += Math.max(3, 8 * p.scale)) {
                ctx.fillRect(p.x - bw * 0.5, py, bw, Math.max(1, 2 * p.scale));
              }
              // Rope railing
              ctx.fillStyle = '#d97706';
              ctx.fillRect(p.x - bw * 0.5, y1, 3, bh);
              ctx.fillRect(p.x + bw * 0.5 - 3, y1, 3, bh);
            } else {
              // Broken bridge / Gap hole
              ctx.fillStyle = '#0369a1';
              ctx.fillRect(p.x - bw * 0.5, y1, bw, bh);
              // Broken jagged wood edges
              ctx.fillStyle = '#78350f';
              ctx.fillRect(p.x - bw * 0.5, y1, bw * 0.25, 4);
              ctx.fillRect(p.x + bw * 0.25, y1, bw * 0.25, 4);
            }
          }
        }
      }

      // 8. Collect and Sort Entities by Z (far to near painter's algorithm)
      interface RenderItem {
        z: number;
        render: () => void;
      }
      const renderQueue: RenderItem[] = [];

      // Scenery (Trees, bushes, ruins along the sides)
      for (const s of engine.sceneries) {
        if (s.z > -40 && s.z < 1000) {
          renderQueue.push({
            z: s.z,
            render: () => {
              const { x, y, scale } = project(s.xOffset, s.z);
              if (scale <= 0.05) return;

              const isPine = s.sceneryType === 'pine_tree';
              const sprite = getTreeSprite(isPine ? 'pine' : 'oak');
              const sprW = sprite.width * scale * 1.6;
              const sprH = sprite.height * scale * 1.6;

              ctx.drawImage(sprite, x - sprW * 0.5, y - sprH + 10 * scale, sprW, sprH);
            },
          });
        }
      }

      // Obstacles (Batang pohon, Batu, Lubang, Semak Berduri, Dahan Gantung)
      for (const obs of engine.obstacles) {
        if (obs.z > -40 && obs.z < 1000) {
          renderQueue.push({
            z: obs.z,
            render: () => {
              const laneOffset = obs.lane - 1; // 0->-1, 1->0, 2->1
              const { x, y, scale } = project(laneOffset, obs.z);
              if (scale <= 0.05) return;

              const sprite = getObstacleSprite(obs.obstacleType);
              const sprW = sprite.width * scale * 1.5;
              const sprH = sprite.height * scale * 1.5;

              // If it's a hanging branch, render elevated above the ground so player slides/rolls underneath
              const isHanging = obs.obstacleType === 'hanging_branch';
              const drawObsY = isHanging ? (y - sprH * 1.25) : (y - sprH * 0.75);

              ctx.drawImage(sprite, x - sprW * 0.5, drawObsY, sprW, sprH);
            },
          });
        }
      }

      // Enemies (Slimes and Forest Monsters)
      for (const enemy of engine.enemies) {
        if (enemy.z > -40 && enemy.z < 1000) {
          renderQueue.push({
            z: enemy.z,
            render: () => {
              const laneOffset = enemy.lane - 1;
              const { x, y, scale } = project(laneOffset, enemy.z);
              if (scale <= 0.05) return;

              const sprite = getEnemySprite(enemy.enemyType, enemy.animationFrame, enemy.variant);
              const sprW = sprite.width * scale * 1.5;
              const sprH = sprite.height * scale * 1.5;

              ctx.drawImage(sprite, x - sprW * 0.5, y - sprH * 0.85, sprW, sprH);
            },
          });
        }
      }

      // Collectibles (Coins, Hearts)
      for (const col of engine.collectibles) {
        if (!col.collected && col.z > -40 && col.z < 1000) {
          renderQueue.push({
            z: col.z,
            render: () => {
              const laneOffset = col.lane - 1;
              const { x, y, scale } = project(laneOffset, col.z);
              if (scale <= 0.05) return;

              const sprite = getCollectibleSprite(col.collectibleType, col.rotationFrame);
              const sprW = sprite.width * scale * 1.4;
              const sprH = sprite.height * scale * 1.4;
              const floatY = Math.sin((Date.now() / 200) + col.z) * 4 * scale;

              ctx.drawImage(sprite, x - sprW * 0.5, y - sprH - (col.yOffset || 0) * scale + floatY, sprW, sprH);
            },
          });
        }
      }

      // Player Entity
      const playerZ = 45;
      renderQueue.push({
        z: playerZ,
        render: () => {
          const laneOffset = engine.currentLaneX - 1;
          const { x, y, scale } = project(laneOffset, playerZ);

          // Blink effect when invincible
          if (engine.stats.invincibleTimer > 0) {
            const blink = Math.floor(Date.now() / 90) % 2 === 0;
            if (blink) return;
          }

          const isHurt = engine.stats.invincibleTimer > 1.2;
          const sprite = getCharacterSprite(engine.characterId, engine.runFrame, engine.isJumping, isHurt, engine.isRolling);
          const sprW = sprite.width * scale * 2.1;
          const sprH = sprite.height * scale * 2.1;

          // Shadow on ground
          const shadowW = Math.max(10, sprW * (engine.isRolling ? 0.75 : 0.6) * (1 - engine.jumpY / 180));
          const shadowH = Math.max(4, 8 * scale * (1 - engine.jumpY / 180));
          ctx.fillStyle = 'rgba(0,0,0,0.38)';
          ctx.beginPath();
          ctx.ellipse(x, y - 2, shadowW * 0.5, shadowH * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Player sprite raised by jumpY or adjusted by roll
          const rollOffset = engine.isRolling ? 6 * scale : 0;
          const drawY = y - sprH * 0.88 - engine.jumpY * scale + rollOffset;
          ctx.drawImage(sprite, x - sprW * 0.5, drawY, sprW, sprH);

          // Shield aura if active
          if (engine.stats.shieldActive) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, drawY + sprH * 0.5, sprW * 0.6, 0, Math.PI * 2);
            ctx.stroke();
          }
        },
      });

      // Sort all items by Z descending (1000 first, 0 last)
      renderQueue.sort((a, b) => b.z - a.z);

      // Execute render queue
      for (const item of renderQueue) {
        item.render();
      }

      // 9. Render Particles (dust, sparks, confetti)
      for (const p of engine.particles) {
        const laneOffset = engine.currentLaneX - 1;
        const pPlayer = project(laneOffset, playerZ);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(pPlayer.x + p.x, pPlayer.y + p.y, p.size, p.size);
        ctx.restore();
      }

      // 10. Damage Vignette Flash
      if (engine.stats.invincibleTimer > 1.3) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine, isPaused]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        engine.moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        engine.moveRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        engine.jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        engine.rollOrDrop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, isPaused]);

  // Touch Swipe & Tap Controls
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    const minSwipeDist = 30;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (Math.abs(dx) > minSwipeDist) {
        if (dx > 0) {
          engine.moveRight();
        } else {
          engine.moveLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(dy) > minSwipeDist) {
        if (dy < 0) {
          engine.jump();
        } else {
          engine.rollOrDrop();
        }
      } else if (dt < 250) {
        // Quick tap: tap left side of canvas -> left, right side -> right, center -> jump
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const tapRelX = (touch.clientX - rect.left) / rect.width;
          if (tapRelX < 0.33) {
            engine.moveLeft();
          } else if (tapRelX > 0.67) {
            engine.moveRight();
          } else {
            engine.jump();
          }
        }
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none">
      <canvas
        id="game-runner-canvas"
        ref={canvasRef}
        width={640}
        height={680}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-[640px] max-h-[95vh] aspect-[16/17] object-contain shadow-2xl rounded-lg pixelated border-4 border-amber-950 bg-stone-900"
      />
    </div>
  );
};
