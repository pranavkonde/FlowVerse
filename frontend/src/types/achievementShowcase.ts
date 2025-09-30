export interface Showcase {
  id: string;
  userId: string;
  title: string;
  description: string;
  achievements: ShowcaseAchievement[];
  layout: 'grid' | 'list' | 'timeline';
  theme: ShowcaseTheme;
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShowcaseAchievement {
  id: string;
  achievementId: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  customDescription?: string;
  customStyle?: {
    borderColor?: string;
    backgroundColor?: string;
    glowEffect?: boolean;
    animation?: string;
  };
}

export interface ShowcaseTheme {
  id: string;
  name: string;
  backgroundColor: string;
  backgroundImage?: string;
  borderStyle: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  effects: {
    particles?: boolean;
    glow?: boolean;
    parallax?: boolean;
    animation?: string;
  };
}

export const LAYOUT_OPTIONS = {
  grid: {
    label: 'Grid',
    icon: '▣',
    description: 'Display achievements in a grid layout'
  },
  list: {
    label: 'List',
    icon: '☰',
    description: 'Display achievements in a vertical list'
  },
  timeline: {
    label: 'Timeline',
    icon: '⟶',
    description: 'Display achievements in a chronological timeline'
  }
} as const;

export const ANIMATION_OPTIONS = {
  none: 'No Animation',
  fade: 'Fade In',
  slide: 'Slide In',
  bounce: 'Bounce',
  rotate: 'Rotate',
  pulse: 'Pulse',
  shake: 'Shake'
} as const;

export const BORDER_STYLES = {
  solid: 'Solid',
  dashed: 'Dashed',
  dotted: 'Dotted',
  double: 'Double',
  glow: 'Glowing',
  ornate: 'Ornate'
} as const;
