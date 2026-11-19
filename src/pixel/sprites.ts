export const PAL: Record<string, string> = {
  o: '#2d1510', // outline
  h: '#4d271c', // wavy dark brown hair
  H: '#703d2d', // hair highlight
  s: '#d89b78', // light brown skin
  S: '#b97854', // skin shadow
  c: '#ff8cb3', // rosy cheeks
  e: '#24100b', // dark eyes
  m: '#e04f7b', // cute mouth
  p: '#ff77b7', // pink bow / sweater
  P: '#e03e8c', // deep pink
  l: '#ffc2e0', // pastel light pink
  w: '#ffffff', // white
  g: '#ffe3f1', // soft fur shading
  y: '#ffe066', // gold / star
  Y: '#f2ad00', // gold shadow
  b: '#ba7447', // teddy bear brown
  B: '#8a4e2a', // teddy shadow
  t: '#f2caa4', // teddy snout
  r: '#ff4d6d', // berry red
  a: '#7de2ff', // accessory blue/shades
};

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  grid: readonly string[],
  x: number,
  y: number,
  scale = 3,
  flipX = false
): void {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  for (let r = 0; r < rows; r++) {
    const line = grid[r];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '.' || !PAL[ch]) continue;
      ctx.fillStyle = PAL[ch];
      const drawC = flipX ? cols - 1 - c : c;
      ctx.fillRect(Math.round(x + drawC * scale), Math.round(y + r * scale), scale, scale);
    }
  }
}

