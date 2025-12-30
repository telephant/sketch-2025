// Types for the 2025 Cognitive Release App

export type QuestionId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9';

export interface PressureSourceAnswer {
  selected: string;
  emoji: string;
  percentage: number;
}

export interface AttentionWellAnswer {
  selected: string;
  emoji: string;
  color: string;
  frequency: 'rare' | 'sometimes' | 'often' | 'daily';
}

export interface GrowthSeedAnswer {
  selected: string;
  emoji: string;
  habit?: string;
  duration?: 'short' | 'months' | 'halfYear' | 'fullYear';
}

export interface BiggestChangeAnswer {
  change: string;
  emoji: string;
  oldBelief?: string;
  newBelief?: string;
}

export interface MindsetChangeAnswer {
  selected: string;
  emoji: string;
}

export interface BodyStateAnswer {
  selected: string;
  emoji: string;
}

export interface BestThingAnswer {
  things: string;
  emoji: string;
}

export interface TimeROIAnswer {
  category: string;
  emoji: string;
  score: number;
  chargingSources?: string[];
  drainingSources?: string[];
}

export interface FutureRocketAnswer {
  goal: string;
}

export interface AllAnswers {
  q1?: PressureSourceAnswer;
  q2?: AttentionWellAnswer;
  q3?: GrowthSeedAnswer;
  q4?: BiggestChangeAnswer;
  q5?: MindsetChangeAnswer;
  q6?: BodyStateAnswer;
  q7?: BestThingAnswer;
  q8?: TimeROIAnswer;
  q9?: FutureRocketAnswer;
}

export type AnswerAction =
  | { type: 'SET_Q1'; payload: PressureSourceAnswer }
  | { type: 'SET_Q2'; payload: AttentionWellAnswer }
  | { type: 'SET_Q3'; payload: GrowthSeedAnswer }
  | { type: 'SET_Q4'; payload: BiggestChangeAnswer }
  | { type: 'SET_Q5'; payload: MindsetChangeAnswer }
  | { type: 'SET_Q6'; payload: BodyStateAnswer }
  | { type: 'SET_Q7'; payload: BestThingAnswer }
  | { type: 'SET_Q8'; payload: TimeROIAnswer }
  | { type: 'SET_Q9'; payload: FutureRocketAnswer }
  | { type: 'RESET' };

// Animation configuration types
export interface AnimationConfig {
  duration: number;
  ease: number[] | string;
  delay?: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  emoji?: string;
  color?: string;
  rotation: number;
  rotationSpeed: number;
}

// Question component props
export interface QuestionProps {
  onComplete: () => void;
  onBack?: () => void;
}

// Social energy categories
export interface SocialCategory {
  id: string;
  emoji: string;
  labelKey: string;
}

// ROI categories
export interface ROICategory {
  id: string;
  emoji: string;
  labelKey: string;
  color: string;
}

// Pressure source options
export interface PressureOption {
  id: string;
  emoji: string;
  labelKey: string;
  color: string;
}

// Attention well options
export interface AttentionOption {
  id: string;
  emoji: string;
  labelKey: string;
  color: string;
}

// Growth seed options
export interface GrowthOption {
  id: string;
  emoji: string;
  labelKey: string;
}
