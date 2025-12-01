export type SymptomKey = 'pain' | 'cramps' | 'mood' | 'fatigue' | 'headache' | 'libido' | 'discharge' | 'sleep' | 'water' | 'sex' | 'notes';

export interface DayLog {
  date: string; // YYYY-MM-DD
  menstruation: {
    active: boolean;
    intensity?: 1 | 2 | 3 | 4; // 1=Light, 2=Medium, 3=Heavy, 4=Very Heavy
    dischargeColor?: string;
  };
  symptoms: Record<string, number>; // key: intensity (1-3)
  mood: string | null;
  sleep: number | null; // 0-24
  water: number | null; // 0-20
  sex: {
    active: boolean;
    contraception?: string | null;
    discomfort?: boolean;
  };
  notes: string | null;
  lastModified: number;
}

export interface CycleParams {
  averageLength: number; // 21–45
  periodLength: number;  // 1–8
  lastPeriodStart: string; // YYYY-MM-DD
}

export interface Predictions {
  nextPeriodStart: string;
  ovulation?: string;
  fertileWindow?: [string, string];
  daysUntilPeriod: number;
}

export interface UserProfile {
  isOnboarded: boolean;
  goal?: 'regularity' | 'conception' | 'wellbeing';
  cycle: CycleParams;
  privateMode: boolean;
  subscription: 'free' | 'pro';
  reminderConsent?: boolean;
}

export interface AdviceCard {
  id: string;
  title: string;
  preview: string;
  tags: string[];
  isPro: boolean;
}