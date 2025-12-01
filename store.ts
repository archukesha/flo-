import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DayLog, UserProfile, Predictions } from './types';
import { addDays, formatDate, parseDate, diffDays } from './lib/utils';

interface AppState {
  profile: UserProfile;
  logs: Record<string, DayLog>; // Keyed by YYYY-MM-DD
  
  // Actions
  setProfile: (profile: Partial<UserProfile>) => void;
  addLog: (date: string, log: DayLog) => void;
  getPredictions: () => Predictions;
  setSubscription: (status: 'free' | 'pro') => void;
  clearAllData: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  isOnboarded: false,
  cycle: {
    averageLength: 28,
    periodLength: 5,
    lastPeriodStart: formatDate(new Date()),
  },
  privateMode: false,
  subscription: 'free',
  reminderConsent: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      logs: {},

      setProfile: (newProfile) => 
        set((state) => ({ profile: { ...state.profile, ...newProfile } })),

      addLog: (date, log) => 
        set((state) => ({
          logs: {
            ...state.logs,
            [date]: log // Log page saves complete object, replacing old one
          }
        })),

      setSubscription: (status) =>
        set((state) => ({ profile: { ...state.profile, subscription: status } })),

      clearAllData: () => set({ profile: DEFAULT_PROFILE, logs: {} }),

      getPredictions: () => {
        const { cycle } = get().profile;
        const lastStart = parseDate(cycle.lastPeriodStart);
        let nextStart = addDays(lastStart, cycle.averageLength);
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        // If next period is in the past, project forward until future
        // NOTE: In a real app we'd use logs to determine cycle shift, 
        // here we just mathematically project for the UI to not show negative
        if (nextStart < today) {
           // Find the next theoretical cycle start
           const diff = diffDays(lastStart, today);
           const cyclesPassed = Math.ceil(diff / cycle.averageLength);
           nextStart = addDays(lastStart, cyclesPassed * cycle.averageLength);
        }

        const ovulation = addDays(nextStart, -14);
        const fertileStart = addDays(ovulation, -2);
        const fertileEnd = addDays(ovulation, 2);
        
        // Simple day diff calculation
        const diffTime = nextStart.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          nextPeriodStart: formatDate(nextStart),
          ovulation: formatDate(ovulation),
          fertileWindow: [formatDate(fertileStart), formatDate(fertileEnd)],
          daysUntilPeriod: Math.max(0, daysUntil)
        };
      },
    }),
    {
      name: 'flo-plus-storage',
    }
  )
);