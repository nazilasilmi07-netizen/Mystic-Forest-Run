export type GameScreen = 'SPLASH' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type CharacterId = 'fox' | 'bunny' | 'panda';

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  species: string;
  description: string;
  primaryColor: string;
  accentColor: string;
}

export type LaneIndex = 0 | 1 | 2; // 0 = Left (Kiri), 1 = Middle (Tengah), 2 = Right (Kanan)

export type ObstacleType = 
  | 'log'             // Batang pohon
  | 'rock'            // Batu
  | 'hole'            // Lubang / celah jurang
  | 'thorny_bush'     // Semak berduri
  | 'hanging_branch'  // Dahan pohon gantung (harus turun/merunduk!)
  | 'bridge_hole';    // Lubang jembatan kayu

export type EnemyType = 
  | 'slime'         // Slime pixel-art (bouncing)
  | 'forest_monster'; // Monster hutan pixel-art

export type CollectibleType = 
  | 'coin'          // Koin emas
  | 'heart'         // Nyawa tambahan
  | 'magnet'        // Penarik koin
  | 'shield';       // Perisai pelindung

export interface Entity3D {
  id: string;
  lane: LaneIndex;
  z: number; // 0 (at player) to 1000+ (far distance)
  yOffset?: number; // For vertical displacement (e.g. jumping coins or floating items)
}

export interface ObstacleEntity extends Entity3D {
  kind: 'obstacle';
  obstacleType: ObstacleType;
  canJumpOver: boolean; // can be avoided by jumping
  canRollUnder?: boolean; // can be avoided by rolling/sliding (turun)
  width: number;
  height: number;
}

export interface EnemyEntity extends Entity3D {
  kind: 'enemy';
  enemyType: EnemyType;
  animationFrame: number;
  speedZ: number; // Move towards player faster or bounce
  jumpable: boolean; // Some slimes can be jumped over!
  variant: 'green' | 'purple';
}

export interface CollectibleEntity extends Entity3D {
  kind: 'collectible';
  collectibleType: CollectibleType;
  collected: boolean;
  rotationFrame: number;
  value: number;
}

export interface SceneryDecor extends Entity3D {
  side: 'left' | 'right';
  sceneryType: 'pine_tree' | 'oak_tree' | 'flower_bush' | 'mushroom_patch' | 'ruins_pillar' | 'lantern';
  xOffset: number;
}

export interface RiverSection {
  id: string;
  zStart: number;
  zEnd: number;
  bridgeLanes: [boolean, boolean, boolean]; // which lanes have safe wooden bridge
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface GameStats {
  score: number;
  coins: number;
  distance: number; // in meters
  level: 1 | 2;
  lives: number; // max 3
  maxLives: number;
  invincibleTimer: number; // seconds of iframe after getting hit
  shieldActive: boolean;
  magnetTimer: number;
  speed: number;
}

export interface LevelConfig {
  levelNumber: 1 | 2;
  name: string;
  subtitle: string;
  targetDistance: number; // distance to finish or advance
  baseSpeed: number;
  maxSpeed: number;
  obstacleSpawnRate: number;
  enemySpawnRate: number;
  skyColorTop: string;
  skyColorBottom: string;
  groundColor: string;
  laneColor: string;
  fogColor: string;
}
