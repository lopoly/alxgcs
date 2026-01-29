import { create } from 'zustand';
import type { ViewType } from '@/types';

interface ViewState {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

export const useViewStore = create<ViewState>()((set) => ({
  currentView: 'flight',
  setView: (view) => set({ currentView: view }),
}));
