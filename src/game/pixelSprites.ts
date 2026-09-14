// Procedural 2D Pixel Art Generator & Cache for Retro Runner
import { CharacterId, ObstacleType, EnemyType, CollectibleType } from '../types';

type CanvasMap = Map<string, HTMLCanvasElement>;
const spriteCache: CanvasMap = new Map();

function createPixelCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

// Helper to draw a pixel block
function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ----------------------------------------------------
// CHARACTERS
// ----------------------------------------------------

export function getCharacterSprite(charId: CharacterId, frame: number, isJumping: boolean, isHurt: boolean, isRolling: boolean = false): HTMLCanvasElement {
  const key = `char_${charId}_f${frame}_j${isJumping}_h${isHurt}_r${isRolling}`;
  if (spriteCache.has(key)) return spriteCache.get(key)!;

  const w = 32;
  const h = 32;
  const { canvas, ctx } = createPixelCanvas(w, h);

  if (isRolling) {
    // Curled rolling animation (fast spinning compact ball on ground)
    const rollAngle = (frame % 4) * 90;
    const orange = isHurt ? '#ff8888' : '#f97316';
    const darkOrange = isHurt ? '#cc4444' : '#c2410c';
    const white = '#ffffff';
    const dark = '#292524';
    const furColor = charId === 'bunny' ? (isHurt ? '#ffcccc' : '#f8fafc') : (charId === 'panda' ? (isHurt ? '#ff8888' : '#b45309') : orange);
    const secondaryColor = charId === 'bunny' ? '#f472b6' : (charId === 'panda' ? '#451a03' : white);

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(4, 28, 24, 3);

    // Rotate context around center (16, 21)
    ctx.save();
    ctx.translate(16, 21);
    ctx.rotate((rollAngle * Math.PI) / 180);

    // Ball body
    ctx.fillStyle = furColor;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Secondary color patch (belly/tail curl)
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.arc(2, 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Tucked ear/paws
    ctx.fillStyle = dark;
    ctx.fillRect(-7, -5, 3, 3);
    ctx.fillRect(3, 3, 3, 3);

    ctx.restore();

    // Slide/roll wind trail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(1, 23, 7, 1);
    ctx.fillRect(0, 26, 9, 1);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(2, 28, 4, 1);

    spriteCache.set(key, canvas);
    return canvas;
  }

  const bob = isJumping ? 0 : (frame % 2 === 0 ? 0 : 1);
  const legOffset = frame % 4;

  if (charId === 'fox') {
    // Cute Pixel Fox (Orange, white muzzle/chest, black ear tips, bushy tail)
    const orange = isHurt ? '#ff8888' : '#f97316';
    const darkOrange = isHurt ? '#cc4444' : '#c2410c';
    const white = '#ffffff';
    const dark = '#292524';

    // Shadow on ground
    if (!isJumping) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(8, 29, 16, 2);
    }

    // Fluffy Tail (sways with frame)
    const tailX = 5 + (frame % 2) * 2;
    const tailY = 16 - bob;
    px(ctx, tailX, tailY, darkOrange, 5, 8);
    px(ctx, tailX - 2, tailY + 2, orange, 6, 6);
    px(ctx, tailX - 3, tailY + 4, white, 4, 4); // white tip

    // Body
    px(ctx, 10, 15 - bob, orange, 12, 11);
    px(ctx, 12, 17 - bob, white, 8, 8); // white chest

    // Head
    px(ctx, 9, 7 - bob, orange, 14, 10);
    // Cheeks
    px(ctx, 7, 11 - bob, white, 4, 5);
    px(ctx, 21, 11 - bob, white, 4, 5);
    px(ctx, 12, 12 - bob, white, 8, 4); // muzzle

    // Ears
    px(ctx, 9, 3 - bob, dark, 4, 5);
    px(ctx, 10, 4 - bob, orange, 2, 4);
    px(ctx, 19, 3 - bob, dark, 4, 5);
    px(ctx, 20, 4 - bob, orange, 2, 4);

    // Eyes
    if (isHurt) {
      // X eyes
      px(ctx, 11, 10 - bob, dark, 3, 1);
      px(ctx, 12, 9 - bob, dark, 1, 3);
      px(ctx, 18, 10 - bob, dark, 3, 1);
      px(ctx, 19, 9 - bob, dark, 1, 3);
    } else {
      px(ctx, 11, 9 - bob, dark, 3, 3);
      px(ctx, 11, 9 - bob, white, 1, 1); // shine
      px(ctx, 18, 9 - bob, dark, 3, 3);
      px(ctx, 18, 9 - bob, white, 1, 1);
    }

    // Nose
    px(ctx, 15, 13 - bob, dark, 2, 2);

    // Legs
    if (isJumping) {
      // Tucked paws
      px(ctx, 11, 24, darkOrange, 4, 3);
      px(ctx, 17, 24, darkOrange, 4, 3);
      px(ctx, 11, 26, dark, 4, 2);
      px(ctx, 17, 26, dark, 4, 2);
    } else {
      // Running legs
      const l1 = legOffset === 1 ? -2 : (legOffset === 3 ? 2 : 0);
      const l2 = -l1;
      px(ctx, 11, 24 - bob, darkOrange, 4, 4 + l1);
      px(ctx, 11, 27 - bob + l1, dark, 4, 2);
      px(ctx, 17, 24 - bob, darkOrange, 4, 4 + l2);
      px(ctx, 17, 27 - bob + l2, dark, 4, 2);
    }
  } else if (charId === 'bunny') {
    // Cute White Bunny with Pink Ears
    const fur = isHurt ? '#ffcccc' : '#f8fafc';
    const pink = '#f472b6';
    const dark = '#1e293b';

    if (!isJumping) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(9, 29, 14, 2);
    }

    // Fluffy round tail
    px(ctx, 6, 21 - bob, fur, 4, 4);

    // Body
    px(ctx, 10, 16 - bob, fur, 12, 10);
    px(ctx, 12, 18 - bob, pink, 6, 6);

    // Long Floppy Ears
    const earBounce = isJumping ? -2 : (frame % 2 === 0 ? 0 : 1);
    px(ctx, 9, 2 + earBounce, fur, 4, 9);
    px(ctx, 10, 3 + earBounce, pink, 2, 7);
    px(ctx, 19, 1 + earBounce, fur, 4, 10);
    px(ctx, 20, 2 + earBounce, pink, 2, 8);

    // Head
    px(ctx, 9, 9 - bob, fur, 14, 10);

    // Eyes
    if (isHurt) {
      px(ctx, 11, 12 - bob, dark, 3, 1);
      px(ctx, 18, 12 - bob, dark, 3, 1);
    } else {
      px(ctx, 11, 11 - bob, dark, 3, 3);
      px(ctx, 11, 11 - bob, '#ffffff', 1, 1);
      px(ctx, 18, 11 - bob, dark, 3, 3);
      px(ctx, 18, 11 - bob, '#ffffff', 1, 1);
    }
    // Cute pink nose
    px(ctx, 15, 14 - bob, pink, 2, 2);

    // Legs
    if (isJumping) {
      px(ctx, 10, 24, fur, 5, 4);
      px(ctx, 17, 24, fur, 5, 4);
    } else {
      const l1 = legOffset === 1 ? -2 : (legOffset === 3 ? 2 : 0);
      px(ctx, 11, 24 - bob, fur, 4, 4 + l1);
      px(ctx, 17, 24 - bob, fur, 4, 4 - l1);
    }
  } else {
    // Red Panda
    const rust = isHurt ? '#ff8888' : '#b45309';
    const dark = '#451a03';
    const white = '#ffffff';

    if (!isJumping) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(8, 29, 16, 2);
    }

    // Striped bushy tail
    const tx = 5 + (frame % 2) * 2;
    px(ctx, tx, 16 - bob, rust, 6, 8);
    px(ctx, tx + 1, 17 - bob, dark, 4, 2);
    px(ctx, tx + 1, 20 - bob, dark, 4, 2);

    // Body
    px(ctx, 10, 15 - bob, rust, 12, 10);
    px(ctx, 12, 17 - bob, dark, 8, 8);

    // Head
    px(ctx, 8, 7 - bob, rust, 16, 10);
    px(ctx, 9, 10 - bob, white, 4, 5); // white cheeks
    px(ctx, 19, 10 - bob, white, 4, 5);

    // Round ears
    px(ctx, 8, 4 - bob, white, 4, 4);
    px(ctx, 9, 5 - bob, rust, 2, 2);
    px(ctx, 20, 4 - bob, white, 4, 4);
    px(ctx, 21, 5 - bob, rust, 2, 2);

    // Eyes
    px(ctx, 11, 9 - bob, dark, 3, 3);
    px(ctx, 18, 9 - bob, dark, 3, 3);
    px(ctx, 15, 13 - bob, dark, 2, 2);

    // Legs
    if (isJumping) {
      px(ctx, 11, 24, dark, 4, 3);
      px(ctx, 17, 24, dark, 4, 3);
    } else {
      const l1 = legOffset === 1 ? -2 : (legOffset === 3 ? 2 : 0);
      px(ctx, 11, 24 - bob, dark, 4, 4 + l1);
      px(ctx, 17, 24 - bob, dark, 4, 4 - l1);
    }
  }

  spriteCache.set(key, canvas);
  return canvas;
}

