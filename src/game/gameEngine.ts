import {
  CharacterId,
  LaneIndex,
  ObstacleEntity,
  EnemyEntity,
  CollectibleEntity,
  SceneryDecor,
  RiverSection,
  Particle,
  GameStats,
  LevelConfig,
  ObstacleType,
} from '../types';
import { audio } from '../audio/sound';

export const LEVEL_1_CONFIG: LevelConfig = {
  levelNumber: 1,
  name: 'Hutan',
  subtitle: 'Petualangan Rimba Hijau',
  targetDistance: 500,
  baseSpeed: 380,
  maxSpeed: 480,
  obstacleSpawnRate: 1.6, // seconds between spawns
  enemySpawnRate: 4.5,    // slimes appear occasionally
  skyColorTop: '#0284c7',
  skyColorBottom: '#bae6fd',
  groundColor: '#052e16',
  laneColor: '#78350f',
  fogColor: '#14532d',
};

export const LEVEL_2_CONFIG: LevelConfig = {
  levelNumber: 2,
  name: 'Hutan Berbahaya',
  subtitle: 'Monster & Slime Bermunculan!',
  targetDistance: 1000,
  baseSpeed: 520,
  maxSpeed: 650,
  obstacleSpawnRate: 1.1, // more dense obstacles
  enemySpawnRate: 2.0,    // monsters and slimes appear immediately
  skyColorTop: '#1e1b4b',
  skyColorBottom: '#831843',
  groundColor: '#2e1065',
  laneColor: '#451a03',
  fogColor: '#3b0764',
};

export class GameEngine {
  // Player state
  public characterId: CharacterId = 'fox';
  public targetLane: LaneIndex = 1; // 0, 1, 2
  public currentLaneX: number = 1.0; // interpolated for smooth transition
  public isJumping: boolean = false;
  public jumpY: number = 0; // vertical offset in pixels
  private jumpVy: number = 0;
  private gravity: number = 1200; // px/s^2
  private jumpPower: number = 540;

  // Rolling / Slide (Turun)
  public isRolling: boolean = false;
  public rollTimer: number = 0;
  public readonly rollDuration: number = 0.65;

  // Running animation
  public runFrame: number = 0;
  private runFrameTimer: number = 0;

  // Game Stats
  public stats: GameStats = {
    score: 0,
    coins: 0,
    distance: 0,
    level: 1,
    lives: 3,
    maxLives: 3,
    invincibleTimer: 0,
    shieldActive: false,
    magnetTimer: 0,
    speed: LEVEL_1_CONFIG.baseSpeed,
  };

  // World Entities (Z-axis: 0 is camera, 1000 is horizon)
  public obstacles: ObstacleEntity[] = [];
  public enemies: EnemyEntity[] = [];
  public collectibles: CollectibleEntity[] = [];
  public sceneries: SceneryDecor[] = [];
  public rivers: RiverSection[] = [];
  public particles: Particle[] = [];

  // Spawn timers
  private obstacleTimer: number = 0;
  private enemyTimer: number = 0;
  private coinTimer: number = 0;
  private decorTimer: number = 0;
  private riverTimer: number = 0;

  // Events & callbacks
  public onGameOver?: () => void;
  public onVictory?: () => void;
  public onLevelChange?: (newLevel: 1 | 2) => void;
  public screenShake: number = 0;

  constructor(charId: CharacterId = 'fox') {
    this.characterId = charId;
    this.reset(charId);
  }

  public reset(charId?: CharacterId) {
    if (charId) this.characterId = charId;
    this.targetLane = 1;
    this.currentLaneX = 1.0;
    this.isJumping = false;
    this.jumpY = 0;
    this.jumpVy = 0;
    this.isRolling = false;
    this.rollTimer = 0;
    this.runFrame = 0;
    this.runFrameTimer = 0;
    this.screenShake = 0;

    this.stats = {
      score: 0,
      coins: 0,
      distance: 0,
      level: 1,
      lives: 3,
      maxLives: 3,
      invincibleTimer: 0,
      shieldActive: false,
      magnetTimer: 0,
      speed: LEVEL_1_CONFIG.baseSpeed,
    };

    this.obstacles = [];
    this.enemies = [];
    this.collectibles = [];
    this.sceneries = [];
    this.rivers = [];
    this.particles = [];

    this.obstacleTimer = 1.0;
    this.enemyTimer = 2.5;
    this.coinTimer = 0.5;
    this.decorTimer = 0;
    this.riverTimer = 12.0;

    // Seed initial scenery along the sides
    for (let z = 100; z < 1000; z += 120) {
      this.spawnSceneryPair(z);
    }
  }

