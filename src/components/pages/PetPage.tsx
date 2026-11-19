import { useCallback, useRef, useState } from 'react';
import { sfxSparkle } from '../../pixel/sfx';
import {
  ACC_BOW,
  ACC_CROWN,
  ACC_HAT,
  ACC_SHADES,
  drawSparkles,
  drawSprite,
  ICO_HEART,
  ICO_STAR,
  PUPPY_BASE,
} from '../../pixel/sprites';
import {
  CanvasFrame,
  MsgBox,
  PixelCanvas,
  PxButton,
  RibbonTitle,
  Subtitle,
} from '../PixelUi';

const PET_STYLES = ['Pink Bow', 'Princess Crown', 'Cool Shades', 'Party Hat'] as const;

export function PetPage() {
  const [love, setLove] = useState(3);
  const [styleIdx, setStyleIdx] = useState(0);
  const [message, setMessage] = useState('Puppy is wagging her tail waiting for you! 🐾');

  const styleRef = useRef(0);
  const reactionRef = useRef<'idle' | 'happy' | 'eating'>('idle');
  const timerRef = useRef(0);

  const handleAction = (type: 'feed' | 'dress' | 'care') => {
    sfxSparkle();
    timerRef.current = 50;

    if (type === 'feed') {
      reactionRef.current = 'eating';
      setLove((prev) => Math.min(5, prev + 1));
      setMessage('Nom nom nom! Bestie strawberry treats are the yummiest! 🍓');
    } else if (type === 'dress') {
      reactionRef.current = 'happy';
      const next = (styleRef.current + 1) % PET_STYLES.length;
      styleRef.current = next;
      setStyleIdx(next);
      setMessage(`Oooo! Puppy looks SO fashionable in her ${PET_STYLES[next]}! ✨`);
    } else {
      reactionRef.current = 'happy';
      setLove((prev) => Math.min(5, prev + 1));
      setMessage('Brushy brushy! Tail wagging at 1000mph!! 💖🐾');
    }
  };

  const renderPet = useCallback((ctx: CanvasRenderingContext2D, tick: number) => {
    if (timerRef.current > 0) timerRef.current -= 1;
    else reactionRef.current = 'idle';

    // Cushion
    ctx.fillStyle = '#ff8ec7';
    ctx.fillRect(70, 150, 140, 26);
    ctx.fillStyle = '#ffc2e0';
    ctx.fillRect(78, 154, 124, 14);

    // Food Bowl on left
    ctx.fillStyle = '#ff4da6';
    ctx.fillRect(24, 156, 36, 18);
    ctx.fillStyle = '#ba7447';
    ctx.fillRect(28, 152, 28, 6);

    // Puppy bounce
    const jump =
      reactionRef.current === 'happy'
        ? Math.abs(Math.sin(tick * 0.35)) * -18
        : (Math.floor(tick / 16) % 2) * -3;

    const px = 95;
    const py = 74 + jump;
    drawSprite(ctx, PUPPY_BASE, px, py, 5);

    // Selected Dress-Up Overlay
    const s = styleRef.current;
    if (s === 0) drawSprite(ctx, ACC_BOW, px + 5, py - 10, 5);
    else if (s === 1) drawSprite(ctx, ACC_CROWN, px, py - 15, 5);
    else if (s === 2) drawSprite(ctx, ACC_SHADES, px + 2, py + 22, 5);
    else if (s === 3) drawSprite(ctx, ACC_HAT, px, py - 15, 5);

    // Floating hearts if happy/eating
    if (timerRef.current > 0) {
      drawSprite(ctx, ICO_HEART, 54, 42 - (50 - timerRef.current) * 0.4, 2);
      drawSprite(ctx, ICO_HEART, 200, 36 - (50 - timerRef.current) * 0.4, 2);
      if (reactionRef.current === 'eating') {
        drawSprite(ctx, ICO_STAR, 128, 134, 2);
      }
    }
    drawSparkles(ctx, tick, [
      [35, 45, 0],
      [238, 52, 2, '#ff77b7'],
    ]);
  }, []);

  return (
    <section className="animate-pop-in text-center">
      <RibbonTitle>🐶 Your Bestie Pet 🐶</RibbonTitle>
      <Subtitle>Feed, dress up &amp; take care of your fluffy puppy together!</Subtitle>

      <div className="my-2 flex flex-wrap justify-center gap-3 text-[10px]">
        <div className="rounded-full border-2 border-[var(--pink-border)] bg-white px-3 py-1.5">
          Love: {'♥'.repeat(love)}
          {'♡'.repeat(5 - love)}
        </div>
        <div className="rounded-full border-2 border-[var(--pink-border)] bg-white px-3 py-1.5">
          Style: {PET_STYLES[styleIdx]}
        </div>
      </div>

      <CanvasFrame>
        <PixelCanvas width={280} height={210} onRender={renderPet} />
      </CanvasFrame>

      <div className="mt-3.5 flex flex-wrap justify-center gap-2.5">
        <PxButton onClick={() => handleAction('feed')}>🍓 Feed</PxButton>
        <PxButton variant="secondary" onClick={() => handleAction('dress')}>
          👗 Dress Up
        </PxButton>
        <PxButton variant="secondary" onClick={() => handleAction('care')}>
          💖 Care &amp; Brush
        </PxButton>
      </div>

      <MsgBox>{message}</MsgBox>
    </section>
  );
}
