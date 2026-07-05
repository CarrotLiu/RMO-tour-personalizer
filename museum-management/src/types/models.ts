export type Effort = 'low' | 'medium' | 'high';
export type ChallengeFormat = 'text' | 'image';
export type ChallengeStatus = 'draft' | 'edited' | 'approved';

export interface AspectType {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface ArtifactEntry {
  id: string;
  name: string;
  time: string;
  labelText: string;
  photo: string;
  covers: {
    unsolved: string;
    solved: string;
  };
}

export interface ArtifactAiLabel {
  aspects: string[];
  highlight: string;
  confidence: number;
  evidence: string;
}

export interface ChallengeOption {
  label: string;
  image?: string;
}

export interface DraftChallenge {
  id: string;
  artifactId: string;
  format: ChallengeFormat;
  effort: Effort;
  prompt: string;
  options: ChallengeOption[];
  correctAnswer: string;
  explanation: string;
  sketch?: string;
  status: ChallengeStatus;
}

export interface MapPosition {
  x: number;
  y: number;
}

export interface ExhibitionIntro {
  museumName: string;
  museumIntro: string;
  museumWebsite: string;
  exhibitionName: string;
  exhibitionIntro: string;
  exhibitionWebsite: string;
}
