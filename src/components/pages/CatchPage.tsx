import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { sfxPop, sfxSparkle } from '../../pixel/sfx';
import {
  drawSparkles,
  drawSprite,
  GIRL_RUN_1,
  GIRL_RUN_2,
  GIRL_WINK,
  ICO_GIFT,
  ICO_GOLD_HEART,
  ICO_HEART,
} from '../../pixel/sprites';
import {
  CanvasFrame,
  MsgBox,
  PixelCanvas,
  PxButton,
  RibbonTitle,
  Subtitle,
} from '../PixelUi';

interface FallingHeart {
  x: number;
  y: number;
  speed: number;
  gold: boolean;
}

export function CatchPage() {
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState(
    'Move with ◀ ▶ keys, buttons, or drag on the screen! 💕'
  );

  const playerXRef = useRef(120);
  const dirRef = useRef(0);
  const heartsRef = useRef<FallingHeart[]>([]);
  const countRef = useRef(0);
  const wonRef = useRef(false);

  const resetCatch = () => {
    playerXRef.current = 120;
    dirRef.current = 0;
    heartsRef.current = [];
    countRef.current = 0;
    wonRef.current = false;
    setScore(0);
    setMessage('Move with ◀ ▶ keys, buttons, or drag on the screen! 💕');
    sfxPop();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dirRef.current = -1;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dirRef.current = 1;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        dirRef.current = 0;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const moveToPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * e.currentTarget.width;
    playerXRef.current = Math.max(10, Math.min(230, relX - 30));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    moveToPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    moveToPointer(e);
  };

  const renderCatch = useCallback((ctx: CanvasRenderingContext2D, tick: number) => {
    // Soft cloudy ground
    ctx.fillStyle = '#ffd6eb';
    ctx.fillRect(0, 238, 300, 32);

    if (wonRef.current) {
      const bob = Math.sin(tick * 0.15) * 4;
      drawSprite(ctx, GIRL_WINK, 90, 88 + bob, 5);
      drawSprite(ctx, ICO_GIFT, 200, 140 - bob, 4);
      drawSparkles(ctx, tick, [
        [40, 50, 0],
        [250, 45, 2],
        [60, 180, 3, '#ff77b7'],
        [240, 190, 1],
      ]);
      return;
    }

    if (dirRef.current !== 0) {
      playerXRef.current = Math.max(10, Math.min(230, playerXRef.current + dirRef.current * 4.5));
    }

    if (tick % 32 === 0 && heartsRef.current.length < 6) {
      heartsRef.current.push({
        x: 20 + Math.random() * 240,
        y: -16,
        speed: 1.7 + Math.random() * 1.3,
        gold: Math.random() < 0.22,
      });
    }

    const px = playerXRef.current;
    const hearts = heartsRef.current;
    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      h.y += h.speed;
      drawSprite(ctx, h.gold ? ICO_GOLD_HEART : ICO_HEART, h.x, h.y, 2);

      if (h.y > 165 && h.y < 235 && h.x > px - 18 && h.x < px + 68) {
        const nextCount = Math.min(12, countRef.current + (h.gold ? 2 : 1));
        countRef.current = nextCount;
        setScore(nextCount);
        hearts.splice(i, 1);
        sfxSparkle();
        if (nextCount >= 12) {
          wonRef.current = true;
          setMessage(
            'SURPRISE UNLOCKED!! "No matter what happens, I\'ve ALWAYS got your back, Bestie!" 🎁💖'
          );
        }
        continue;
      }
      if (h.y > 270) hearts.splice(i, 1);
    }

    const runSprite = Math.floor(tick / 8) % 2 ? GIRL_RUN_1 : GIRL_RUN_2;
    const faceLeft = dirRef.current < 0;
    drawSprite(ctx, runSprite, px, 174, 3, faceLeft);

    // Cute Pink Butterfly Net
    const netX = faceLeft ? px - 14 : px + 54;
    ctx.fillStyle = '#e0488e';
    ctx.fillRect(netX + 6, 172, 3, 28);
    ctx.fillStyle = '#ff8ec7';
    ctx.fillRect(netX, 158, 16, 14);
    ctx.fillStyle = '#fff';
    ctx.fillRect(netX + 3, 161, 10, 8);
  }, []);

  return (
    <section className="animate-pop-in text-center">
      <RibbonTitle>💘 Catch My Love 💘</RibbonTitle>
      <Subtitle>Catch 12 falling pink hearts to unlock a special surprise!</Subtitle>

      <div className="my-2 flex flex-wrap justify-center gap-3 text-[10px] tabular-nums">
        <div className="rounded-full border-2 border-[var(--pink-border)] bg-white px-3 py-1.5">
          Hearts Caught: {score} / 12
        </div>
      </div>

      <CanvasFrame>
        <PixelCanvas
          width={300}
          height={270}
          onRender={renderCatch}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="touch-none cursor-ew-resize"
        />
      </CanvasFrame>

      <div className="mt-3.5 flex flex-wrap justify-center gap-2.5">
        <PxButton
          variant="secondary"
          onPointerDown={() => {
            dirRef.current = -1;
          }}
          onPointerUp={() => {
            dirRef.current = 0;
          }}
          onPointerLeave={() => {
            dirRef.current = 0;
          }}
          onPointerCancel={() => {
            dirRef.current = 0;
          }}
        >
          ◀ Run Left
        </PxButton>
        <PxButton onClick={resetCatch}>Restart ↺</PxButton>
        <PxButton
          variant="secondary"
          onPointerDown={() => {
            dirRef.current = 1;
          }}
          onPointerUp={() => {
            dirRef.current = 0;
          }}
          onPointerLeave={() => {
            dirRef.current = 0;
          }}
          onPointerCancel={() => {
            dirRef.current = 0;
          }}
        >
          Run Right ▶
        </PxButton>
      </div>

      <MsgBox>{message}</MsgBox>
    </section>
  );
}
