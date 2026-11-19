export type EnemyKind = 'slime' | 'shell' | 'ghost' | 'hopper' | 'boss';

export interface PlatformDef {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'ground' | 'brick' | 'cloud' | 'qblock' | 'spring';
  hit?: boolean;
  reward?: 'coin' | 'heart';
  moveAmpX?: number;
  moveSpeed?: number;
  baseX?: number;
}

export interface EnemyDef {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  baseY: number;
  w: number;
  h: number;
  vx: number;
  minX: number;
  maxX: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  phase: number;
  vy: number;
}

export interface CoinDef {
  x: number;
  y: number;
  collected: boolean;
  isHeart?: boolean;
}

export interface BiomePalette {
  name: string;
  skyTop: string;
  skyBottom: string;
  hillColor: string;
  groundTop: string;
  groundBody: string;
  brickColor: string;
  brickBorder: string;
  hasStars: boolean;
}

export interface MarioLevel {
  level: number;
  worldWidth: number;
  groundY: number;
  goalX: number;
  biome: BiomePalette;
  platforms: PlatformDef[];
  enemies: EnemyDef[];
  coins: CoinDef[];
}

function createRng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function getBiomeForLevel(level: number): BiomePalette {
  if (level <= 20) {
    return {
      name: 'Pastel Meadow',
      skyTop: '#ffd9ec',
      skyBottom: '#fff5fa',
      hillColor: '#ffb8dc',
      groundTop: '#ff69b4',
      groundBody: '#e89ec0',
      brickColor: '#ff94c8',
      brickBorder: '#b5286e',
      hasStars: false,
    };
  }
  if (level <= 40) {
    return {
      name: 'Candy Twilight',
      skyTop: '#d7b8ff',
      skyBottom: '#ffe6f7',
      hillColor: '#c39cf5',
      groundTop: '#b45ce6',
      groundBody: '#9c78c4',
      brickColor: '#cf9bff',
      brickBorder: '#6930a3',
      hasStars: true,
    };
  }
  if (level <= 60) {
    return {
      name: 'Peach Cloud Sky',
      skyTop: '#ffbfa8',
      skyBottom: '#fff0d6',
      hillColor: '#ffa896',
      groundTop: '#ff7b7b',
      groundBody: '#e0897b',
      brickColor: '#ffb59e',
      brickBorder: '#b8423e',
      hasStars: false,
    };
  }
  if (level <= 80) {
    return {
      name: 'Berry Starlight',
      skyTop: '#3e2759',
      skyBottom: '#9e4784',
      hillColor: '#593373',
      groundTop: '#ff5ea8',
      groundBody: '#75386e',
      brickColor: '#e879b4',
      brickBorder: '#3b153d',
      hasStars: true,
    };
  }
  return {
    name: 'Royal Bestie Castle',
    skyTop: '#24143b',
    skyBottom: '#78265e',
    hillColor: '#3d1d54',
    groundTop: '#ffcf48',
    groundBody: '#5b3066',
    brickColor: '#c769a7',
    brickBorder: '#3b1235',
    hasStars: true,
  };
}

