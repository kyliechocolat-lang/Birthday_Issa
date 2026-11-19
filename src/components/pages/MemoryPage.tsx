import { useCallback, useEffect, useRef, useState } from 'react';
import { sfxOops, sfxPop, sfxSparkle } from '../../pixel/sfx';
import {
  drawSprite,
  GIRL_OPEN,
  GIRL_WINK,
  ICO_BEAR,
  ICO_BOW,
  ICO_BUNNY,
  ICO_HEART,
  ICO_STAR,
  KITTY,
} from '../../pixel/sprites';
import {
  MsgBox,
  PixelCanvas,
  PxButton,
  RibbonTitle,
  Subtitle,
} from '../PixelUi';
import type { PageId } from './WelcomePage';

interface MemItem {
  id: string;
  name: string;
  sprite: readonly string[];
}

interface MemCard extends MemItem {
  uid: number;
  flipped: boolean;
  matched: boolean;
}

const MEM_ITEMS: MemItem[] = [
  { id: 'heart', name: 'Heart', sprite: ICO_HEART },
  { id: 'bow', name: 'Bow', sprite: ICO_BOW },
  { id: 'star', name: 'Star', sprite: ICO_STAR },
  { id: 'bear', name: 'Teddy', sprite: ICO_BEAR },
  { id: 'bunny', name: 'Bunny', sprite: ICO_BUNNY },
  { id: 'kitty', name: 'Kitty', sprite: KITTY },
];

function createShuffledDeck(): MemCard[] {
  return [...MEM_ITEMS, ...MEM_ITEMS]
    .map((item, idx) => ({
      ...item,
      uid: idx,
      flipped: false,
      matched: false,
      sort: Math.random(),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ sort: _s, ...card }) => card);
}

function CardSprite({ sprite }: { sprite: readonly string[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const cols = sprite[0]?.length ?? 14;
    const rows = sprite.length;
    const scale = 3;
    const ox = Math.floor((cv.width - cols * scale) / 2);
    const oy = Math.floor((cv.height - rows * scale) / 2);
    drawSprite(ctx, sprite, ox, oy, scale);
  }, [sprite]);

  return <canvas ref={canvasRef} width={48} height={48} className="h-12 w-12" />;
}

export function MemoryPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [deck, setDeck] = useState<MemCard[]>(() => createShuffledDeck());
  const [selected, setSelected] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState('Flip two cards to find a match! 🌸');
  const cheerTimerRef = useRef(0);
  const flipTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current !== null) {
        window.clearTimeout(flipTimeoutRef.current);
      }
    };
  }, []);

  const initMemory = () => {
    if (flipTimeoutRef.current !== null) {
      window.clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
    sfxPop();
    setDeck(createShuffledDeck());
    setSelected([]);
    setMatches(0);
    setMoves(0);
    setLocked(false);
    cheerTimerRef.current = 0;
    setMessage('Flip two cards to find a match! 🌸');
  };

  const handleFlip = (idx: number) => {
    const target = deck[idx];
    if (locked || !target || target.flipped || target.matched) return;

    sfxPop();
    const nextDeck = deck.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
    const nextSelected = [...selected, idx];
    setDeck(nextDeck);
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      const [aIdx, bIdx] = nextSelected;
      const aCard = nextDeck[aIdx];
      const bCard = nextDeck[bIdx];

      if (aCard.id === bCard.id) {
        const nextMatches = matches + 1;
        setDeck((prev) =>
          prev.map((c, i) => (i === aIdx || i === bIdx ? { ...c, matched: true } : c))
        );
        setMatches(nextMatches);
        setSelected([]);
        cheerTimerRef.current = 45;
        sfxSparkle();
        setMessage(
          nextMatches === 6
            ? `YAY! You matched all 6 pairs in ${nextMoves} moves!! 🏆💖`
            : `Cute match! Found ${aCard.name}! ✨`
        );
      } else {
        setLocked(true);
        flipTimeoutRef.current = window.setTimeout(() => {
          sfxOops();
          setDeck((prev) =>
            prev.map((c, i) => (i === aIdx || i === bIdx ? { ...c, flipped: false } : c))
          );
          setSelected([]);
          setLocked(false);
          flipTimeoutRef.current = null;
        }, 650);
      }
    }
  };

  const renderGirl = useCallback((ctx: CanvasRenderingContext2D, tick: number) => {
    if (cheerTimerRef.current > 0) cheerTimerRef.current -= 1;
    const cheering = cheerTimerRef.current > 0;
    const bob = cheering
      ? Math.abs(Math.sin(tick * 0.35)) * -6
      : (Math.floor(tick / 20) % 2) * 2;
    drawSprite(ctx, cheering ? GIRL_WINK : GIRL_OPEN, 44, 10 + bob, 3);
    if (cheering) {
      drawSprite(ctx, ICO_HEART, 14, 14, 2);
      drawSprite(ctx, ICO_HEART, 124, 14, 2);
    }
  }, []);

  return (
    <section className="animate-pop-in text-center">
      <RibbonTitle>💖 Memory Game 💖</RibbonTitle>
      <Subtitle>Match the cute pairs of hearts, bows, stars &amp; bears!</Subtitle>

      <div className="flex justify-center">
        <PixelCanvas width={160} height={84} onRender={renderGirl} />
      </div>

      <div className="my-2 flex flex-wrap justify-center gap-3 text-[10px] tabular-nums">
        <div className="rounded-full border-2 border-[var(--pink-border)] bg-white px-3 py-1.5">
          Pairs: {matches}/6
        </div>
        <div className="rounded-full border-2 border-[var(--pink-border)] bg-white px-3 py-1.5">
          Moves: {moves}
        </div>
      </div>

      <div className="mx-auto my-3.5 grid max-w-[440px] grid-cols-3 gap-2.5 sm:grid-cols-4">
        {deck.map((card, idx) => {
          const isOpen = card.flipped || card.matched;
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleFlip(idx)}
              aria-label={isOpen ? card.name : `Hidden card ${idx + 1}`}
              className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-[14px] border-[3px] transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)] ${
                card.matched
                  ? 'border-[var(--pink-border)] bg-[#fff0f8] shadow-[0_2px_0_#f3b8d6]'
                  : isOpen
                  ? 'border-[var(--pink-border)] bg-white shadow-[0_4px_0_var(--shadow)]'
                  : 'border-[var(--pink-dark)] bg-gradient-to-b from-[#ff99cc] to-[#ff6bb5] shadow-[0_4px_0_var(--shadow)] hover:-translate-y-0.5'
              }`}
            >
              {isOpen ? (
                <CardSprite sprite={card.sprite} />
              ) : (
                <span className="text-[20px] text-white drop-shadow-[0_2px_0_var(--pink-dark)]">
                  ♡
                </span>
              )}
            </button>
          );
        })}
      </div>

      <MsgBox>{message}</MsgBox>

      <div className="mt-3.5 flex flex-wrap justify-center gap-2.5">
        <PxButton variant="secondary" onClick={initMemory}>
          Shuffle Again ↺
        </PxButton>
        <PxButton onClick={() => onNavigate('claw')}>Next: Claw Machine →</PxButton>
      </div>
    </section>
  );
}
