export interface NoteInfo {
  id: string;
  name: string; // e.g., "C4", "D4"
  solfege: string; // e.g., "C (Dó)", "D (Ré)"
  freq: number; // Hz
  fingering: {
    thumb: boolean | 'half'; // back thumb hole
    holes: (boolean | 'half')[]; // 7 front holes (1 to 7)
  };
  description: string;
  difficulty: 'Könnyű' | 'Közepes' | 'Haladó';
}

export interface BalloonSkin {
  id: string;
  name: string;
  color: string;
  gradient: string;
  borderColor: string;
  price: number;
  icon: string;
  unlocked: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCoins: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface Song {
  id: string;
  title: string;
  difficulty: 'Kezdő' | 'Közép' | 'Haladó';
  notes: string[]; // note IDs e.g. ['C4', 'D4', 'E4']
  description: string;
  unlocked: boolean;
}

export interface UserProfile {
  coins: number;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  activeSkin: string;
  unlockedSkins: string[];
  achievements: Achievement[];
  completedSongs: string[];
  totalBalloonsPopped: number;
}
