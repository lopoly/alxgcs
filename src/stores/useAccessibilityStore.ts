import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AccessibilityState {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  toggleHighContrast: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      setHighContrast: (enabled) => set({ highContrast: enabled }),
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      setLargeText: (enabled) => set({ largeText: enabled }),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
    }),
    {
      name: 'airlogix-accessibility',
    }
  )
);

// High contrast color overrides
export const highContrastColors = {
  dark: {
    bg: '#000000',
    panel: '#000000',
    border: '#ffffff',
    text: '#ffffff',
    textPrimary: '#ffffff',
    accent: '#00ffff',
    hover: '#333333',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
  },
  light: {
    bg: '#ffffff',
    panel: '#ffffff',
    border: '#000000',
    text: '#000000',
    textPrimary: '#000000',
    accent: '#0000ff',
    hover: '#cccccc',
    success: '#006600',
    warning: '#996600',
    error: '#cc0000',
  },
};

// Helper function to get colors based on theme and contrast mode
export const getThemeColors = (theme: 'dark' | 'light', highContrast: boolean) => {
  if (highContrast) {
    return highContrastColors[theme];
  }

  return theme === 'dark'
    ? {
        bg: '#030508',
        panel: '#0a0f14',
        border: '#1a2332',
        text: '#8899aa',
        textPrimary: '#ffffff',
        accent: '#00d4ff',
        hover: '#1a2332',
        success: '#00ff88',
        warning: '#ffaa00',
        error: '#ff4466',
      }
    : {
        bg: '#f0f4f8',
        panel: '#ffffff',
        border: '#e2e8f0',
        text: '#64748b',
        textPrimary: '#1e293b',
        accent: '#0066cc',
        hover: '#f1f5f9',
        success: '#16a34a',
        warning: '#d97706',
        error: '#dc2626',
      };
};
