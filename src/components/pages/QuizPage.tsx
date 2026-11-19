import { useCallback, useEffect, useRef, useState } from 'react';
import {
  areGirlSpritesReady,
  drawGirlPose,
  ensureGirlSpritesLoaded,
  type GirlPose,
} from '../../pixel/girlSprites';
import {
  buildMarioLevel,
  type EnemyDef,
  type MarioLevel,
} from '../../pixel/marioLevels';
import { sfxOops, sfxPop, sfxSparkle } from '../../pixel/sfx';
import { drawSprite, ICO_HEART, ICO_STAR } from '../../pixel/sprites';
import {
  CanvasFrame,
  MsgBox,
  PixelCanvas,
  PxButton,
  RibbonTitle,
  Subtitle,
} from '../PixelUi';

interface Projectile {
  x: number;
  y: number;
  vx: number;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface FloatingPopup {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

type GameStatus = 'playing' | 'won' | 'lost';

const CANVAS_W = 520;
const CANVAS_H = 280;
const MAX_HEARTS = 3;
const PLAYER_DRAW_H = 56;
const PLAYER_HIT_W = 24;
const PLAYER_HIT_H = 46;

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: EnemyDef, screenX: number, tick: number) {
  const x = Math.round(screenX);
  const y = Math.round(enemy.y);
  const w = enemy.w;
  const h = enemy.h;
  const step = Math.floor(tick / 10) % 2;

  ctx.save();
  if (enemy.kind === 'slime') {
    // Grumpy Mushroom/Slime (Goomba-style)
    const squash = step ? 2 : 0;
    ctx.fillStyle = '#5c2240';
    ctx.fillRect(x + 2, y + 4 + squash, w - 4, h - 6 - squash);
    ctx.fillStyle = '#d9488f';
    ctx.fillRect(x + 4, y + 2 + squash, w - 8, h - 8 - squash);
    ctx.fillStyle = '#ffc2e0';
    ctx.fillRect(x + 6, y + 5 + squash, 5, 4);
    ctx.fillRect(x + w - 12, y + 6 + squash, 4, 3);
    // Angry eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 5, y + 11 + squash, 6, 5);
    ctx.fillRect(x + w - 11, y + 11 + squash, 6, 5);
    ctx.fillStyle = '#1f0b15';
    ctx.fillRect(x + 7, y + 13 + squash, 3, 3);
    ctx.fillRect(x + w - 10, y + 13 + squash, 3, 3);
    // Angry brows
    ctx.fillRect(x + 4, y + 9 + squash, 7, 2);
    ctx.fillRect(x + w - 11, y + 9 + squash, 7, 2);
    // Feet
    ctx.fillStyle = '#3b1529';
    ctx.fillRect(x + 3 + (step ? 2 : 0), y + h - 4, 7, 4);
    ctx.fillRect(x + w - 10 - (step ? 2 : 0), y + h - 4, 7, 4);
  } else if (enemy.kind === 'shell') {
    // Spiky Shell Turtle (Koopa-style)
    ctx.fillStyle = '#1e5b70';
    ctx.fillRect(x + 2, y + 6, w - 4, h - 10);
    ctx.fillStyle = '#3dc2d9';
    ctx.fillRect(x + 4, y + 8, w - 8, h - 14);
    // Shell spikes
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 7, y + 2, 4, 4);
    ctx.fillRect(x + w - 11, y + 2, 4, 4);
    // Head facing vx direction
    const faceRight = enemy.vx >= 0;
    const hx = faceRight ? x + w - 8 : x - 2;
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(hx, y + 10, 10, 10);
    ctx.fillStyle = '#1f0b15';
    ctx.fillRect(faceRight ? hx + 6 : hx + 1, y + 12, 3, 3);
    // Feet
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(x + 4 + (step ? 2 : 0), y + h - 4, 6, 4);
    ctx.fillRect(x + w - 10 - (step ? 2 : 0), y + h - 4, 6, 4);
  } else if (enemy.kind === 'ghost') {
    // Floating Boo Ghost
    ctx.fillStyle = '#6f42c1';
    ctx.fillRect(x + 3, y + 2, w - 6, h - 4);
    ctx.fillStyle = '#f3e8ff';
    ctx.fillRect(x + 5, y + 4, w - 10, h - 8);
    // Wavy tail
    ctx.fillRect(x + 5 + (step ? 2 : 0), y + h - 5, 5, 5);
    ctx.fillRect(x + w - 11 - (step ? 2 : 0), y + h - 5, 5, 5);
    // Cheeky face
    ctx.fillStyle = '#2d124d';
    ctx.fillRect(x + 7, y + 10, 3, 4);
    ctx.fillRect(x + w - 10, y + 10, 3, 4);
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(x + 10, y + 16, 6, 4);
  } else if (enemy.kind === 'hopper') {
    // Spring Hopper Enemy
    ctx.fillStyle = '#b84b00';
    ctx.fillRect(x + 2, y + 4, w - 4, h - 8);
    ctx.fillStyle = '#ff922b';
    ctx.fillRect(x + 4, y + 6, w - 8, h - 12);
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(x + 6, y + 6, w - 12, 4);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 11, 5, 5);
    ctx.fillRect(x + w - 11, y + 11, 5, 5);
    ctx.fillStyle = '#1f0b15';
    ctx.fillRect(x + 8, y + 13, 2, 3);
    ctx.fillRect(x + w - 10, y + 13, 2, 3);
    // Spring coils
    ctx.fillStyle = '#dee2e6';
    ctx.fillRect(x + 7, y + h - 4, w - 14, 4);
  } else {
    // Crowned Boss Enemy (Levels 10, 20, ..., 100)
    ctx.fillStyle = '#4a0e2e';
    ctx.fillRect(x + 2, y + 10, w - 4, h - 14);
    ctx.fillStyle = '#c9184a';
    ctx.fillRect(x + 5, y + 12, w - 10, h - 18);
    // Gold Crown
    ctx.fillStyle = '#ffd43b';
    ctx.fillRect(x + 8, y, w - 16, 10);
    ctx.fillRect(x + 8, y - 4, 5, 5);
    ctx.fillRect(x + w / 2 - 2, y - 5, 5, 6);
    ctx.fillRect(x + w - 13, y - 4, 5, 5);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 9, y + 19, 8, 6);
    ctx.fillRect(x + w - 17, y + 19, 8, 6);
    ctx.fillStyle = '#1a050f';
    ctx.fillRect(x + 12, y + 21, 4, 4);
    ctx.fillRect(x + w - 15, y + 21, 4, 4);
    // Feet
    ctx.fillStyle = '#2d0619';
    ctx.fillRect(x + 6 + (step ? 3 : 0), y + h - 5, 10, 5);
    ctx.fillRect(x + w - 16 - (step ? 3 : 0), y + h - 5, 10, 5);
  }

  // Multi-HP bar above shell/boss enemies
  if (enemy.maxHp > 1) {
    const barW = Math.max(22, w - 4);
    const bx = x + (w - barW) / 2;
    const by = y - 10;
    ctx.fillStyle = '#2d1510';
    ctx.fillRect(bx - 1, by - 1, barW + 2, 6);
    ctx.fillStyle = '#ffccd5';
    ctx.fillRect(bx, by, barW, 4);
    ctx.fillStyle = '#ff2a7a';
    ctx.fillRect(bx, by, Math.round((enemy.hp / enemy.maxHp) * barW), 4);
  }
  ctx.restore();
}

