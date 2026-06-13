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
  kind: ChallengeKind;
  cardTitle: string;
  prompt: string;
  targetLabel: string;
  correctAnswer: string;
  options: ChallengeOption[];
  explanation: string;
  artifact: ChallengeAsset;
  capture?: {
    camera: ChallengeAsset;
    preview: ChallengeAsset;
    journalNote: ChallengeAsset;
  };
  location: { x: number; y: number };
};

export const challenges: Challenge[] = [
  {
    id: 'coin',
    title: 'Byzantine Coin',
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
    location: { x: 24, y: 34 },
  },
  {
    id: 'skeleton',
    title: 'Draw the Burial',
    kind: 'image-medium',
    cardTitle: 'A Forgotten Burial',
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
    location: { x: 42, y: 45 },
  },
  {
    id: 'pin',
    title: 'Bronze Age Fashion',
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
    location: { x: 62, y: 55 },
  },
  {
    id: 'pottery',
    title: 'Pottery Making',
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
      src: '/assets/pottery/preview.png',
    },
    capture: {
      camera: {
        alt: 'Camera viewfinder aimed at pottery in the exhibition case',
        fallback: '◯',
        src: '/assets/pottery/camera.png',
      },
      preview: {
        alt: 'Captured pottery photo preview',
        fallback: '◯',
        src: '/assets/pottery/preview.png',
      },
      journalNote: {
        alt: 'Unlocked pottery sketch and note',
        fallback: '◯',
        src: '/assets/pottery/journal-note.png',
      },
    },
    location: { x: 78, y: 68 },
  },
];
