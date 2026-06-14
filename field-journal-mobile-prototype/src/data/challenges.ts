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
      src: assetUrl('assets/pottery/unsolved_preview.png'),
    },
    cardAssets: {
      unsolvedPreview: {
        alt: 'Unsolved pottery preview',
        fallback: '◯',
        src: assetUrl('assets/pottery/unsolved_preview.png'),
      },
      solvedPreview: {
        alt: 'Solved pottery preview',
        fallback: '◯',
        src: assetUrl('assets/pottery/solved_preview.png'),
      },
      solvedChallenge: {
        alt: 'Solved pottery challenge card',
        fallback: '◯',
        src: assetUrl('assets/pottery/solved_challenge.png'),
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
        src: assetUrl('assets/pottery/solved_challenge.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for pottery making',
      fallback: 'Map',
      src: assetUrl('assets/map/pottery_map.png'),
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
        label: 'Hair pin',
        explanation: 'This looks close, but the cloak clue asks for a fastening pin.',
        asset: { alt: 'Hair pin sketch', fallback: '|' },
      },
      {
        id: 'knife',
        label: 'A knife for cutting mustache',
        explanation: 'A knife would be useful elsewhere, but not for holding a cloak.',
        asset: { alt: 'Small knife sketch', fallback: '╱' },
      },
      {
        id: 'cloak-pin',
        label: 'A pin for holding cloak',
        explanation: 'The pin fastens the cloak and completes the clothing reconstruction.',
        asset: { alt: 'Cloak pin sketch', fallback: '⌁' },
      },
      {
        id: 'earrings',
        label: 'A pair of rings that decorates human ears',
        explanation: 'Rings decorate the body, but they do not solve the cloak gap.',
        asset: { alt: 'Pair of rings sketch', fallback: '∞' },
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
        src: assetUrl('assets/bronze_age/unsolved_preview.png'),
      },
      unsolvedChallenge: {
        alt: 'Unsolved Bronze Age fashion challenge card',
        fallback: '⌁',
        src: assetUrl('assets/bronze_age/unsolved_challenge.png'),
      },
      solvedPreview: {
        alt: 'Solved Bronze Age fashion preview',
        fallback: '⌁',
        src: assetUrl('assets/bronze_age/solved_preview.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for Bronze Age fashion',
      fallback: 'Map',
      src: assetUrl('assets/map/bronze_age_map.png'),
    },
    location: { x: 62, y: 55 },
  },
  {
    id: 'ommerschans-sword',
    title: 'Sword of Ommerschans',
    period: '1500–1350 BC',
    kind: 'text',
    cardTitle: 'Sword of Ommerschans',
    prompt: 'The Sword of Ommerschans was probably made as a ______ rather than for ordinary fighting.',
    targetLabel: 'Drop the missing phrase',
    correctAnswer: 'ceremonial object',
    options: [
      { id: 'ceremonial', label: 'ceremonial object' },
      { id: 'farm-tool', label: 'farm tool' },
      { id: 'toy', label: 'child toy' },
    ],
    explanation: 'Its size and form suggest it carried symbolic power rather than everyday battlefield use.',
    artifact: {
      alt: 'Sword of Ommerschans',
      fallback: '†',
    },
    cardAssets: {
      unsolvedPreview: {
        alt: 'Unsolved Sword of Ommerschans preview',
        fallback: '†',
        src: assetUrl('assets/Ommerschans%20_Sword/unsolved_preview.png'),
      },
      solvedPreview: {
        alt: 'Solved Sword of Ommerschans preview',
        fallback: '†',
        src: assetUrl('assets/Ommerschans%20_Sword/solved_preview.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for Sword of Ommerschans',
      fallback: 'Map',
      src: assetUrl('assets/map/sword_map.png'),
    },
    location: { x: 54, y: 42 },
  },
  {
    id: 'coin',
    title: 'Byzantine Coin',
    period: '7th century AD',
    kind: 'text',
    cardTitle: 'Jewelry and Status Symbols',
    prompt: 'The Byzantine coins were probably used as ______ by Frisian kings.',
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
        src: assetUrl('assets/coin/unsolved_preview.png'),
      },
      solvedPreview: {
        alt: 'Solved Byzantine coin preview',
        fallback: '◎',
        src: assetUrl('assets/coin/solved_preview.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for Byzantine coin',
      fallback: 'Map',
      src: assetUrl('assets/map/coin_map.png'),
    },
    location: { x: 24, y: 34 },
  },
  {
    id: 'dorestad-brooch',
    title: 'Dorestad Brooch',
    period: '9th century AD',
    kind: 'text',
    cardTitle: 'Dorestad Brooch',
    prompt: 'A brooch like this was worn to fasten clothing and show ______.',
    targetLabel: 'Drop the missing phrase',
    correctAnswer: 'status and style',
    options: [
      { id: 'status-style', label: 'status and style' },
      { id: 'cooking-skill', label: 'cooking skill' },
      { id: 'ship-speed', label: 'ship speed' },
    ],
    explanation: 'Decorated brooches could be useful fasteners and visible signs of identity or status.',
    artifact: {
      alt: 'Dorestad brooch',
      fallback: '◈',
    },
    cardAssets: {
      unsolvedPreview: {
        alt: 'Unsolved Dorestad brooch preview',
        fallback: '◈',
        src: assetUrl('assets/brooch/unsolved_preview.png'),
      },
      solvedPreview: {
        alt: 'Solved Dorestad brooch preview',
        fallback: '◈',
        src: assetUrl('assets/brooch/solved_preview.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for Dorestad brooch',
      fallback: 'Map',
      src: assetUrl('assets/map/brooch_map.png'),
    },
    location: { x: 34, y: 58 },
  },
  {
    id: 'skeleton',
    title: 'Draw the Burial',
    period: 'Early Middle Ages',
    kind: 'image-medium',
    cardTitle: 'A Stone Tomb Unearthed',
    prompt: 'Long press a sketch, then drag it to the missing place in the burial drawing.',
    targetLabel: 'Missing object',
    correctAnswer: 'Coin',
    options: [
      {
        id: 'coin',
        label: 'Coin',
        explanation: 'A coin can belong near the mouth area in this reconstruction.',
        asset: { alt: 'Coin sketch', fallback: '◎' },
      },
      {
        id: 'padlock',
        label: 'Padlock',
        explanation: 'A padlock is a later object and does not fit this burial clue.',
        asset: { alt: 'Padlock sketch', fallback: '▣' },
      },
      {
        id: 'crucifix',
        label: 'Crucifix',
        explanation: 'A crucifix points to a different religious context.',
        asset: { alt: 'Crucifix sketch', fallback: '✚' },
      },
      {
        id: 'ring',
        label: 'Finger Ring',
        explanation: 'A ring can signal status, but it is not the missing object here.',
        asset: { alt: 'Finger ring sketch', fallback: '○' },
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
        src: assetUrl('assets/stone_tomb/unsolved_preview.png'),
      },
      unsolvedChallenge: {
        alt: 'Unsolved stone tomb challenge card',
        fallback: '☠',
        src: assetUrl('assets/stone_tomb/unsolved_challenge.png'),
      },
      solvedPreview: {
        alt: 'Solved stone tomb preview',
        fallback: '☠',
        src: assetUrl('assets/stone_tomb/solved_preview.png'),
      },
    },
    mapAsset: {
      alt: 'Map location for stone tomb',
      fallback: 'Map',
      src: assetUrl('assets/map/tomb_map.png'),
    },
    location: { x: 42, y: 45 },
  },
];