// ----------------------------------------------------
// OBSTACLES (Batang pohon, Batu, Lubang, Semak Berduri)
// ----------------------------------------------------

export function getObstacleSprite(type: ObstacleType): HTMLCanvasElement {
  const key = `obstacle_${type}`;
  if (spriteCache.has(key)) return spriteCache.get(key)!;

  const w = 48;
  const h = 36;
  const { canvas, ctx } = createPixelCanvas(w, h);

  if (type === 'log') {
    // Fallen Tree Trunk (Batang Pohon)
    // Bark
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 16, 40, 16);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(4, 28, 40, 4);
    ctx.fillRect(8, 20, 6, 2);
    ctx.fillRect(22, 18, 8, 2);
    ctx.fillRect(32, 23, 6, 2);

    // Tree rings on sides
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(6, 24, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#451a03';
    ctx.fillRect(5, 23, 2, 2);

    // Green moss on top
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(10, 14, 8, 3);
    ctx.fillRect(24, 13, 10, 3);
    ctx.fillRect(36, 15, 6, 2);

    // Little mushroom sprout
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(28, 9, 4, 4);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(29, 10, 2, 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(29, 13, 2, 2);
  } else if (type === 'rock') {
    // Mossy Rock / Stone (Batu Hutan)
    ctx.fillStyle = '#475569';
    ctx.fillRect(8, 14, 32, 18);
    ctx.fillRect(12, 8, 24, 8);
    ctx.fillRect(6, 20, 36, 12);

    // Highlights
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(14, 9, 10, 4);
    ctx.fillRect(10, 15, 8, 5);

    // Deep shadow
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(8, 28, 32, 5);
    ctx.fillRect(34, 16, 6, 14);

    // Moss patches
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(14, 13, 8, 4);
    ctx.fillRect(26, 17, 6, 3);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(15, 14, 4, 2);
  } else if (type === 'hole' || type === 'bridge_hole') {
    // Lubang di tanah / Celah jurang
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(4, 18, 40, 16);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 20, 32, 12);

    // Jagged dirt edges
    ctx.fillStyle = '#713f12';
    ctx.fillRect(4, 16, 40, 3);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(6, 15, 4, 2);
    ctx.fillRect(16, 15, 6, 2);
    ctx.fillRect(30, 15, 8, 2);

    // Warning stakes or wooden splinter
    ctx.fillStyle = '#b45309';
    ctx.fillRect(6, 8, 3, 10);
    ctx.fillRect(39, 8, 3, 10);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(5, 5, 5, 4);
    ctx.fillRect(38, 5, 5, 4);
  } else if (type === 'thorny_bush') {
    // Semak Berduri (Thorny Bush with Sharp Thorns and Berries)
    ctx.fillStyle = '#14532d';
    ctx.fillRect(6, 12, 36, 20);
    ctx.fillRect(10, 6, 28, 10);

    // Darker thorny branches
    ctx.fillStyle = '#052e16';
    ctx.fillRect(12, 15, 24, 14);

    // Sharp spikes / thorns
    ctx.fillStyle = '#dc2626';
    // Left thorn
    px(ctx, 4, 18, '#dc2626', 4, 2);
    px(ctx, 2, 17, '#fca5a5', 2, 2);
    // Right thorn
    px(ctx, 40, 18, '#dc2626', 4, 2);
    px(ctx, 44, 17, '#fca5a5', 2, 2);
    // Top thorns
    px(ctx, 15, 4, '#dc2626', 2, 4);
    px(ctx, 23, 3, '#dc2626', 2, 4);
    px(ctx, 31, 4, '#dc2626', 2, 4);

    // Warning poison berries
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(14, 16, 3, 3);
    ctx.fillRect(22, 20, 3, 3);
    ctx.fillRect(30, 14, 3, 3);
  } else if (type === 'hanging_branch') {
    // Dahan Pohon Gantung (Elevated obstacle: player must slide/duck/roll under!)
    // Top branch bar
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 4, 48, 9);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 6, 48, 5);

    // Leaves and foliage
    ctx.fillStyle = '#15803d';
    ctx.fillRect(4, 1, 40, 9);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(8, 2, 32, 6);

    // Hanging tangled vines pointing down (hanging down to y=19)
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(8, 12, 3, 7);
    ctx.fillRect(20, 12, 4, 8);
    ctx.fillRect(32, 12, 3, 6);

    // Warning bright berries
    ctx.fillStyle = '#facc15';
    ctx.fillRect(9, 18, 2, 2);
    ctx.fillRect(21, 19, 2, 2);
    ctx.fillRect(33, 17, 2, 2);
  }

  spriteCache.set(key, canvas);
  return canvas;
}