export function drawSparkles(
  ctx: CanvasRenderingContext2D,
  t: number,
  list: ReadonlyArray<readonly [number, number, number, string?]>
): void {
  for (const [x, y, phase, color] of list) {
    const pulse = Math.sin(t * 0.08 + phase);
    if (pulse > 0) {
      ctx.fillStyle = color || '#ffe066';
      ctx.fillRect(Math.round(x), Math.round(y - 3), 2, 8);
      ctx.fillRect(Math.round(x - 3), Math.round(y), 8, 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }
}

// 24x22 Chibi Girl - Eyes Open
export const GIRL_OPEN: readonly string[] = [
  '......oo......oooooo....',
  '.....oPPo....oHHHHHHo...',
  '....oPllPo..oHHhhhhHHo..',
  '....oPlPPooooHhhhhhhHo..',
  '...ooPppPphhhhhhhhhhho..',
  '...ohhhhhhhhhhhhhhhhho..',
  '..ohHhhssssssssssshhhho.',
  '..ohhhssssssssssssshhho.',
  '.ohHhssseessssssseesshho',
  '.ohhhsssewsssssssewsshho',
  '.ohHhssccssssssssccshHho',
  '.ohhhsssssssmmmssssshhho',
  '..ohhhssssssmmssssshhho.',
  '..ohHhosssoosssosssohho.',
  '...ohhosssossssosssshho.',
  '...ohHhossopllpposssoho.',
  '..ohhhhooopppppppooohho.',
  '..ohho..opPlllllPpo..o..',
  '...oo...opppppppppo.....',
  '.......opPpppppppPpo....',
  '.......opppppppppppo....',
  '........ooooooooooo.....',
];

// 24x22 Chibi Girl - Winking
export const GIRL_WINK: readonly string[] = [
  '......oo......oooooo....',
  '.....oPPo....oHHHHHHo...',
  '....oPllPo..oHHhhhhHHo..',
  '....oPlPPooooHhhhhhhHo..',
  '...ooPppPphhhhhhhhhhho..',
  '...ohhhhhhhhhhhhhhhhho..',
  '..ohHhhssssssssssshhhho.',
  '..ohhhssssssssssssshhho.',
  '.ohHhssseessssssssssshho',
  '.ohhhsssewssssssseesshho',
  '.ohHhssccssssssssccshHho',
  '.ohhhsssssssmmmssssshhho',
  '..ohhhssssssmmmsssshhho.',
  '..ohHhosssoosssosssohho.',
  '...ohhosssossssosssshho.',
  '...ohHhossopllpposssoho.',
  '..ohhhhooopppppppooohho.',
  '..ohho..opPlllllPpo..o..',
  '...oo...opppppppppo.....',
  '.......opPpppppppPpo....',
  '.......opppppppppppo....',
  '........ooooooooooo.....',
];

// 24x22 Chibi Girl - Thinking Pose (Quiz)
export const GIRL_THINK: readonly string[] = [
  '......oo......oooooo....',
  '.....oPPo....oHHHHHHo...',
  '....oPllPo..oHHhhhhHHo..',
  '....oPlPPooooHhhhhhhHo..',
  '...ooPppPphhhhhhhhhhho..',
  '...ohhhhhhhhhhhhhhhhho..',
  '..ohHhhssssssssssshhhho.',
  '..ohhhssssssssssssshhho.',
  '.ohHhssseessssssssssshho',
  '.ohhhsssewssssssseesshho',
  '.ohHhssccssssssssccshHho',
  '.ohhhsssssssmmsssssshhho',
  '..ohhhssssssosssoosshho.',
  '..ohHhhssssossssoohhhho.',
  '...ohhhssssossssoohhho..',
  '...ohHhooopplllpoohho...',
  '..ohhhhooppppppppooo....',
  '..ohho..opPlllllPpo.....',
  '...oo...opppppppppo.....',
  '.......opPpppppppPpo....',
  '.......opppppppppppo....',
  '........ooooooooooo.....',
];

// 22x22 Chibi Girl - Back View (Claw Machine)
export const GIRL_BACK: readonly string[] = [
  '......oooooooooo......',
  '....ooHHHHHHHHHHoo....',
  '...oHHHHhhhhhhHHHHo...',
  '..oHHhhhhhhhhhhhhHHo..',
  '..ohhhhoPPooPPohhhho..',
  '.ohHhhoPllPPllPohHhho.',
  '.ohhhhoPplPPlpPohhhho.',
  '.ohHhhooPPooPPoohHhho.',
  '.ohhhhhhhhhhhhhhhhhho.',
  '.ohHhhhhhhhhhhhhhhHho.',
  '.ohhhhhhhhhhhhhhhhhho.',
  '..ohHhhhhhhhhhhhhHho..',
  '..ohhhhhhhhhhhhhhhho..',
  '...ohHhopppppppohHo...',
  '...ohhoPpppppppPoho...',
  '....ooopppppppppoo....',
  '.....oplllllllllpo....',
  '.....opPpppppppPpo....',
  '......ooooooooooo.....',
  '......osss...ssso.....',
  '.....oppppo.oppppo....',
  '......oooo...oooo.....',
];

// 20x20 Chibi Girl - Running with Net (Catch My Love)
export const GIRL_RUN_1: readonly string[] = [
  '....oo....oooooo....',
  '...oPPo..oHHHHHHo...',
  '..oPllPo.oHHhhhhHo..',
  '...oPlPoooHhhhhhho..',
  '..ohhhhhhhhhhhhhho..',
  '..ohHhsssssssshhho..',
  '.ohhhssseessseeshho.',
  '.ohHhssccssssccshho.',
  '.ohhhsssssmmssssho..',
  '..ohhhssssssssssho..',
  '...ohhooppppppooo...',
  '...oo..oppppppo.....',
  '......opPppppPpo....',
  '......oppppppppo....',
  '.....opllllllllpo...',
  '.....oppppppppppo...',
  '......oooooooooo....',
  '.....osso....osso...',
  '....opppo....opppo..',
  '.....ooo......ooo...',
];

export const GIRL_RUN_2: readonly string[] = [
  '....oo....oooooo....',
  '...oPPo..oHHHHHHo...',
  '..oPllPo.oHHhhhhHo..',
  '...oPlPoooHhhhhhho..',
  '..ohhhhhhhhhhhhhho..',
  '..ohHhsssssssshhho..',
  '.ohhhssseessseeshho.',
  '.ohHhssccssssccshho.',
  '.ohhhsssssmmssssho..',
  '..ohhhssssssssssho..',
  '...ohhooppppppooo...',
  '...oo..oppppppo.....',
  '......opPppppPpo....',
  '......oppppppppo....',
  '.....opllllllllpo...',
  '.....oppppppppppo...',
  '......oooooooooo....',
  '......osso..osso....',
  '......opppooopppo...',
  '.......ooo...ooo....',
];

// 14x13 Cute White Kitty with Pink Bow
export const KITTY: readonly string[] = [
  '.oo.......oo..',
  'owwo.ooo.owwo.',
  'owwwoPllPowwo.',
  'owwwwPlPPwwwo.',
  'owwwwwwwwwwwo.',
  'owwwewwwewwwo.',
  'owcwwmwmwwcwo.',
  'owwwwwwwwwwwo.',
  '.owwwwwwwwwo..',
  '..oopppppoo...',
  '..owwwwwwwwwo.',
  '..oww.ww.wwwo.',
  '...oo.oo..oo..',
];

// 18x15 Fluffy White Puppy (Bestie Pet)
export const PUPPY_BASE: readonly string[] = [
  '...oooo....oooo...',
  '..owwwwo..owwwwo..',
  '.owwwwwwoowwwwwwo.',
  '.owwggwwwwwwggwwo.',
  'owwggwwwwwwwwggwwo',
  'owwwwewwmmwwewwwwo',
  'owwwcwwwwwwwwcwwwo',
  'owwwwwwwwwwwwwwwwo',
  '.owwwwwwwwwwwwwwo.',
  '..ooowwwwwwwwooo..',
  '...owwwwwwwwwwo...',
  '..owwwwwwwwwwwwo..',
  '..owww.wwww.wwwo..',
  '..owwo.owwo.owwo..',
  '...oo...oo...oo...',
];

// Accessories for Puppy
export const ACC_BOW: readonly string[] = [
  '......oPPooPPo....',
  '.....oPllPPllPo...',
  '......oPPooPPo....',
];
export const ACC_CROWN: readonly string[] = [
  '.....oy..oy..oy...',
  '.....oYyyYyyYyo...',
  '.....oYYYYYYYYo...',
];
export const ACC_SHADES: readonly string[] = [
  '....oooo..oooo....',
  '...oaeeaooaeeao...',
  '....oooo..oooo....',
];
export const ACC_HAT: readonly string[] = [
  '.......oPpo.......',
  '......oPllPo......',
  '.....oPppppPo.....',
];

// Icons (Hearts, Bow, Star, Bear, Bunny, Gift)
export const ICO_HEART: readonly string[] = [
  '..ooo....ooo..',
  '.oPppo..oPppo.',
  'oPllPPooPPppPo',
  'oPlpppppppppPo',
  'oPppppppppppPo',
  'oPppppppppppPo',
  '.oPppppppppPo.',
  '..oPppppppPo..',
  '...oPppppPo...',
  '....oPppPo....',
  '.....oPPo.....',
  '......oo......',
];

export const ICO_GOLD_HEART: readonly string[] = ICO_HEART.map((r) =>
  r.replace(/P/g, 'Y').replace(/p/g, 'y').replace(/l/g, 'w')
);

export const ICO_BOW: readonly string[] = [
  '.ooo......ooo.',
  'oPllPo..oPllPo',
  'oPlpPPooPPplPo',
  'oPppPppppPppPo',
  '.ooooPppPoooo.',
  '...oPppppPo...',
  '..oPpo..oPpo..',
  '.oPpo....oPpo.',
  '.ooo......ooo.',
];

export const ICO_STAR: readonly string[] = [
  '......oo......',
  '.....oyyo.....',
  '....oywwyo....',
  'oooooyyyyooooo',
  'oyyyyyyyyyyyYo',
  '.oyyyyyyyyyYo.',
  '..oyyyyyyyYo..',
  '..oyyyYYyyYo..',
  '.oyyYo..oYYyo.',
  '.ooo......ooo.',
];

export const ICO_BEAR: readonly string[] = [
  '.ooo......ooo.',
  'obbboooooobbbo',
  'obttbbbbbbttbo',
  '.obbbbbbbbbbo.',
  'obbbebbbbebbbo',
  'obbbtmmmmtbbbo',
  'obbbttttttbbbo',
  '.obbbbbbbbbbo.',
  '..oobbbbbboo..',
  '.obbttttttbbo.',
  '.obbbttttbbbo.',
  '..ooo....ooo..',
];

export const ICO_BUNNY: readonly string[] = [
  '..ooo....ooo..',
  '.owwwo..owwwo.',
  '.owpwo..owpwo.',
  '.owwwoooowwwo.',
  '.owwwwwwwwwwo.',
  'owwwewwwwewwwo',
  'owwcwwmmwwcwwo',
  '.owwwwwwwwwwo.',
  '..oowwwwwwoo..',
  '.owwwppppwwwo.',
  '..ooo....ooo..',
];

export const ICO_GIFT: readonly string[] = [
  '...ooo..ooo...',
  '..oPllooPllPo.',
  '...oooPPooo...',
  '.oooooooooooo.',
  'oPppppPPppppPo',
  'oPPPPPPPPPPPPo',
  '.oooooooooooo.',
  '.oppppoPopppo.',
  '.opllpoPoplpo.',
  '.oppppoPopppo.',
  '.oppppoPopppo.',
  '.oppppoPopppo.',
  '.oooooooooooo.',
];
