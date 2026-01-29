import { create } from 'zustand';
import type { FlightCommand } from '@/hooks/useKeyboardShortcuts';

interface PendingCommand {
  command: FlightCommand;
  timestamp: number;
}

interface CommandState {
  pendingCommand: PendingCommand | null;
  commandHistory: Array<{ command: FlightCommand; timestamp: number; status: 'success' | 'failed' }>;
  isArmed: boolean;

  // Actions
  setPendingCommand: (command: FlightCommand | null) => void;
  confirmCommand: () => void;
  cancelCommand: () => void;
  addToHistory: (command: FlightCommand, status: 'success' | 'failed') => void;
  setArmed: (armed: boolean) => void;
}

export const useCommandStore = create<CommandState>((set, get) => ({
  pendingCommand: null,
  commandHistory: [],
  isArmed: true, // Mock: starts armed for demo

  setPendingCommand: (command) =>
    set({
      pendingCommand: command ? { command, timestamp: Date.now() } : null,
    }),

  confirmCommand: () => {
    const { pendingCommand, isArmed } = get();
    if (!pendingCommand) return;

    // Execute the command (mock implementation)
    const { command } = pendingCommand;

    if (command.type === 'arm') {
      set({ isArmed: !isArmed });
    }

    // Add to history
    get().addToHistory(command, 'success');

    // Clear pending
    set({ pendingCommand: null });
  },

  cancelCommand: () => set({ pendingCommand: null }),

  addToHistory: (command, status) =>
    set((state) => ({
      commandHistory: [
        { command, timestamp: Date.now(), status },
        ...state.commandHistory.slice(0, 49), // Keep last 50
      ],
    })),

  setArmed: (armed) => set({ isArmed: armed }),
}));
