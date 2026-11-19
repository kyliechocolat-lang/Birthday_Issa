import { useCallback, useEffect, useRef, useState } from 'react';
import { sfxOops, sfxPop, sfxSparkle } from '../../pixel/sfx';
import {
  drawSprite,
  GIRL_BACK,
  ICO_BEAR,
  ICO_BUNNY,
  ICO_STAR,
  KITTY,
} from '../../pixel/sprites';
import {
  CanvasFrame,
  MsgBox,
  PixelCanvas,
  PxButton,
  RibbonTitle,
  Subtitle,
} from '../PixelUi';

interface ClawPrize {
  id: string;
  name: string;
  x: number;
  sprite: readonly string[];
  quote: string;
}

const CLAW_PRIZES: ClawPrize[] = [
  {
    id: 'bear',
    name: 'Grumpy Teddy',
    x: 52,
    sprite: ICO_BEAR,
    quote: 'You caught Grumpy Teddy! He demands 100 bestie hugs immediately! 🧸',
  },
  {
    id: 'bunny',
    name: 'Sleepy Bunny',
    x: 108,
    sprite: ICO_BUNNY,
    quote: 'You caught Sleepy Bunny! Official pass to take a guilt-free nap! 🐰',
  },
  {
    id: 'star',
    name: 'Drama Star',
    x: 162,
    sprite: ICO_STAR,
    quote: 'You caught Drama Star! Proof that you shine brighter than everyone! ⭐',
  },
  {
    id: 'kitty',
    name: 'Sassy Kitty',
    x: 214,
    sprite: KITTY,
    quote: 'You caught Sassy Kitty! She approves of all your life choices! 🐱',
  },
];

export function ClawPage() {
  const [grabbing, setGrabbing] = useState(false);
  const [message, setMessage] = useState(
    'Aim over a plushie & hit GRAB! (Arrow keys + Space work too!)'
  );
  const [collectedIds, setCollectedIds] = useState<string[]>([]);

  const clawXRef = useRef(148);
  const clawYRef = useRef(38);
  const clawDirRef = useRef(0);
  const clawStateRef = useRef<'idle' | 'down' | 'up'>('idle');
  const caughtRef = useRef<ClawPrize | null>(null);

  const clawGrab = useCallback(() => {
    if (clawStateRef.current !== 'idle') return;
    clawStateRef.current = 'down';
    caughtRef.current = null;
    setGrabbing(true);
    setMessage('Lowering the claw... steady!! ✨');
    sfxPop();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        clawDirRef.current = -1;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        clawDirRef.current = 1;
      } else if (e.key === ' ') {
        e.preventDefault();
        clawGrab();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        clawDirRef.current = 0;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [clawGrab]);

  const renderClaw = useCallback((ctx: CanvasRenderingContext2D, tick: number) => {
    if (clawStateRef.current === 'idle' && clawDirRef.current !== 0) {
      clawXRef.current = Math.max(46, Math.min(242, clawXRef.current + clawDirRef.current * 3));
    }

    if (clawStateRef.current === 'down') {
      clawYRef.current += 3;
      if (clawYRef.current >= 145) {
        let hit: ClawPrize | null = null;
        for (const p of CLAW_PRIZES) {
          if (Math.abs(p.x + 18 - clawXRef.current) < 26) {
            hit = p;
          }
        }
        caughtRef.current = hit;
        clawStateRef.current = 'up';
        if (hit) sfxSparkle();
        else sfxOops();
      }
    } else if (clawStateRef.current === 'up') {
      clawYRef.current -= 3;
      if (clawYRef.current <= 38) {
        clawYRef.current = 38;
        clawStateRef.current = 'idle';
        setGrabbing(false);
        const caught = caughtRef.current;
        if (caught) {
          setCollectedIds((prev) => (prev.includes(caught.id) ? prev : [...prev, caught.id]));
          setMessage(caught.quote);
          caughtRef.current = null;
        } else {
          setMessage('So close! Aim right above a plushie and try again! 💪');
        }
      }
    }

    const cx = clawXRef.current;
    const cy = clawYRef.current;

    // Machine Cabinet
    ctx.fillStyle = '#ff8ec7';
    ctx.fillRect(24, 12, 252, 240);
    ctx.fillStyle = '#fff5fa';
    ctx.fillRect(36, 26, 228, 174);

    // Decorative pastel balls at bottom
    const ballCols = ['#ffc2e0', '#ffe066', '#b8f2ff', '#d4b8ff'];
    for (let i = 0; i < 11; i++) {
      ctx.fillStyle = ballCols[i % ballCols.length];
      ctx.fillRect(38 + i * 21, 174, 22, 24);
    }

    // Plushies inside glass
    for (const p of CLAW_PRIZES) {
      if (caughtRef.current && caughtRef.current.id === p.id) {
        drawSprite(ctx, p.sprite, cx - 18, cy + 14, 3);
      } else {
        drawSprite(ctx, p.sprite, p.x, 146, 3);
      }
    }

    // Claw cable & prongs
    ctx.fillStyle = '#996680';
    ctx.fillRect(cx - 2, 26, 4, cy - 26);
    ctx.fillStyle = '#6e475b';
    ctx.fillRect(cx - 12, cy, 24, 6);
    ctx.fillRect(cx - 14, cy + 6, 4, 12);
    ctx.fillRect(cx + 10, cy + 6, 4, 12);

    // Control deck & joystick
    ctx.fillStyle = '#e0488e';
    ctx.fillRect(24, 200, 252, 52);
    ctx.fillStyle = '#ffc2e0';
    ctx.fillRect(62, 206, 10, 14);
    ctx.fillStyle = '#ff4da6';
    ctx.fillRect(59, 200, 16, 10);

    // Girl standing from behind at the controls
    const sway = Math.sin(tick * 0.1) * 1.5;
    drawSprite(ctx, GIRL_BACK, 182 + sway, 178, 4);
  }, []);

  const setDir = (dir: number) => {
    clawDirRef.current = dir;
  };

  return (
    <section className="animate-pop-in text-center">
      <RibbonTitle>🧸 Bestie Claw Machine 🧸</RibbonTitle>
      <Subtitle>Move the claw and catch cute prizes with funny surprises!</Subtitle>

      <CanvasFrame>
        <PixelCanvas width={300} height={270} onRender={renderClaw} />
      </CanvasFrame>

      <div className="mt-3.5 flex flex-wrap justify-center gap-2.5">
        <PxButton
          variant="secondary"
          onPointerDown={() => setDir(-1)}
          onPointerUp={() => setDir(0)}
          onPointerLeave={() => setDir(0)}
          onPointerCancel={() => setDir(0)}
        >
          ◀ Left
        </PxButton>
        <PxButton onClick={clawGrab} disabled={grabbing}>
          GRAB! 🎀
        </PxButton>
        <PxButton
          variant="secondary"
          onPointerDown={() => setDir(1)}
          onPointerUp={() => setDir(0)}
          onPointerLeave={() => setDir(0)}
          onPointerCancel={() => setDir(0)}
        >
          Right ▶
        </PxButton>
      </div>

      <MsgBox>{message}</MsgBox>

      {collectedIds.length > 0 && (
        <div className="mt-2.5 flex flex-wrap justify-center gap-2">
          {CLAW_PRIZES.filter((p) => collectedIds.includes(p.id)).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 rounded-[10px] border-2 border-[var(--pink-border)] bg-white px-2.5 py-1 text-[9px]"
            >
              ✓ {p.name}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
