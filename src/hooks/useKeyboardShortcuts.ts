import { useEffect, useCallback } from 'react';

export interface FlightCommand {
  type: 'arm' | 'disarm' | 'rtl' | 'land' | 'pause' | 'guided' | 'loiter' | 'auto';
}

interface UseKeyboardShortcutsOptions {
  onFlightCommand?: (command: FlightCommand) => void;
  onVehicleSelect?: (index: number) => void;
  onZoom?: (direction: 'in' | 'out') => void;
  onFullscreen?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onFlightCommand,
  onVehicleSelect,
  onZoom,
  onFullscreen,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Flight commands
      if (onFlightCommand) {
        switch (e.key.toLowerCase()) {
          case ' ': // Space - Arm/Disarm toggle
            e.preventDefault();
            onFlightCommand({ type: 'arm' });
            break;
          case 'r': // R - RTL
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              onFlightCommand({ type: 'rtl' });
            }
            break;
          case 'l': // L - Land
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              onFlightCommand({ type: 'land' });
            }
            break;
          case 'p': // P - Pause
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              onFlightCommand({ type: 'pause' });
            }
            break;
          case 'g': // G - Guided
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              onFlightCommand({ type: 'guided' });
            }
            break;
          case 'o': // O - Loiter
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              onFlightCommand({ type: 'loiter' });
            }
            break;
          case 'a': // A - Auto
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              onFlightCommand({ type: 'auto' });
            }
            break;
        }
      }

      // Vehicle selection (1-9)
      if (onVehicleSelect && e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onVehicleSelect(parseInt(e.key) - 1);
      }

      // Zoom controls
      if (onZoom) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          onZoom('in');
        } else if (e.key === '-') {
          e.preventDefault();
          onZoom('out');
        }
      }

      // Fullscreen
      if (onFullscreen && e.key === 'F11') {
        e.preventDefault();
        onFullscreen();
      }
    },
    [enabled, onFlightCommand, onVehicleSelect, onZoom, onFullscreen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = [
  { key: 'Space', action: 'Arm/Disarm', category: 'Flight' },
  { key: 'R', action: 'Return to Launch', category: 'Flight' },
  { key: 'L', action: 'Land', category: 'Flight' },
  { key: 'P', action: 'Pause/Hold', category: 'Flight' },
  { key: 'G', action: 'Guided Mode', category: 'Flight' },
  { key: 'O', action: 'Loiter', category: 'Flight' },
  { key: 'A', action: 'Auto Mode', category: 'Flight' },
  { key: '1-9', action: 'Select Vehicle', category: 'Vehicle' },
  { key: 'F1-F4', action: 'Switch View', category: 'Navigation' },
  { key: 'Tab', action: 'Cycle Views', category: 'Navigation' },
  { key: '+/-', action: 'Zoom In/Out', category: 'Map' },
  { key: 'F11', action: 'Fullscreen', category: 'Window' },
];
