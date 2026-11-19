import { useEffect, useState } from 'react';
import { CatchPage } from './components/pages/CatchPage';
import { ClawPage } from './components/pages/ClawPage';
import { GiftPage } from './components/pages/GiftPage';
import { MemoryPage } from './components/pages/MemoryPage';
import { PetPage } from './components/pages/PetPage';
import { QuizPage } from './components/pages/QuizPage';
import { type PageId, WelcomePage } from './components/pages/WelcomePage';
import { setBgmEnabled, startBgm, stopBgm } from './pixel/bgm';
import { setSfxEnabled, sfxPop } from './pixel/sfx';

const NAV_ITEMS: ReadonlyArray<{ id: PageId; icon: string; label: string }> = [
  { id: 'welcome', icon: '🌸', label: 'Welcome' },
  { id: 'gift', icon: '🎁', label: 'Gift' },
  { id: 'memory', icon: '💖', label: 'Memory' },
  { id: 'claw', icon: '🧸', label: 'Claw' },
  { id: 'pet', icon: '🐶', label: 'Pet' },
  { id: 'catch', icon: '💘', label: 'Catch' },
  { id: 'quiz', icon: '🍄', label: 'Quest' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('welcome');
  const [sfxOn, setSfxOn] = useState(true);
  const [bgmOn, setBgmOn] = useState(true);

  useEffect(() => {
    const unlock = () => {
      if (bgmOn) {
        startBgm();
      }
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      stopBgm();
    };
  }, []);

  const goPage = (id: PageId) => {
    setCurrentPage(id);
    sfxPop();
    if (bgmOn) startBgm();
  };

  const toggleSound = () => {
    const next = !sfxOn;
    setSfxOn(next);
    setSfxEnabled(next);
    if (next) sfxPop();
  };

  const toggleBgm = () => {
    const next = !bgmOn;
    setBgmOn(next);
    setBgmEnabled(next);
    sfxPop();
  };

  const pageNumber = NAV_ITEMS.findIndex((item) => item.id === currentPage) + 1;

  return (
    <div className="flex min-h-screen flex-col items-center px-3 pt-3 pb-24 select-none">
      <header className="mb-3 flex w-full max-w-[680px] flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 rounded-[12px] border-[3px] border-[var(--pink-border)] bg-white px-3 py-2 text-[10px] shadow-[0_4px_0_var(--shadow)]">
          <span>🎀 Bestie Arcade · Page {pageNumber}/7</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleBgm}
            className="font-pixel cursor-pointer rounded-[12px] border-[3px] border-[var(--pink-border)] bg-white px-3 py-2 text-[10px] text-[var(--pink-dark)] shadow-[0_4px_0_var(--shadow)] transition-transform active:translate-y-0.5 active:shadow-[0_1px_0_var(--shadow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
          >
            {bgmOn ? '🎵 BGM: ON' : '🎵 BGM: OFF'}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            className="font-pixel cursor-pointer rounded-[12px] border-[3px] border-[var(--pink-border)] bg-white px-3 py-2 text-[10px] text-[var(--pink-dark)] shadow-[0_4px_0_var(--shadow)] transition-transform active:translate-y-0.5 active:shadow-[0_1px_0_var(--shadow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)]"
          >
            {sfxOn ? '🔊 SFX: ON' : '🔇 SFX: OFF'}
          </button>
        </div>
      </header>

      <main className="w-full max-w-[680px]">
        <div className="relative overflow-hidden rounded-[22px] border-4 border-[var(--pink-dark)] bg-[var(--card-bg)] px-4 pt-5 pb-6 text-center shadow-[0_8px_0_var(--shadow),inset_0_0_0_4px_#ffd9ec]">
          {currentPage === 'welcome' && <WelcomePage onNavigate={goPage} />}
          {currentPage === 'gift' && <GiftPage onNavigate={goPage} />}
          {currentPage === 'memory' && <MemoryPage onNavigate={goPage} />}
          {currentPage === 'claw' && <ClawPage />}
          {currentPage === 'pet' && <PetPage />}
          {currentPage === 'catch' && <CatchPage />}
          {currentPage === 'quiz' && <QuizPage />}
        </div>
      </main>

      <nav
        aria-label="Bestie Pixel World pages"
        className="fixed bottom-2.5 left-1/2 z-50 flex max-w-[96vw] -translate-x-1/2 gap-1.5 overflow-x-auto rounded-[18px] border-[3px] border-[var(--pink-dark)] bg-white/95 px-2 py-1.5 shadow-[0_5px_0_var(--shadow)]"
      >
        {NAV_ITEMS.map((item) => {
          const active = item.id === currentPage;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goPage(item.id)}
              className={`font-pixel flex shrink-0 cursor-pointer flex-col items-center gap-1 rounded-[10px] border-2 px-2.5 py-1.5 text-[8px] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-dark)] ${
                active
                  ? 'border-[var(--pink-dark)] bg-[var(--pink-main)] text-white'
                  : 'border-[var(--pink-border)] bg-[#fff2f8] text-[var(--text-dark)] hover:bg-[#ffe3f1]'
              }`}
            >
              <span className="text-[14px] leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