export function QuizPage() {
  const [levelNum, setLevelNum] = useState(1);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [coins, setCoins] = useState(0);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [biomeName, setBiomeName] = useState('Pastel Meadow');
  const [message, setMessage] = useState(
    'Jump on enemies or shoot Heart Beams! Reach the Castle Flag! 💖'
  );
  const [, setSpritesReady] = useState(() => areGirlSpritesReady());

  const levelRef = useRef<MarioLevel>(buildMarioLevel(1));
  const statusRef = useRef<GameStatus>('playing');
  const heartsRef = useRef(MAX_HEARTS);
  const coinsRef = useRef(0);

  // Player physics state
  const playerRef = useRef({
    x: 64,
    y: 236,
    vx: 0,
    vy: 0,
    facingLeft: false,
    onGround: true,
    coyote: 0,
    walkDist: 0,
    hurtTimer: 0,
    invulnTimer: 0,
    shootTimer: 0,
    shootCooldown: 0,
    safeX: 64,
    safeY: 236,
  });

  const inputRef = useRef({
    left: false,
    right: false,
    jumpPressed: false,
    jumpHeld: false,
    runHeld: false,
  });

  const cameraXRef = useRef(0);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const popupsRef = useRef<FloatingPopup[]>([]);

  useEffect(() => {
    ensureGirlSpritesLoaded(() => {
      setSpritesReady(true);
    });
  }, []);

  const startLevel = useCallback((targetLevel: number, keepCoins = false) => {
    const clamped = Math.max(1, Math.min(100, targetLevel));
    const built = buildMarioLevel(clamped);
    levelRef.current = built;
    statusRef.current = 'playing';
    heartsRef.current = MAX_HEARTS;
    if (!keepCoins) {
      coinsRef.current = 0;
      setCoins(0);
    }

    playerRef.current = {
      x: 64,
      y: built.groundY,
      vx: 0,
      vy: 0,
      facingLeft: false,
      onGround: true,
      coyote: 0,
      walkDist: 0,
      hurtTimer: 0,
      invulnTimer: 0,
      shootTimer: 0,
      shootCooldown: 0,
      safeX: 64,
      safeY: built.groundY,
    };

    cameraXRef.current = 0;
    projectilesRef.current = [];
    particlesRef.current = [];
    popupsRef.current = [];

    setLevelNum(clamped);
    setHearts(MAX_HEARTS);
    setStatus('playing');
    setBiomeName(built.biome.name);
    setMessage(
      clamped % 10 === 0
        ? `Boss Stage ${clamped}/100! Defeat the Crowned Meanie & reach the Flag! 👑`
        : `Level ${clamped}/100 · ${built.biome.name} — Jump, stomp & collect stars! ✨`
    );
  }, []);

  const triggerJump = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    inputRef.current.jumpPressed = true;
    inputRef.current.jumpHeld = true;
  }, []);

  const releaseJump = useCallback(() => {
    inputRef.current.jumpHeld = false;
  }, []);

  const triggerShoot = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const p = playerRef.current;
    if (p.shootCooldown > 0) return;

    p.shootTimer = 14;
    p.shootCooldown = 18;
    const dir = p.facingLeft ? -1 : 1;
    projectilesRef.current.push({
      x: p.x + dir * 18,
      y: p.y - 26,
      vx: dir * 6.5,
      life: 62,
    });
    sfxPop();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.right = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        if (!e.repeat) triggerJump();
      } else if (e.key === 'Shift') {
        inputRef.current.runHeld = true;
      } else if (e.key === 'x' || e.key === 'X' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (!e.repeat) triggerShoot();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        releaseJump();
      } else if (e.key === 'Shift') {
        inputRef.current.runHeld = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [releaseJump, triggerJump, triggerShoot]);

  const spawnBurst = (x: number, y: number, color: string, count = 8) => {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = 1.2 + Math.random() * 2.4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1.2,
        life: 22 + Math.floor(Math.random() * 10),
        color,
        size: 4,
      });
    }
  };

  const applyDamage = (p: typeof playerRef.current, reason: string) => {
    if (p.invulnTimer > 0 || statusRef.current !== 'playing') return;
    const nextHearts = Math.max(0, heartsRef.current - 1);
    heartsRef.current = nextHearts;
    setHearts(nextHearts);
    p.hurtTimer = 26;
    p.invulnTimer = 80;
    sfxOops();
    spawnBurst(p.x, p.y - 24, '#ff4d6d', 10);

    if (nextHearts <= 0) {
      statusRef.current = 'lost';
      setStatus('lost');
      setMessage('Oh no, out of hearts! Hit Retry Level to try again with 3 hearts! 💔');
    } else {
      setMessage(`${reason} ${nextHearts} heart${nextHearts === 1 ? '' : 's'} left! 💖`);
    }
  };

  const renderGame = useCallback((ctx: CanvasRenderingContext2D, tick: number) => {
    const lvl = levelRef.current;
    const p = playerRef.current;
    const inp = inputRef.current;

    // 1. UPDATE MOVING PLATFORMS
    for (const plat of lvl.platforms) {
      if (plat.moveAmpX && plat.baseX !== undefined && plat.moveSpeed) {
        plat.x = plat.baseX + Math.sin(tick * plat.moveSpeed) * plat.moveAmpX;
      }
    }

    // 2. UPDATE PLAYER PHYSICS (when playing)
    if (statusRef.current === 'playing') {
      if (p.hurtTimer > 0) p.hurtTimer -= 1;
      if (p.invulnTimer > 0) p.invulnTimer -= 1;
      if (p.shootTimer > 0) p.shootTimer -= 1;
      if (p.shootCooldown > 0) p.shootCooldown -= 1;

      const moveDir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      const maxSpeed = inp.runHeld ? 4.3 : 3.2;
      const accel = p.onGround ? 0.48 : 0.34;

      if (moveDir !== 0) {
        p.vx += moveDir * accel;
        if (Math.abs(p.vx) > maxSpeed) p.vx = moveDir * maxSpeed;
        p.facingLeft = moveDir < 0;
        if (p.onGround && Math.abs(p.vx) > 2.6 && tick % 6 === 0) {
          particlesRef.current.push({
            x: p.x - moveDir * 10,
            y: p.y - 3,
            vx: -moveDir * 0.8,
            vy: -0.4,
            life: 12,
            color: '#fff',
            size: 4,
          });
        }
      } else {
        p.vx *= p.onGround ? 0.76 : 0.92;
        if (Math.abs(p.vx) < 0.08) p.vx = 0;
      }

      if (p.onGround) {
        p.coyote = 7;
      } else if (p.coyote > 0) {
        p.coyote -= 1;
      }

      if (inp.jumpPressed) {
        inp.jumpPressed = false;
        if (p.coyote > 0) {
          p.vy = -8.7;
          p.onGround = false;
          p.coyote = 0;
          sfxPop();
        }
      }

      // Variable jump height when button released early
      if (!inp.jumpHeld && p.vy < -3.2) {
        p.vy *= 0.84;
      }

      // Gravity
      p.vy = Math.min(9.5, p.vy + 0.42);

      // Horizontal step & solid block collisions
      p.x += p.vx;
      p.x = Math.max(16, Math.min(lvl.worldWidth - 20, p.x));
      if (p.onGround) {
        p.walkDist += Math.abs(p.vx);
      }

      for (const plat of lvl.platforms) {
        if (plat.kind !== 'brick' && plat.kind !== 'qblock') continue;
        const pLeft = p.x - PLAYER_HIT_W / 2;
        const pRight = p.x + PLAYER_HIT_W / 2;
        const pTop = p.y - PLAYER_HIT_H;
        const pBot = p.y;
        if (pRight > plat.x && pLeft < plat.x + plat.w && pBot > plat.y + 4 && pTop < plat.y + plat.h - 2) {
          if (p.vx > 0) p.x = plat.x - PLAYER_HIT_W / 2;
          else if (p.vx < 0) p.x = plat.x + plat.w + PLAYER_HIT_W / 2;
          p.vx = 0;
        }
      }

      // Vertical step & landing / head-bonk
      const prevY = p.y;
      p.y += p.vy;
      p.onGround = false;

      for (const plat of lvl.platforms) {
        const pLeft = p.x - PLAYER_HIT_W / 2 + 2;
        const pRight = p.x + PLAYER_HIT_W / 2 - 2;
        if (pRight <= plat.x || pLeft >= plat.x + plat.w) continue;

        // Landing on top
        if (p.vy >= 0 && prevY <= plat.y + 6 && p.y >= plat.y) {
          p.y = plat.y;
          if (plat.kind === 'spring') {
            p.vy = -11.8;
            p.onGround = false;
            sfxSparkle();
            spawnBurst(plat.x + plat.w / 2, plat.y, '#ffe066', 6);
          } else {
            p.vy = 0;
            p.onGround = true;
            if (plat.kind === 'ground') {
              p.safeX = Math.max(plat.x + 24, Math.min(plat.x + plat.w - 24, p.x));
              p.safeY = plat.y;
            }
          }
        }
        // Bonking underside of brick or ? block
        else if (
          (plat.kind === 'brick' || plat.kind === 'qblock') &&
          p.vy < 0 &&
          prevY - PLAYER_HIT_H >= plat.y + plat.h - 6 &&
          p.y - PLAYER_HIT_H <= plat.y + plat.h
        ) {
          p.y = plat.y + plat.h + PLAYER_HIT_H;
          p.vy = 1.5;
          if (plat.kind === 'qblock' && !plat.hit) {
            plat.hit = true;
            if (plat.reward === 'heart' && heartsRef.current < MAX_HEARTS) {
              const nh = Math.min(MAX_HEARTS, heartsRef.current + 1);
              heartsRef.current = nh;
              setHearts(nh);
              popupsRef.current.push({
                x: plat.x + 6,
                y: plat.y - 12,
                text: '+1 ♥',
                life: 36,
                color: '#ff2a7a',
              });
            } else {
              coinsRef.current += 5;
              setCoins(coinsRef.current);
              popupsRef.current.push({
                x: plat.x + 4,
                y: plat.y - 12,
                text: '+5 ★',
                life: 32,
                color: '#f2ad00',
              });
            }
            sfxSparkle();
            spawnBurst(plat.x + plat.w / 2, plat.y, '#ffe066', 8);
          } else {
            sfxPop();
          }
        }
      }

      // Pit fall check
      if (p.y > CANVAS_H + 45) {
        applyDamage(p, 'Oops, slipped into a gap!');
        if (statusRef.current === 'playing') {
          p.x = p.safeX;
          p.y = p.safeY - 12;
          p.vx = 0;
          p.vy = 0;
        }
      }

      // Collect floating stars/coins
      for (const c of lvl.coins) {
        if (c.collected) continue;
        if (Math.abs(p.x - (c.x + 8)) < 22 && Math.abs(p.y - 24 - (c.y + 8)) < 26) {
          c.collected = true;
          coinsRef.current += 1;
          setCoins(coinsRef.current);
          sfxSparkle();
          spawnBurst(c.x + 8, c.y + 8, '#ffe066', 5);
        }
      }

      // Update projectiles & check enemy hits
      const projs = projectilesRef.current;
      for (let i = projs.length - 1; i >= 0; i--) {
        const pr = projs[i];
        pr.x += pr.vx;
        pr.life -= 1;
        let remove = pr.life <= 0;

        for (const en of lvl.enemies) {
          if (!en.alive) continue;
          if (
            pr.x > en.x - 6 &&
            pr.x < en.x + en.w + 6 &&
            pr.y > en.y - 6 &&
            pr.y < en.y + en.h + 6
          ) {
            en.hp -= 1;
            remove = true;
            spawnBurst(pr.x, pr.y, '#ff69b4', 8);
            if (en.hp <= 0) {
              en.alive = false;
              coinsRef.current += en.kind === 'boss' ? 20 : 2;
              setCoins(coinsRef.current);
              popupsRef.current.push({
                x: en.x,
                y: en.y - 8,
                text: en.kind === 'boss' ? 'BOSS KO! +20' : '+2 ★',
                life: 32,
                color: '#ff2a7a',
              });
              sfxSparkle();
            } else {
              sfxPop();
            }
            break;
          }
        }
        if (remove) projs.splice(i, 1);
      }

      // Update enemies & player-enemy collisions
      for (const en of lvl.enemies) {
        if (!en.alive) continue;
        en.x += en.vx;
        if (en.x <= en.minX) {
          en.x = en.minX;
          en.vx = Math.abs(en.vx);
        } else if (en.x >= en.maxX) {
          en.x = en.maxX;
          en.vx = -Math.abs(en.vx);
        }

        if (en.kind === 'ghost') {
          en.y = en.baseY + Math.sin(tick * 0.06 + en.phase) * 20;
        } else if (en.kind === 'hopper' || en.kind === 'boss') {
          const hopInterval = en.kind === 'boss' ? 85 : 70;
          if ((tick + Math.floor(en.phase * 10)) % hopInterval === 0 && en.y >= en.baseY - 1) {
            en.vy = en.kind === 'boss' ? -6.8 : -6.2;
          }
          en.vy += 0.36;
          en.y += en.vy;
          if (en.y > en.baseY) {
            en.y = en.baseY;
            en.vy = 0;
          }
        }

        // Collision box with player
        const pLeft = p.x - PLAYER_HIT_W / 2 + 2;
        const pRight = p.x + PLAYER_HIT_W / 2 - 2;
        const pTop = p.y - PLAYER_HIT_H + 6;
        const pBot = p.y;

        if (pRight > en.x + 2 && pLeft < en.x + en.w - 2 && pBot > en.y + 2 && pTop < en.y + en.h) {
          // Stomp check: falling and feet near top half of enemy
          if (p.vy > 0 && prevY <= en.y + en.h * 0.55) {
            en.hp -= 1;
            p.vy = -7.6;
            p.onGround = false;
            spawnBurst(en.x + en.w / 2, en.y + 6, '#ffe066', 9);
            if (en.hp <= 0) {
              en.alive = false;
              coinsRef.current += en.kind === 'boss' ? 20 : 2;
              setCoins(coinsRef.current);
              popupsRef.current.push({
                x: en.x,
                y: en.y - 10,
                text: en.kind === 'boss' ? 'BOSS DEFEATED!' : 'SQUISH!',
                life: 30,
                color: '#ff4da6',
              });
              sfxSparkle();
            } else {
              sfxPop();
            }
          } else if (p.invulnTimer === 0) {
            p.vy = -5.2;
            p.vx = p.x < en.x + en.w / 2 ? -3.4 : 3.4;
            applyDamage(p, 'Ouch, bumped an enemy!');
          }
        }
      }

      // Check Castle Flagpole Victory!
      if (p.x >= lvl.goalX - 10) {
        statusRef.current = 'won';
        setStatus('won');
        p.vx = 0;
        sfxSparkle();
        spawnBurst(lvl.goalX, lvl.groundY - 90, '#ffe066', 16);
        spawnBurst(lvl.goalX, lvl.groundY - 60, '#ff69b4', 14);
        setMessage(
          lvl.level === 100
            ? '🏆 YOU CONQUERED ALL 100 LEVELS!! Bestie Super Princess Champion!! 💖👑'
            : `🎉 Level ${lvl.level} Clear! Ready for Level ${lvl.level + 1}?`
        );
      }
    }

    // Smooth camera tracking
    const targetCam = Math.max(0, Math.min(lvl.worldWidth - CANVAS_W, p.x - CANVAS_W * 0.36));
    cameraXRef.current += (targetCam - cameraXRef.current) * 0.16;
    const camX = Math.round(cameraXRef.current);

    // 3. RENDER WORLD
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, lvl.biome.skyTop);
    grad.addColorStop(1, lvl.biome.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Background twinkling stars on night/twilight worlds
    if (lvl.biome.hasStars) {
      for (let i = 0; i < 24; i++) {
        const sx = ((i * 97 - Math.floor(camX * 0.2)) % CANVAS_W + CANVAS_W) % CANVAS_W;
        const sy = 16 + ((i * 53) % 130);
        ctx.fillStyle = (tick + i * 7) % 40 < 20 ? '#fff' : '#ffe066';
        ctx.fillRect(sx, sy, 2, 2);
      }
    }

    // Parallax fluffy clouds
    for (let i = 0; i < 6; i++) {
      const cx = ((i * 150 - Math.floor(camX * 0.25)) % (CANVAS_W + 120) + (CANVAS_W + 120)) % (CANVAS_W + 120) - 60;
      const cy = 28 + (i % 3) * 26;
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillRect(cx, cy, 48, 14);
      ctx.fillRect(cx + 10, cy - 8, 28, 10);
    }

    // Parallax hills
    for (let i = 0; i < 8; i++) {
      const hx = ((i * 180 - Math.floor(camX * 0.45)) % (CANVAS_W + 220) + (CANVAS_W + 220)) % (CANVAS_W + 220) - 110;
      ctx.fillStyle = lvl.biome.hillColor;
      ctx.beginPath();
      ctx.arc(hx + 60, lvl.groundY + 12, 74, Math.PI, 0);
      ctx.fill();
    }

    // Platforms & Blocks
    for (const plat of lvl.platforms) {
      const sx = Math.round(plat.x - camX);
      if (sx + plat.w < -20 || sx > CANVAS_W + 20) continue;

      if (plat.kind === 'ground') {
        ctx.fillStyle = lvl.biome.groundBody;
        ctx.fillRect(sx, plat.y, plat.w, plat.h);
        ctx.fillStyle = lvl.biome.groundTop;
        ctx.fillRect(sx, plat.y, plat.w, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let bx = sx + 8; bx < sx + plat.w - 10; bx += 28) {
          ctx.fillRect(bx, plat.y + 14, 14, 4);
        }
      } else if (plat.kind === 'cloud') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, plat.y, plat.w, plat.h);
        ctx.fillStyle = '#ffd1e8';
        ctx.fillRect(sx + 2, plat.y + plat.h - 4, plat.w - 4, 4);
      } else if (plat.kind === 'spring') {
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(sx, plat.y, plat.w, 5);
        ctx.fillStyle = '#ff4da6';
        ctx.fillRect(sx + 4, plat.y + 5, plat.w - 8, 7);
      } else if (plat.kind === 'brick') {
        ctx.fillStyle = lvl.biome.brickBorder;
        ctx.fillRect(sx, plat.y, plat.w, plat.h);
        ctx.fillStyle = lvl.biome.brickColor;
        ctx.fillRect(sx + 2, plat.y + 2, plat.w - 4, plat.h - 4);
        ctx.fillStyle = lvl.biome.brickBorder;
        ctx.fillRect(sx + 2, plat.y + 11, plat.w - 4, 2);
        ctx.fillRect(sx + 12, plat.y + 2, 2, 10);
      } else if (plat.kind === 'qblock') {
        ctx.fillStyle = '#8a4e00';
        ctx.fillRect(sx, plat.y, plat.w, plat.h);
        ctx.fillStyle = plat.hit ? '#d8b4a0' : '#ffd43b';
        ctx.fillRect(sx + 2, plat.y + 2, plat.w - 4, plat.h - 4);
        if (!plat.hit) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px monospace';
          ctx.fillText('?', sx + 9, plat.y + 17);
        }
      }
    }

    // Collectible Stars
    for (const c of lvl.coins) {
      if (c.collected) continue;
      const sx = c.x - camX;
      if (sx < -24 || sx > CANVAS_W + 24) continue;
      const bob = Math.sin(tick * 0.1 + c.x * 0.05) * 3;
      drawSprite(ctx, ICO_STAR, sx, c.y + bob, 1.3);
    }

    // Castle Goal Flagpole
    const gx = Math.round(lvl.goalX - camX);
    if (gx > -80 && gx < CANVAS_W + 140) {
      // Mini castle behind flag
      ctx.fillStyle = '#e06ca7';
      ctx.fillRect(gx + 34, lvl.groundY - 62, 58, 62);
      ctx.fillStyle = '#ffc2e0';
      ctx.fillRect(gx + 40, lvl.groundY - 56, 46, 56);
      // Battlements
      ctx.fillStyle = '#d63384';
      ctx.fillRect(gx + 34, lvl.groundY - 70, 12, 10);
      ctx.fillRect(gx + 57, lvl.groundY - 70, 12, 10);
      ctx.fillRect(gx + 80, lvl.groundY - 70, 12, 10);
      // Door
      ctx.fillStyle = '#5c2240';
      ctx.fillRect(gx + 55, lvl.groundY - 30, 16, 30);

      // Flagpole
      ctx.fillStyle = '#fff';
      ctx.fillRect(gx, lvl.groundY - 118, 4, 118);
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(gx - 3, lvl.groundY - 124, 10, 8);
      // Waving pink flag
      const flagY = statusRef.current === 'won' ? lvl.groundY - 110 : lvl.groundY - 102 + Math.sin(tick * 0.1) * 3;
      ctx.fillStyle = '#ff2a7a';
      ctx.fillRect(gx + 4, flagY, 26, 18);
      drawSprite(ctx, ICO_HEART, gx + 10, flagY + 3, 1);
    }

    // Enemies
    for (const en of lvl.enemies) {
      if (!en.alive) continue;
      const sx = en.x - camX;
      if (sx + en.w < -20 || sx > CANVAS_W + 20) continue;
      drawEnemy(ctx, en, sx, tick);
    }

    // Heart Beam Projectiles
    for (const pr of projectilesRef.current) {
      drawSprite(ctx, ICO_HEART, pr.x - camX - 8, pr.y - 8, 1.3);
    }

    // Real 2D Girl Character (from user's sprite sheets!)
    const screenPX = p.x - camX;
    const blinkHide = p.invulnTimer > 0 && Math.floor(p.invulnTimer / 4) % 2 === 0;
    if (!blinkHide) {
      let pose: GirlPose = 'idle';
      if (statusRef.current === 'won') {
        pose = Math.floor(tick / 18) % 2 === 0 ? 'win' : 'cheer';
      } else if (statusRef.current === 'lost' || p.hurtTimer > 0) {
        pose = 'hurt';
      } else if (p.shootTimer > 0) {
        pose = 'shoot';
      } else if (!p.onGround) {
        pose = 'jump';
      } else if (Math.abs(p.vx) >= 2.6) {
        pose = Math.floor(p.walkDist / 22) % 2 === 0 ? 'run1' : 'run2';
      } else if (Math.abs(p.vx) > 0.2) {
        const frame = Math.floor(p.walkDist / 16) % 3;
        pose = frame === 0 ? 'walk1' : frame === 1 ? 'walk2' : 'walk3';
      } else {
        pose = Math.floor(tick / 35) % 2 === 0 ? 'idle' : 'idle2';
      }

      if (areGirlSpritesReady()) {
        drawGirlPose(ctx, pose, screenPX, p.y, PLAYER_DRAW_H, p.facingLeft);
      } else {
        // Lightweight placeholder only during initial image decode
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(screenPX - 12, p.y - 40, 24, 40);
      }
    }

    // Particles
    const parts = particlesRef.current;
    for (let i = parts.length - 1; i >= 0; i--) {
      const pt = parts[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.12;
      pt.life -= 1;
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x - camX), Math.round(pt.y), pt.size, pt.size);
      if (pt.life <= 0) parts.splice(i, 1);
    }

    // Floating Popups
    const pops = popupsRef.current;
    for (let i = pops.length - 1; i >= 0; i--) {
      const pop = pops[i];
      pop.y -= 0.7;
      pop.life -= 1;
      ctx.fillStyle = pop.color;
      ctx.font = 'bold 12px monospace';
      ctx.fillText(pop.text, Math.round(pop.x - camX), Math.round(pop.y));
      if (pop.life <= 0) pops.splice(i, 1);
    }

    // In-canvas HUD (Hearts + Level + Progress)
    ctx.fillStyle = 'rgba(255,255,255,0.86)';
    ctx.fillRect(8, 8, 180, 24);
    ctx.strokeStyle = '#ff8ec7';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 180, 24);
    for (let h = 0; h < MAX_HEARTS; h++) {
      if (h < heartsRef.current) {
        drawSprite(ctx, ICO_HEART, 14 + h * 18, 14, 1);
      } else {
        ctx.fillStyle = '#e5b8ce';
        ctx.fillRect(17 + h * 18, 16, 10, 8);
      }
    }
    ctx.fillStyle = '#5c2240';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`LV ${lvl.level}/100`, 76, 24);
    ctx.fillText(`★${coinsRef.current}`, 144, 24);

    // Win / Game Over overlay banner inside canvas
    if (statusRef.current !== 'playing') {
      ctx.fillStyle = 'rgba(45, 21, 16, 0.55)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#fff5fa';
      ctx.fillRect(90, 84, 340, 96);
      ctx.strokeStyle = '#d63384';
      ctx.lineWidth = 4;
      ctx.strokeRect(90, 84, 340, 96);
      ctx.fillStyle = '#d63384';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        statusRef.current === 'won'
          ? lvl.level === 100
            ? 'ALL 100 LEVELS CLEAR!'
            : `LEVEL ${lvl.level} CLEAR!`
          : 'OUT OF HEARTS!',
        CANVAS_W / 2,
        122
      );
      ctx.fillStyle = '#5c2240';
      ctx.font = '13px monospace';
      ctx.fillText(
        statusRef.current === 'won'
          ? 'Use Next Level below to continue!'
          : 'Tap Retry Level below for 3 fresh hearts!',
        CANVAS_W / 2,
        152
      );
      ctx.textAlign = 'left';
    }
  }, []);

  return (
    <section className="animate-pop-in text-center">
      <RibbonTitle>🍄 Bestie Mario Quest (Lv 1–100) 🍄</RibbonTitle>
      <Subtitle>
        Run, jump, stomp enemies &amp; shoot Heart Beams across 100 levels!
      </Subtitle>

      <div className="my-2 flex flex-wrap items-center justify-center gap-2.5 text-[10px] tabular-nums">
        <div className="rounded-full border-2 border-[var(--pink-border)] bg-white px-3 py-1.5">
          Hearts: {'♥'.repeat(hearts)}
          {'♡'.repeat(MAX_HEARTS - hearts)}
        </div>
        <div className="rounded-full border-2 border-[var(--pink-border)] bg-white px-3 py-1.5">
          Level {levelNum}/100 · {biomeName}
        </div>
        <div className="rounded-full border-2 border-[var(--pink-border)] bg-white px-3 py-1.5">
          Stars: ★ {coins}
        </div>
      </div>

      <CanvasFrame>
        <PixelCanvas width={CANVAS_W} height={CANVAS_H} onRender={renderGame} />
      </CanvasFrame>

      {/* Touch & Mouse Controls */}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <PxButton
          variant="secondary"
          onPointerDown={() => {
            inputRef.current.left = true;
          }}
          onPointerUp={() => {
            inputRef.current.left = false;
          }}
          onPointerLeave={() => {
            inputRef.current.left = false;
          }}
          onPointerCancel={() => {
            inputRef.current.left = false;
          }}
        >
          ◀ Left
        </PxButton>
        <PxButton
          variant="secondary"
          onPointerDown={() => {
            inputRef.current.right = true;
          }}
          onPointerUp={() => {
            inputRef.current.right = false;
          }}
          onPointerLeave={() => {
            inputRef.current.right = false;
          }}
          onPointerCancel={() => {
            inputRef.current.right = false;
          }}
        >
          Right ▶
        </PxButton>
        <PxButton
          onPointerDown={triggerJump}
          onPointerUp={releaseJump}
          onPointerLeave={releaseJump}
          onPointerCancel={releaseJump}
        >
          Jump ▲
        </PxButton>
        <PxButton variant="secondary" onClick={triggerShoot}>
          Heart Beam 💖
        </PxButton>
      </div>

      <MsgBox>{message}</MsgBox>

      {/* Level Switcher (1–100) + Retry / Next */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {status === 'won' && levelNum < 100 && (
          <PxButton onClick={() => startLevel(levelNum + 1, true)}>
            Next Level ({levelNum + 1}) →
          </PxButton>
        )}
        <PxButton
          variant={status === 'lost' ? 'primary' : 'secondary'}
          onClick={() => startLevel(levelNum, false)}
        >
          Retry Level ↺
        </PxButton>
        <label className="font-pixel inline-flex items-center gap-1.5 rounded-[12px] border-2 border-[var(--pink-border)] bg-white px-2.5 py-2 text-[9px] text-[var(--text-dark)]">
          <span>Go Lv:</span>
          <select
            aria-label="Select level 1 to 100"
            value={levelNum}
            onChange={(e) => startLevel(Number(e.target.value), false)}
            className="font-pixel cursor-pointer bg-transparent text-[9px] text-[var(--pink-dark)] outline-none"
          >
            {Array.from({ length: 100 }, (_, i) => i + 1).map((lv) => (
              <option key={lv} value={lv}>
                {lv} {lv % 10 === 0 ? '👑' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