export function buildMarioLevel(levelInput: number): MarioLevel {
  const level = Math.max(1, Math.min(100, Math.floor(levelInput)));
  const rng = createRng(level * 137 + 19);
  const groundY = 236;
  const biome = getBiomeForLevel(level);

  const segments = Math.min(14, 6 + Math.floor(level / 10));
  const worldWidth = 1450 + segments * 165;
  const goalX = worldWidth - 130;

  const platforms: PlatformDef[] = [];
  const enemies: EnemyDef[] = [];
  const coins: CoinDef[] = [];

  // Starting safe ground
  platforms.push({
    x: 0,
    y: groundY,
    w: 320,
    h: 50,
    kind: 'ground',
  });

  let cursorX = 320;
  let enemyId = 1;
  const speedScale = 1 + Math.min(1.8, (level - 1) * 0.018);

  const pickEnemyKind = (): EnemyKind => {
    const roll = rng();
    if (level === 1) return 'slime';
    if (level < 3) return roll < 0.75 ? 'slime' : 'shell';
    if (level < 6) {
      if (roll < 0.5) return 'slime';
      return 'shell';
    }
    if (level < 12) {
      if (roll < 0.38) return 'slime';
      if (roll < 0.72) return 'shell';
      return 'ghost';
    }
    if (roll < 0.3) return 'slime';
    if (roll < 0.58) return 'shell';
    if (roll < 0.8) return 'ghost';
    return 'hopper';
  };

  while (cursorX < goalX - 240) {
    const gapChance = Math.min(0.62, 0.22 + level * 0.005);
    const makeGap = cursorX > 360 && rng() < gapChance;

    if (makeGap) {
      const gapW = Math.round(58 + rng() * Math.min(55, 22 + level * 0.4));
      // Add floating bridge / cloud above wider gaps on harder levels
      if (gapW > 78 || rng() < 0.55) {
        const platY = groundY - Math.round(52 + rng() * 34);
        const platW = Math.round(68 + rng() * 42);
        const isMoving = level >= 15 && rng() < 0.35;
        const px = cursorX + Math.round((gapW - platW) / 2);
        platforms.push({
          x: px,
          y: platY,
          w: platW,
          h: 16,
          kind: 'cloud',
          baseX: px,
          moveAmpX: isMoving ? 24 : 0,
          moveSpeed: isMoving ? 0.03 + rng() * 0.02 : 0,
        });
        coins.push({ x: px + platW / 2 - 8, y: platY - 26, collected: false });
      }
      cursorX += gapW;
    }

    const segW = Math.round(210 + rng() * 160);
    const clampedW = Math.min(segW, goalX - 140 - cursorX);
    if (clampedW < 120) break;

    platforms.push({
      x: cursorX,
      y: groundY,
      w: clampedW,
      h: 50,
      kind: 'ground',
    });

    // Place elevated bricks & ? mystery blocks
    if (rng() < 0.85) {
      const blockY = groundY - Math.round(66 + rng() * 24);
      const count = 2 + Math.floor(rng() * 3);
      const startBX = cursorX + 36;
      for (let i = 0; i < count; i++) {
        const bx = startBX + i * 28;
        if (bx + 26 > cursorX + clampedW - 20) break;
        const isQ = i === Math.floor(count / 2) || rng() < 0.35;
        platforms.push({
          x: bx,
          y: blockY,
          w: 26,
          h: 24,
          kind: isQ ? 'qblock' : 'brick',
          hit: false,
          reward: isQ && rng() < 0.25 ? 'heart' : 'coin',
        });
        coins.push({ x: bx + 5, y: blockY - 24, collected: false });
      }
    }

    // Optional spring pad for bonus height
    if (level >= 4 && rng() < 0.22 && clampedW > 180) {
      platforms.push({
        x: cursorX + clampedW - 44,
        y: groundY - 12,
        w: 24,
        h: 12,
        kind: 'spring',
      });
      coins.push({ x: cursorX + clampedW - 40, y: groundY - 82, collected: false });
      coins.push({ x: cursorX + clampedW - 40, y: groundY - 112, collected: false });
    }

    // Spawn 1–2 enemies on this ground segment
    const enemyCount = level >= 25 && clampedW > 260 && rng() < 0.55 ? 2 : 1;
    for (let e = 0; e < enemyCount; e++) {
      const kind = pickEnemyKind();
      const pad = 22;
      const span = Math.max(40, clampedW - pad * 2 - 28);
      const ex = cursorX + pad + (e === 0 ? rng() * (span * 0.45) : span * 0.55 + rng() * (span * 0.35));
      const baseSpeed =
        kind === 'shell' ? 1.45 : kind === 'ghost' ? 1.15 : kind === 'hopper' ? 1.2 : 0.95;
      const vx = (rng() < 0.5 ? -1 : 1) * baseSpeed * speedScale;
      const ey = kind === 'ghost' ? groundY - 58 : groundY - 26;

      enemies.push({
        id: enemyId++,
        kind,
        x: ex,
        y: ey,
        baseY: ey,
        w: 26,
        h: 26,
        vx,
        minX: cursorX + 8,
        maxX: cursorX + clampedW - 34,
        hp: kind === 'shell' && level >= 15 ? 2 : 1,
        maxHp: kind === 'shell' && level >= 15 ? 2 : 1,
        alive: true,
        phase: rng() * Math.PI * 2,
        vy: 0,
      });
    }

    cursorX += clampedW;
  }

  // Final castle plaza ground
  platforms.push({
    x: cursorX,
    y: groundY,
    w: worldWidth - cursorX + 120,
    h: 50,
    kind: 'ground',
  });

  // Mini-Boss every 10 levels (10, 20, ..., 100)!
  if (level % 10 === 0) {
    const bossHp = Math.min(5, 2 + Math.floor(level / 25));
    enemies.push({
      id: enemyId++,
      kind: 'boss',
      x: goalX - 150,
      y: groundY - 40,
      baseY: groundY - 40,
      w: 40,
      h: 40,
      vx: -1.35 * speedScale,
      minX: Math.max(cursorX + 12, goalX - 240),
      maxX: goalX - 65,
      hp: bossHp,
      maxHp: bossHp,
      alive: true,
      phase: 0,
      vy: 0,
    });
  }

  return {
    level,
    worldWidth,
    groundY,
    goalX,
    biome,
    platforms,
    enemies,
    coins,
  };
}
