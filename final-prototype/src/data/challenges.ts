export type ChallengeKind = 'image-medium' | 'image-high' | 'capture' | 'text';

export type ChallengeAsset = {
  src?: string;
  alt: string;
  fallback: string;
};

export type ChallengeOption = {
  id: string;
  label: string;
  asset?: ChallengeAsset;
  explanation?: string;
  targetId?: string;
};

export type Challenge = {
  id: string;
  title: string;
  period: string;
  kind: ChallengeKind;
  cardTitle: string;
  prompt: string;
  targetLabel: string;
  correctAnswer: string;
  options: ChallengeOption[];
  explanation: string;
  artifact: ChallengeAsset;
  cardAssets?: {
    unsolvedPreview?: ChallengeAsset;
    unsolvedChallenge?: ChallengeAsset;
    solvedPreview?: ChallengeAsset;
    solvedChallenge?: ChallengeAsset;
  };
  capture?: {
    camera: ChallengeAsset;
    preview: ChallengeAsset;
    journalNote: ChallengeAsset;
  };
  mapAsset?: ChallengeAsset;
  location: { x: number; y: number };
};

export type ChallengeCompletionRecord = {
  completedAt: string;
  photoDataUrl?: string;
};

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const challenges: Challenge[] = [
  {
    id: 'pottery',
    title: 'Pottery Making',
    period: '5300–4900 BC',
    kind: 'capture',
    cardTitle: 'Pottery Making',
    prompt: 'Capture this artifact to unlock the sketch and note in your field journal.',
    targetLabel: 'Capture photo',
    correctAnswer: 'Capture',
    options: [],
    explanation: 'The dotted pattern on the pottery is made by pressing small marks into the clay.',
    artifact: {
      alt: 'Pottery artifact',
      fallback: '◯',
      src: assetUrl('assets/artifacts/pottery/previews/unsolved.png'),
    },
    cardAssets: {
      unsolvedPreview: {
        alt: 'Unsolved pottery preview',
        fallback: '◯',
        src: assetUrl('assets/artifacts/pottery/previews/unsolved.png'),
      },
      solvedPreview: {
        alt: 'Solved pottery preview',
        fallback: '◯',
        src: assetUrl('assets/artifacts/pottery/previews/solved.png'),
      },
      solvedChallenge: {
        alt: 'Solved pottery challenge card',
        fallback: '◯',
        src: assetUrl('assets/artifacts/pottery/challenges/capture-low/solved.png'),
      },
    },
    capture: {
      camera: {
        alt: 'Camera viewfinder aimed at pottery in the exhibition case',
        fallback: '◯',
      },
      preview: {
        alt: 'Captured pottery photo preview',
        fallback: '◯',
      },
      journalNote: {
        alt: 'Unlocked pottery sketch and note',
        fallback: '◯',
        src: assetUrl('assets/artifacts/pottery/challenges/capture-low/solved.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for pottery making',
      fallback: 'Map',
      src: assetUrl('assets/artifacts/pottery/map/location.png'),
    },
    location: { x: 78, y: 68 },
  },
  {
    id: 'pin',
    title: 'Bronze Age Fashion',
    period: '1500–1350 BC',
    kind: 'image-high',
    cardTitle: 'A Bronze Age Fashion',
    prompt: 'Complete the missing object in the drawing by dragging the correct sketch into the gap.',
    targetLabel: 'Cloak fastener',
    correctAnswer: 'A pin for holding cloak',
    options: [
      {
        id: 'hair-pin',
        label: 'Hair (pin)',
        explanation: 'This looks close, but the cloak clue asks for a fastening pin.',
        targetId: 'hair',
        asset: {
          alt: 'Hair pin option',
          fallback: '|',
          src: assetUrl('assets/artifacts/bronze-age-fashion/challenges/image-medium/options/static/hair.png'),
        },
      },
      {
        id: 'razor',
        label: 'Razor',
        explanation: 'A knife would be useful elsewhere, but not for holding a cloak.',
        targetId: 'razor',
        asset: {
          alt: 'Razor option',
          fallback: '╱',
          src: assetUrl('assets/artifacts/bronze-age-fashion/challenges/image-medium/options/static/razor.png'),
        },
      },
      {
        id: 'cloak-pin',
        label: 'Cloak (pin)',
        explanation: 'The pin fastens the cloak and completes the clothing reconstruction.',
        targetId: 'cloak',
        asset: {
          alt: 'Cloak pin option',
          fallback: '⌁',
          src: assetUrl('assets/artifacts/bronze-age-fashion/challenges/image-medium/options/static/cloak.png'),
        },
      },
      {
        id: 'earrings',
        label: 'Ear Ring',
        explanation: 'Rings decorate the body, but they do not solve the cloak gap.',
        targetId: 'ear-ring',
        asset: {
          alt: 'Ear ring option',
          fallback: '∞',
          src: assetUrl('assets/artifacts/bronze-age-fashion/challenges/image-medium/options/static/ear_ring.png'),
        },
      },
    ],
    explanation: 'The pin helps hold the cloak in place. The completed page records the clothing clue.',
    artifact: {
      alt: 'Bronze Age clothing drawing',
      fallback: '⌁',
    },
    cardAssets: {
      unsolvedPreview: {
        alt: 'Unsolved Bronze Age fashion preview',
        fallback: '⌁',
        src: assetUrl('assets/artifacts/bronze-age-fashion/previews/unsolved.png'),
      },
      unsolvedChallenge: {
        alt: 'Unsolved Bronze Age fashion challenge card',
        fallback: '⌁',
        src: assetUrl('assets/artifacts/bronze-age-fashion/challenges/image-medium/unsolved.png'),
      },
      solvedChallenge: {
        alt: 'Solved Bronze Age fashion challenge card',
        fallback: '⌁',
        src: assetUrl('assets/artifacts/bronze-age-fashion/challenges/image-medium/options/drop/all_solved.png'),
      },
      solvedPreview: {
        alt: 'Solved Bronze Age fashion preview',
        fallback: '⌁',
        src: assetUrl('assets/artifacts/bronze-age-fashion/previews/solved.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for Bronze Age fashion',
      fallback: 'Map',
      src: assetUrl('assets/artifacts/bronze-age-fashion/map/location.png'),
    },
    location: { x: 62, y: 55 },
  },
  {
    id: 'ommerschans-sword',
    title: 'Sword of Ommerschans',
    period: '1500–1350 BC',
    kind: 'text',
    cardTitle: 'Sword of Ommerschans',
    prompt: 'Before its significance was recognized, the smaller sword was kept as ________',
    targetLabel: 'Drop the missing phrase',
    correctAnswer: 'a bedroom decoration',
    options: [
      { id: 'bedroom-decoration', label: 'a bedroom decoration' },
      { id: 'museum-exhibit', label: 'a museum exhibit' },
      { id: 'harbour-tool', label: 'a harbour tool' },
    ],
    explanation: 'Before its importance was understood, the smaller sword was treated as a bedroom decoration.',
    artifact: {
      alt: 'Sword of Ommerschans',
      fallback: '†',
    },
    cardAssets: {
      unsolvedPreview: {
        alt: 'Unsolved Sword of Ommerschans preview',
        fallback: '†',
        src: assetUrl('assets/artifacts/ommerschans-sword/previews/unsolved.png'),
      },
      solvedPreview: {
        alt: 'Solved Sword of Ommerschans preview',
        fallback: '†',
        src: assetUrl('assets/artifacts/ommerschans-sword/previews/solved.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for Sword of Ommerschans',
      fallback: 'Map',
      src: assetUrl('assets/artifacts/ommerschans-sword/map/location.png'),
    },
    location: { x: 54, y: 42 },
  },
  {
    id: 'coin',
    title: 'Byzantine Coin',
    period: '7th century AD',
    kind: 'text',
    cardTitle: 'Jewelry and Status Symbols',
    prompt: 'The Byzantine coins were probably used as ________ by Frisian kings.',
    targetLabel: 'Drop the missing phrase',
    correctAnswer: 'jewelry and status symbols',
    options: [
      { id: 'currency', label: 'everyday currency' },
      { id: 'status', label: 'jewelry and status symbols' },
      { id: 'decorations', label: 'military decorations' },
    ],
    explanation: 'Coins were not only money. They could also communicate status and power.',
    artifact: {
      alt: 'Byzantine coin',
      fallback: '◎',
    },
    cardAssets: {
      unsolvedPreview: {
        alt: 'Unsolved Byzantine coin preview',
        fallback: '◎',
        src: assetUrl('assets/artifacts/byzantine-coin/previews/unsolved.png'),
      },
      solvedPreview: {
        alt: 'Solved Byzantine coin preview',
        fallback: '◎',
        src: assetUrl('assets/artifacts/byzantine-coin/previews/solved.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for Byzantine coin',
      fallback: 'Map',
      src: assetUrl('assets/artifacts/byzantine-coin/map/location.png'),
    },
    location: { x: 24, y: 34 },
  },
  {
    id: 'dorestad-brooch',
    title: 'Dorestad Brooch',
    period: '9th century AD',
    kind: 'text',
    cardTitle: 'Dorestad Brooch',
    prompt: 'The overlapping crosses on the brooch are symbols of ______',
    targetLabel: 'Drop the missing phrase',
    correctAnswer: 'Christianity',
    options: [
      { id: 'royal-power', label: 'royal power' },
      { id: 'roman-law', label: 'Roman law' },
      { id: 'christianity', label: 'Christianity' },
    ],
    explanation: 'The overlapping crosses point to Christianity.',
    artifact: {
      alt: 'Dorestad brooch',
      fallback: '◈',
    },
    cardAssets: {
      unsolvedPreview: {
        alt: 'Unsolved Dorestad brooch preview',
        fallback: '◈',
        src: assetUrl('assets/artifacts/dorestad-brooch/previews/unsolved.png'),
      },
      solvedPreview: {
        alt: 'Solved Dorestad brooch preview',
        fallback: '◈',
        src: assetUrl('assets/artifacts/dorestad-brooch/previews/solved.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for Dorestad brooch',
      fallback: 'Map',
      src: assetUrl('assets/artifacts/dorestad-brooch/map/location.png'),
    },
    location: { x: 34, y: 58 },
  },
  {
    id: 'skeleton',
    title: 'Draw the Burial',
    period: 'Early Middle Ages',
    kind: 'image-high',
    cardTitle: 'A Stone Tomb Unearthed',
    prompt: 'Long press a sketch, then drag it to the missing place in the burial drawing.',
    targetLabel: 'Missing objects',
    correctAnswer: 'All objects placed',
    options: [
      {
        id: 'coin',
        label: 'Coin',
        explanation: 'A coin can belong near the mouth area in this reconstruction.',
        targetId: 'face',
        asset: {
          alt: 'Coin sketch',
          fallback: '◎',
          src: assetUrl('assets/artifacts/stone-tomb/challenges/image-high/options/static/coin.png'),
        },
      },
      {
        id: 'padlock',
        label: 'Padlock',
        explanation: 'A padlock is a later object and does not fit this burial clue.',
        targetId: 'lower-pelvis',
        asset: {
          alt: 'Padlock sketch',
          fallback: '▣',
          src: assetUrl('assets/artifacts/stone-tomb/challenges/image-high/options/static/padlock.png'),
        },
      },
      {
        id: 'crucifix',
        label: 'Crucifix',
        explanation: 'A crucifix points to a different religious context.',
        targetId: 'chest',
        asset: {
          alt: 'Crucifix sketch',
          fallback: '✚',
          src: assetUrl('assets/artifacts/stone-tomb/challenges/image-high/options/static/crucifix.png'),
        },
      },
      {
        id: 'finger-ring',
        label: 'Finger Ring',
        explanation: 'A ring can signal status, but it is not the missing object here.',
        targetId: 'right-pelvis',
        asset: {
          alt: 'Finger ring sketch',
          fallback: '○',
          src: assetUrl('assets/artifacts/stone-tomb/challenges/image-high/options/static/finger_ring.png'),
        },
      },
    ],
    explanation: 'The coin belongs near the mouth area. The journal page now keeps the reconstructed note.',
    artifact: {
      alt: 'Burial skeleton drawing',
      fallback: '☠',
    },
    cardAssets: {
      unsolvedPreview: {
        alt: 'Unsolved stone tomb preview',
        fallback: '☠',
        src: assetUrl('assets/artifacts/stone-tomb/previews/unsolved.png'),
      },
      unsolvedChallenge: {
        alt: 'Unsolved stone tomb challenge card',
        fallback: '☠',
        src: assetUrl('assets/artifacts/stone-tomb/challenges/image-high/unsolved.png'),
      },
      solvedChallenge: {
        alt: 'Solved stone tomb challenge card',
        fallback: '☠',
        src: assetUrl('assets/artifacts/stone-tomb/challenges/image-high/answers/all_solved.png'),
      },
      solvedPreview: {
        alt: 'Solved stone tomb preview',
        fallback: '☠',
        src: assetUrl('assets/artifacts/stone-tomb/previews/solved.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for stone tomb',
      fallback: 'Map',
      src: assetUrl('assets/artifacts/stone-tomb/map/location.png'),
    },
    location: { x: 42, y: 45 },
  },
];