// ----------------------------------------------------
// ENEMIES (Pixel Slime & Forest Monster)
// ----------------------------------------------------

export function getEnemySprite(type: EnemyType, frame: number, variant: 'green' | 'purple' = 'green'): HTMLCanvasElement {
  const key = `enemy_${type}_${variant}_f${frame}`;
  if (spriteCache.has(key)) return spriteCache.get(key)!;

  const w = 40;
  const h = 40;
  const { canvas, ctx } = createPixelCanvas(w, h);

  if (type === 'slime') {
    // Bouncy pixel slime (squash and stretch)
    const isSquash = frame % 2 === 1;
    const bodyColor = variant === 'green' ? '#22c55e' : '#a855f7';
    const darkColor = variant === 'green' ? '#15803d' : '#6b21a8';
    const lightColor = variant === 'green' ? '#86efac' : '#d8b4fe';

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(6, 34, 28, 4);

    if (isSquash) {
      // Squashed frame (wider, shorter)
      ctx.fillStyle = bodyColor;
      ctx.fillRect(4, 20, 32, 15);
      ctx.fillRect(8, 16, 24, 5);

      // Highlight bubble
      ctx.fillStyle = lightColor;
      ctx.fillRect(10, 18, 6, 3);

      // Dark base
      ctx.fillStyle = darkColor;
      ctx.fillRect(4, 31, 32, 4);

      // Angry eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 23, 5, 4);
      ctx.fillRect(25, 23, 5, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 24, 3, 3);
      ctx.fillRect(25, 24, 3, 3);
      // Angry brow
      ctx.fillStyle = darkColor;
      ctx.fillRect(9, 21, 6, 2);
      ctx.fillRect(25, 21, 6, 2);
    } else {
      // Stretched/tall frame (jumping/pulsing)
      ctx.fillStyle = bodyColor;
      ctx.fillRect(8, 14, 24, 20);
      ctx.fillRect(12, 10, 16, 6);

      // Highlight bubble
      ctx.fillStyle = lightColor;
      ctx.fillRect(13, 12, 6, 4);

      // Base
      ctx.fillStyle = darkColor;
      ctx.fillRect(8, 30, 24, 4);

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 18, 5, 5);
      ctx.fillRect(24, 18, 5, 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(13, 20, 3, 3);
      ctx.fillRect(24, 20, 3, 3);

      // Angry brow
      ctx.fillStyle = darkColor;
      ctx.fillRect(10, 16, 6, 2);
      ctx.fillRect(24, 16, 6, 2);
    }
  } else {
    // Forest Monster (Ogre / Treant Beast)
    const skin = '#3f6212';
    const darkSkin = '#1a2e05';
    const horn = '#ea580c';
    const eye = '#ef4444';
    const step = frame % 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(6, 36, 28, 3);

    // Horns
    px(ctx, 7, 4, horn, 4, 7);
    px(ctx, 29, 4, horn, 4, 7);
    px(ctx, 9, 2, '#fb923c', 2, 4);
    px(ctx, 29, 2, '#fb923c', 2, 4);

    // Monster Head & Body
    ctx.fillStyle = skin;
    ctx.fillRect(8, 8, 24, 24);

    // Moss / Foliage crest on top
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(11, 7, 18, 3);

    // Glowing Menacing Eyes
    ctx.fillStyle = eye;
    ctx.fillRect(11, 14, 6, 4);
    ctx.fillRect(23, 14, 6, 4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(13, 15, 2, 2);
    ctx.fillRect(25, 15, 2, 2);

    // Sharp teeth / fangs
    ctx.fillStyle = darkSkin;
    ctx.fillRect(12, 22, 16, 5);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(13, 22, 2, 3);
    ctx.fillRect(17, 22, 2, 3);
    ctx.fillRect(21, 22, 2, 3);
    ctx.fillRect(25, 22, 2, 3);

    // Heavy feet
    ctx.fillStyle = darkSkin;
    if (step === 0) {
      ctx.fillRect(9, 31, 7, 6);
      ctx.fillRect(24, 30, 7, 5);
    } else {
      ctx.fillRect(9, 30, 7, 5);
      ctx.fillRect(24, 31, 7, 6);
    }
  }

  spriteCache.set(key, canvas);
  return canvas;
}

// ----------------------------------------------------
// COLLECTIBLES (Coins, Hearts, Shield)
// ----------------------------------------------------

export function getCollectibleSprite(type: CollectibleType, frame: number): HTMLCanvasElement {
  const key = `item_${type}_f${frame}`;
  if (spriteCache.has(key)) return spriteCache.get(key)!;

  const w = 24;
  const h = 24;
  const { canvas, ctx } = createPixelCanvas(w, h);

  if (type === 'coin') {
    // 4-frame rotating gold coin
    const rot = frame % 4;
    const gold = '#facc15';
    const darkGold = '#ca8a04';
    const light = '#fef08a';

    let cw = 16;
    let cx = 4;
    if (rot === 1 || rot === 3) {
      cw = 8;
      cx = 8;
    } else if (rot === 2) {
      cw = 4;
      cx = 10;
    }

    ctx.fillStyle = darkGold;
    ctx.fillRect(cx, 4, cw, 16);
    ctx.fillStyle = gold;
    ctx.fillRect(cx + 1, 5, Math.max(1, cw - 2), 14);

    if (cw >= 8) {
      ctx.fillStyle = light;
      ctx.fillRect(cx + 2, 6, 2, 10);
      ctx.fillStyle = darkGold;
      // Pixel star/star mark
      ctx.fillRect(cx + Math.floor(cw / 2) - 1, 9, 2, 5);
    }
  } else if (type === 'heart') {
    // Pixel Heart
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(4, 5, 6, 5);
    ctx.fillRect(14, 5, 6, 5);
    ctx.fillRect(3, 8, 18, 6);
    ctx.fillRect(5, 14, 14, 4);
    ctx.fillRect(8, 18, 8, 3);
    ctx.fillRect(10, 21, 4, 2);

    // Highlight
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(5, 6, 2, 3);
    ctx.fillRect(15, 6, 2, 3);
  } else if (type === 'shield') {
    // Blue Magic Shield
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(5, 3, 14, 14);
    ctx.fillRect(7, 17, 10, 4);
    ctx.fillRect(10, 21, 4, 2);

    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(9, 7, 6, 6);
    ctx.fillRect(11, 5, 2, 10);
  }

  spriteCache.set(key, canvas);
  return canvas;
}

// ----------------------------------------------------
// SCENERY (Trees, Castle, Bridge, Path)
// ----------------------------------------------------

export function getTreeSprite(kind: 'pine' | 'oak'): HTMLCanvasElement {
  const key = `tree_${kind}`;
  if (spriteCache.has(key)) return spriteCache.get(key)!;

  const w = 64;
  const h = 96;
  const { canvas, ctx } = createPixelCanvas(w, h);

  if (kind === 'pine') {
    // Giant Pixel Pine Tree
    // Trunk
    ctx.fillStyle = '#451a03';
    ctx.fillRect(28, 60, 8, 34);

    // Pine Foliage tiers
    const greenDark = '#064e3b';
    const greenMid = '#047857';
    const greenLight = '#10b981';

    // Tier 1 (bottom)
    ctx.fillStyle = greenDark;
    ctx.fillRect(8, 52, 48, 16);
    ctx.fillStyle = greenMid;
    ctx.fillRect(12, 46, 40, 14);
    ctx.fillStyle = greenLight;
    ctx.fillRect(14, 46, 12, 6);

    // Tier 2 (middle)
    ctx.fillStyle = greenDark;
    ctx.fillRect(14, 34, 36, 16);
    ctx.fillStyle = greenMid;
    ctx.fillRect(18, 28, 28, 14);
    ctx.fillStyle = greenLight;
    ctx.fillRect(20, 28, 10, 5);

    // Tier 3 (top)
    ctx.fillStyle = greenDark;
    ctx.fillRect(20, 18, 24, 14);
    ctx.fillStyle = greenMid;
    ctx.fillRect(24, 10, 16, 12);
    ctx.fillStyle = greenLight;
    ctx.fillRect(26, 10, 6, 4);

    // Peak
    ctx.fillStyle = greenMid;
    ctx.fillRect(28, 4, 8, 8);
    ctx.fillStyle = greenLight;
    ctx.fillRect(30, 2, 4, 4);
  } else {
    // Lush Oak Tree
    ctx.fillStyle = '#78350f';
    ctx.fillRect(26, 52, 12, 42);

    // Lush rounded crown
    ctx.fillStyle = '#15803d';
    ctx.fillRect(8, 16, 48, 44);
    ctx.fillRect(14, 8, 36, 16);

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(12, 12, 20, 22);
    ctx.fillRect(32, 22, 18, 20);

    ctx.fillStyle = '#86efac';
    ctx.fillRect(16, 14, 10, 8);
    ctx.fillRect(36, 24, 8, 6);
  }

  spriteCache.set(key, canvas);
  return canvas;
}

// Fantasy Castle Background for Splash Screen and Distant Horizon
export function getCastleBackground(w = 640, h = 360, isLevel2 = false): HTMLCanvasElement {
  const key = `bg_castle_l${isLevel2}_${w}x${h}`;
  if (spriteCache.has(key)) return spriteCache.get(key)!;

  const { canvas, ctx } = createPixelCanvas(w, h);

  // 1. Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  if (isLevel2) {
    // Dangerous sunset/twilight forest: deep violet, crimson to dark amber
    skyGrad.addColorStop(0, '#1e1b4b');
    skyGrad.addColorStop(0.5, '#4c1d95');
    skyGrad.addColorStop(0.85, '#831843');
    skyGrad.addColorStop(1, '#ea580c');
  } else {
    // Enchanted fantasy morning: deep sky blue, turquoise to warm golden peach
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(0.5, '#38bdf8');
    skyGrad.addColorStop(0.85, '#bae6fd');
    skyGrad.addColorStop(1, '#fef08a');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Pixel Clouds
  ctx.fillStyle = isLevel2 ? 'rgba(244, 114, 182, 0.35)' : 'rgba(255, 255, 255, 0.55)';
  // Cloud 1
  ctx.fillRect(40, 40, 100, 16);
  ctx.fillRect(60, 32, 60, 14);
  // Cloud 2
  ctx.fillRect(w - 180, 60, 120, 18);
  ctx.fillRect(w - 150, 50, 70, 16);

  // 3. Distant Mountains (Silhouette)
  const mountainColor = isLevel2 ? '#311042' : '#0369a1';
  ctx.fillStyle = mountainColor;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.55);
  ctx.lineTo(w * 0.2, h * 0.35);
  ctx.lineTo(w * 0.45, h * 0.55);
  ctx.lineTo(w * 0.7, h * 0.38);
  ctx.lineTo(w, h * 0.55);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

  // 4. Fantasy Forest Castle (Centrally nestled among mountains)
  const stone = isLevel2 ? '#4a154b' : '#334155';
  const stoneLight = isLevel2 ? '#6b21a8' : '#64748b';
  const roof = isLevel2 ? '#991b1b' : '#0284c7';
  const gold = '#facc15';

  const cx = w * 0.5;
  const cy = h * 0.45;

  // Main Castle Keep
  ctx.fillStyle = stone;
  ctx.fillRect(cx - 50, cy - 25, 100, 50);

  // Spire 1 (Center tall tower)
  ctx.fillRect(cx - 15, cy - 65, 30, 45);
  // Roof Cone
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 95);
  ctx.lineTo(cx - 18, cy - 65);
  ctx.lineTo(cx + 18, cy - 65);
  ctx.fill();
  // Castle flag
  ctx.fillStyle = gold;
  ctx.fillRect(cx, cy - 105, 2, 12);
  ctx.fillRect(cx + 2, cy - 105, 10, 6);

  // Left Tower
  ctx.fillStyle = stoneLight;
  ctx.fillRect(cx - 55, cy - 45, 22, 45);
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(cx - 44, cy - 70);
  ctx.lineTo(cx - 58, cy - 45);
  ctx.lineTo(cx - 30, cy - 45);
  ctx.fill();

  // Right Tower
  ctx.fillStyle = stoneLight;
  ctx.fillRect(cx + 33, cy - 45, 22, 45);
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(cx + 44, cy - 70);
  ctx.lineTo(cx + 30, cy - 45);
  ctx.lineTo(cx + 58, cy - 45);
  ctx.fill();

  // Castle Gate and Windows
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - 10, cy + 5, 20, 20); // Gate
  ctx.fillRect(cx - 6, cy - 45, 12, 14); // Window
  ctx.fillRect(cx - 48, cy - 30, 8, 10);
  ctx.fillRect(cx + 40, cy - 30, 8, 10);

  // 5. Midground Tree Canopy Layers
  const canopy1 = isLevel2 ? '#1c1917' : '#064e3b';
  ctx.fillStyle = canopy1;
  for (let x = -20; x < w + 40; x += 35) {
    const th = 40 + Math.sin(x) * 15;
    ctx.fillRect(x, cy + 20 - th, 40, th + 80);
  }

  // 6. Foreground Forest Ground & Path Convergence
  const ground = isLevel2 ? '#2e1065' : '#047857';
  ctx.fillStyle = ground;
  ctx.fillRect(0, cy + 40, w, h - (cy + 40));

  spriteCache.set(key, canvas);
  return canvas;
}