  public setCharacter(charId: CharacterId) {
    this.characterId = charId;
  }

  // Lane input handling
  public moveLeft() {
    if (this.targetLane > 0) {
      this.targetLane = (this.targetLane - 1) as LaneIndex;
      audio.playLaneSwitch();
      this.spawnDustParticles();
    }
  }

  public moveRight() {
    if (this.targetLane < 2) {
      this.targetLane = (this.targetLane + 1) as LaneIndex;
      audio.playLaneSwitch();
      this.spawnDustParticles();
    }
  }

  public jump() {
    // Jump immediately cancels roll for high responsiveness
    this.isRolling = false;
    this.rollTimer = 0;

    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVy = this.jumpPower;
      audio.playJump();
      this.spawnDustParticles(8);
    }
  }

  public rollOrDrop() {
    if (this.isJumping) {
      // In mid-air: slam down rapidly to the ground and roll immediately upon landing!
      this.jumpVy = -850;
      this.isRolling = true;
      this.rollTimer = this.rollDuration;
      audio.playSlide();
      this.spawnDustParticles(8);
    } else {
      // On ground: slide / roll (merunduk / berguling)
      this.isRolling = true;
      this.rollTimer = this.rollDuration;
      audio.playSlide();
      this.spawnDustParticles(10);
    }
  }

  // Main update tick
  public update(dt: number): void {
    if (this.stats.lives <= 0) return;

    // Cap dt to prevent huge leaps if tab was blurred
    const delta = Math.min(dt, 0.05);

    const levelConfig = this.stats.level === 1 ? LEVEL_1_CONFIG : LEVEL_2_CONFIG;

    // 1. Update distance & speed
    const currentSpeed = Math.min(
      levelConfig.maxSpeed,
      levelConfig.baseSpeed + (this.stats.distance % 500) * 0.25
    );
    this.stats.speed = currentSpeed;
    const distDelta = (currentSpeed * delta) / 10;
    this.stats.distance += distDelta;
    this.stats.score += Math.floor(distDelta * 2);

    // Check Level 1 -> Level 2 transition
    if (this.stats.level === 1 && this.stats.distance >= LEVEL_1_CONFIG.targetDistance) {
      this.stats.level = 2;
      this.stats.speed = LEVEL_2_CONFIG.baseSpeed;
      audio.playLevelUp();
      if (this.onLevelChange) this.onLevelChange(2);
      // Spawn extra celebration sparkles
      this.spawnCelebrationBurst();
    }

    // Check Victory condition (Level 2 complete at targetDistance)
    if (this.stats.level === 2 && this.stats.distance >= LEVEL_2_CONFIG.targetDistance) {
      audio.playVictory();
      if (this.onVictory) this.onVictory();
      return;
    }

    // 2. Invincibility & buffs
    if (this.stats.invincibleTimer > 0) {
      this.stats.invincibleTimer -= delta;
    }
    if (this.stats.magnetTimer > 0) {
      this.stats.magnetTimer -= delta;
    }
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - delta * 20);
    }

    // 3. Roll / Slide (Turun) timer
    if (this.isRolling) {
      this.rollTimer -= delta;
      if (this.rollTimer <= 0) {
        this.isRolling = false;
        this.rollTimer = 0;
      } else {
        // Continuous sliding dust trail
        if (Math.random() < 0.35) {
          this.spawnDustParticles(2);
        }
      }
    }

    // 4. Smooth lane transition
    const laneDiff = this.targetLane - this.currentLaneX;
    this.currentLaneX += laneDiff * Math.min(1, delta * 14);

    // 5. Jump physics
    if (this.isJumping) {
      this.jumpY += this.jumpVy * delta;
      this.jumpVy -= this.gravity * delta;
      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.jumpVy = 0;
        this.isJumping = false;
        this.spawnDustParticles(6);
      }
    }

    // 6. Run animation frame
    this.runFrameTimer += delta;
    if (this.runFrameTimer > 0.1) {
      this.runFrame = (this.runFrame + 1) % 4;
      this.runFrameTimer = 0;
    }

    // 6. Spawn generators
    this.updateSpawners(delta, levelConfig);

    // 7. Advance objects towards player (Z decreasing)
    const zDelta = currentSpeed * delta;

    // Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.z -= zDelta;

      // Check collision near player (z between 15 and 95)
      if (obs.z > 15 && obs.z < 95) {
        this.checkObstacleCollision(obs);
      }

      // Remove behind player
      if (obs.z < -40) {
        this.obstacles.splice(i, 1);
      }
    }

    // Enemies (Slime & Monster)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.z -= (zDelta + enemy.speedZ * delta);
      enemy.animationFrame = Math.floor(Date.now() / 200) % 2;

      // Collision near player
      if (enemy.z > 20 && enemy.z < 90) {
        this.checkEnemyCollision(enemy, i);
      }

      if (enemy.z < -40) {
        this.enemies.splice(i, 1);
      }
    }

    // Collectibles (Coins, Hearts)
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.z -= zDelta;
      col.rotationFrame = Math.floor(Date.now() / 150) % 4;

      // Magnet effect if active
      if (this.stats.magnetTimer > 0 && col.z < 350 && !col.collected) {
        const laneDiffCol = this.currentLaneX - col.lane;
        col.lane = (col.lane + Math.sign(laneDiffCol) * 0.1) as LaneIndex;
      }

      // Pickup check
      if (!col.collected && col.z > 10 && col.z < 100) {
        const laneDist = Math.abs(this.currentLaneX - col.lane);
        if (laneDist < 0.6) {
          this.collectItem(col);
          this.collectibles.splice(i, 1);
          continue;
        }
      }

      if (col.z < -40) {
        this.collectibles.splice(i, 1);
      }
    }

    // Scenery Decor
    for (let i = this.sceneries.length - 1; i >= 0; i--) {
      const item = this.sceneries[i];
      item.z -= zDelta;
      if (item.z < -60) {
        this.sceneries.splice(i, 1);
      }
    }

    // Rivers & Bridges
    for (let i = this.rivers.length - 1; i >= 0; i--) {
      const river = this.rivers[i];
      river.zStart -= zDelta;
      river.zEnd -= zDelta;

      // Player over river check
      if (river.zEnd > 30 && river.zStart < 80) {
        const currentLaneRounded = Math.round(this.currentLaneX) as LaneIndex;
        const hasBridge = river.bridgeLanes[currentLaneRounded];
        // If no bridge, player must be jumping!
        if (!hasBridge && this.jumpY < 30 && this.stats.invincibleTimer <= 0) {
          this.takeDamage('Jatuh ke lubang sungai!');
        }
      }

      if (river.zEnd < -50) {
        this.rivers.splice(i, 1);
      }
    }

    // 8. Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.life -= delta;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Spawner management
  private updateSpawners(delta: number, config: LevelConfig) {
    // 1. Scenery along path
    this.decorTimer -= delta;
    if (this.decorTimer <= 0) {
      this.spawnSceneryPair(1000);
      this.decorTimer = 0.28;
    }

    // 2. Obstacles
    this.obstacleTimer -= delta;
    if (this.obstacleTimer <= 0) {
      this.spawnObstacleBatch(config);
      this.obstacleTimer = Math.max(0.7, config.obstacleSpawnRate + (Math.random() * 0.4 - 0.2));
    }

    // 3. Enemies
    this.enemyTimer -= delta;
    if (this.enemyTimer <= 0) {
      this.spawnEnemy(config);
      this.enemyTimer = Math.max(1.2, config.enemySpawnRate + (Math.random() * 0.8 - 0.4));
    }

    // 4. Coins
    this.coinTimer -= delta;
    if (this.coinTimer <= 0) {
      this.spawnCoinArc();
      this.coinTimer = 1.4 + Math.random() * 0.8;
    }

    // 5. River crossings
    this.riverTimer -= delta;
    if (this.riverTimer <= 0) {
      this.spawnRiverCrossing();
      this.riverTimer = 18 + Math.random() * 8;
    }
  }

  private spawnObstacleBatch(config: LevelConfig) {
    // Pick 1 or 2 occupied lanes so there's always at least 1 free or jumpable/slideable lane
    const types: ObstacleType[] = ['log', 'rock', 'hole', 'thorny_bush', 'hanging_branch'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    const lane1 = Math.floor(Math.random() * 3) as LaneIndex;
    const canJump = chosenType === 'log' || chosenType === 'hole' || chosenType === 'thorny_bush';
    const canRoll = chosenType === 'hanging_branch' || chosenType === 'thorny_bush';

    this.obstacles.push({
      id: `obs_${Date.now()}_${Math.random()}`,
      kind: 'obstacle',
      obstacleType: chosenType,
      lane: lane1,
      z: 1000,
      canJumpOver: canJump,
      canRollUnder: canRoll,
      width: 48,
      height: 36,
    });

    // In Level 2, occasionally spawn an obstacle in another lane as well
    if (config.levelNumber === 2 && Math.random() < 0.5) {
      const remainingLanes: LaneIndex[] = ([0, 1, 2] as LaneIndex[]).filter((l) => l !== lane1);
      const lane2 = remainingLanes[Math.floor(Math.random() * remainingLanes.length)];
      const type2: ObstacleType = Math.random() < 0.5 ? 'hanging_branch' : 'log';
      const canJump2 = type2 === 'log';
      const canRoll2 = type2 === 'hanging_branch';

      this.obstacles.push({
        id: `obs2_${Date.now()}_${Math.random()}`,
        kind: 'obstacle',
        obstacleType: type2,
        lane: lane2,
        z: 1000,
        canJumpOver: canJump2,
        canRollUnder: canRoll2,
        width: 48,
        height: 36,
      });
    }
  }

  private spawnEnemy(config: LevelConfig) {
    const lane = Math.floor(Math.random() * 3) as LaneIndex;

    if (config.levelNumber === 1) {
      // Level 1: Mostly bouncy cute green slimes
      this.enemies.push({
        id: `enemy_${Date.now()}`,
        kind: 'enemy',
        enemyType: 'slime',
        lane,
        z: 1000,
        animationFrame: 0,
        speedZ: 40,
        jumpable: true,
        variant: 'green',
      });
    } else {
      // Level 2: Forest Monsters or dangerous Purple Slimes appear immediately!
      const isMonster = Math.random() < 0.55;
      if (isMonster) {
        this.enemies.push({
          id: `enemy_${Date.now()}`,
          kind: 'enemy',
          enemyType: 'forest_monster',
          lane,
          z: 1000,
          animationFrame: 0,
          speedZ: 60,
          jumpable: false, // Must switch lanes to dodge!
          variant: 'purple',
        });
      } else {
        this.enemies.push({
          id: `enemy_${Date.now()}`,
          kind: 'enemy',
          enemyType: 'slime',
          lane,
          z: 1000,
          animationFrame: 0,
          speedZ: 50,
          jumpable: true,
          variant: 'purple',
        });
      }
    }
  }

  private spawnCoinArc() {
    const lane = Math.floor(Math.random() * 3) as LaneIndex;
    const count = 4 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const z = 1000 + i * 45;
      this.collectibles.push({
        id: `coin_${Date.now()}_${i}`,
        kind: 'collectible',
        collectibleType: 'coin',
        lane,
        z,
        yOffset: 0,
        collected: false,
        rotationFrame: 0,
        value: 1,
      });
    }

    // Rare chance of extra heart if player is low on health
    if (this.stats.lives < 3 && Math.random() < 0.15) {
      const heartLane = (lane === 1 ? 0 : 1) as LaneIndex;
      this.collectibles.push({
        id: `heart_${Date.now()}`,
        kind: 'collectible',
        collectibleType: 'heart',
        lane: heartLane,
        z: 1080,
        yOffset: 15,
        collected: false,
        rotationFrame: 0,
        value: 1,
      });
    }
  }

  private spawnRiverCrossing() {
    // A wooden bridge crosses the river with 2 planks intact and 1 broken hole
    const brokenLane = Math.floor(Math.random() * 3);
    const bridgeLanes: [boolean, boolean, boolean] = [
      brokenLane !== 0,
      brokenLane !== 1,
      brokenLane !== 2,
    ];

    this.rivers.push({
      id: `river_${Date.now()}`,
      zStart: 1000,
      zEnd: 1120,
      bridgeLanes,
    });
  }

  private spawnSceneryPair(z: number) {
    const types: SceneryDecor['sceneryType'][] = [
      'pine_tree',
      'oak_tree',
      'flower_bush',
      'mushroom_patch',
      'ruins_pillar',
    ];

    const leftType = types[Math.floor(Math.random() * types.length)];
    const rightType = types[Math.floor(Math.random() * types.length)];

    this.sceneries.push({
      id: `scenery_l_${z}_${Math.random()}`,
      side: 'left',
      sceneryType: leftType,
      lane: 0,
      z,
      xOffset: -1.35 - Math.random() * 0.4,
    });

    this.sceneries.push({
      id: `scenery_r_${z}_${Math.random()}`,
      side: 'right',
      sceneryType: rightType,
      lane: 2,
      z,
      xOffset: 1.35 + Math.random() * 0.4,
    });
  }

  // Collisions
  private checkObstacleCollision(obs: ObstacleEntity) {
    if (this.stats.invincibleTimer > 0) return;

    const laneDist = Math.abs(this.currentLaneX - obs.lane);
    if (laneDist > 0.55) return;

    // Can we roll / slide under it? (Turun / Slide)
    if (obs.canRollUnder && this.isRolling && !this.isJumping) {
      // Successfully slid under!
      return;
    }

    // Can we jump over it?
    if (obs.canJumpOver && this.jumpY > 26) {
      // Successfully leaped over!
      return;
    }

    // Impact!
    const obsName = obs.obstacleType === 'hanging_branch' 
      ? 'Dahan Gantung' 
      : (obs.obstacleType === 'thorny_bush' ? 'Semak Berduri' : obs.obstacleType);
    this.takeDamage(`Menabrak ${obsName}!`);
  }

  private checkEnemyCollision(enemy: EnemyEntity, index: number) {
    if (this.stats.invincibleTimer > 0) return;

    const laneDist = Math.abs(this.currentLaneX - enemy.lane);
    if (laneDist > 0.55) return;

    // If slime is jumpable and player is jumping high, bounce on slime!
    if (enemy.jumpable && this.jumpY > 28) {
      audio.playJump();
      this.jumpVy = 400; // bounce off slime!
      this.stats.score += 150;
      this.spawnHitSparks(enemy.lane, 25);
      this.enemies.splice(index, 1);
      return;
    }

    // If slime and player is rolling/sliding (turun), slide tackle the slime!
    if (enemy.enemyType === 'slime' && this.isRolling) {
      audio.playSlide();
      this.stats.score += 200;
      this.spawnHitSparks(enemy.lane, 25, '#22c55e');
      this.enemies.splice(index, 1);
      return;
    }

    // Otherwise damage
    this.takeDamage(`Terkena ${enemy.enemyType === 'forest_monster' ? 'Monster Hutan' : 'Slime'}!`);
  }

  private collectItem(item: CollectibleEntity) {
    item.collected = true;

    if (item.collectibleType === 'coin') {
      audio.playCoin();
      this.stats.coins += 1;
      this.stats.score += 50;
      this.spawnHitSparks(item.lane, 15, '#facc15');
    } else if (item.collectibleType === 'heart') {
      audio.playCoin();
      this.stats.lives = Math.min(this.stats.maxLives, this.stats.lives + 1);
      this.spawnHitSparks(item.lane, 30, '#ef4444');
    }
  }

  private takeDamage(reason: string) {
    if (this.stats.shieldActive) {
      this.stats.shieldActive = false;
      this.stats.invincibleTimer = 1.2;
      audio.playHurt();
      this.screenShake = 12;
      return;
    }

    this.stats.lives -= 1;
    this.stats.invincibleTimer = 1.8;
    this.screenShake = 18;
    audio.playHurt();
    this.spawnHitSparks(Math.round(this.currentLaneX) as LaneIndex, 35, '#ef4444');

    if (this.stats.lives <= 0) {
      audio.playGameOver();
      if (this.onGameOver) this.onGameOver();
    }
  }

  // Particle Generators
  private spawnDustParticles(count = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 60,
        vy: -Math.random() * 40 - 10,
        size: Math.random() * 4 + 2,
        color: '#a16207',
        alpha: 0.8,
        life: 0.35,
        maxLife: 0.35,
      });
    }
  }

  private spawnHitSparks(lane: LaneIndex, count = 20, color = '#fef08a') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 40,
        y: -30 + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 180,
        vy: (Math.random() - 0.5) * 180,
        size: Math.random() * 4 + 3,
        color,
        alpha: 1,
        life: 0.5,
        maxLife: 0.5,
      });
    }
  }

  private spawnCelebrationBurst() {
    const colors = ['#facc15', '#22c55e', '#38bdf8', '#ec4899', '#a855f7'];
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 80,
        y: -60 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 260,
        vy: -Math.random() * 200 - 40,
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0.9,
        maxLife: 0.9,
      });
    }
  }
}
