import { create } from 'zustand';

import type { OrbStateValue } from '@/constants/vela-colors';

interface OrbStore {
  state: OrbStateValue;
  setState: (s: OrbStateValue) => void;
}

export const useOrbStore = create<OrbStore>((set) => ({
  state: 'idle',
  setState: (s) => set({ state: s }),
}));
