import { useEffect, useCallback } from 'react';
import type { Theme } from '@/types';
import type { FlightCommand } from '@/hooks/useKeyboardShortcuts';

interface CommandDialogProps {
  command: FlightCommand | null;
  theme: Theme;
  onConfirm: () => void;
  onCancel: () => void;
  isArmed: boolean;
}

const commandInfo: Record<FlightCommand['type'], { label: string; description: string; icon: string; danger: boolean }> = {
  arm: { label: 'ARM', description: 'Arm the vehicle motors', icon: '⚡', danger: true },
  disarm: { label: 'DISARM', description: 'Disarm the vehicle motors', icon: '🔒', danger: false },
  rtl: { label: 'RETURN TO LAUNCH', description: 'Return to home position and land', icon: '🏠', danger: false },
  land: { label: 'LAND', description: 'Land at current position', icon: '🛬', danger: false },
  pause: { label: 'PAUSE', description: 'Hold current position', icon: '⏸', danger: false },
  guided: { label: 'GUIDED MODE', description: 'Enable guided flight mode', icon: '🎯', danger: false },
  loiter: { label: 'LOITER', description: 'Circle at current position', icon: '🔄', danger: false },
  auto: { label: 'AUTO MODE', description: 'Resume automatic mission', icon: '▶', danger: false },
};

export function CommandDialog({ command, theme, onConfirm, onCancel, isArmed }: CommandDialogProps) {
  // Handle Enter to confirm, Escape to cancel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [onConfirm, onCancel]
  );

  useEffect(() => {
    if (command) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [command, handleKeyDown]);

  if (!command) return null;

  // Special handling for arm toggle
  const actualCommand = command.type === 'arm' ? (isArmed ? 'disarm' : 'arm') : command.type;
  const info = commandInfo[actualCommand as FlightCommand['type']] || commandInfo[command.type];

  const colors =
    theme === 'dark'
      ? {
          bg: 'rgba(10, 15, 20, 0.95)',
          border: '#1a2332',
          text: '#8899aa',
          textPrimary: '#ffffff',
          accent: '#00d4ff',
          danger: '#ff4466',
          success: '#00ff88',
        }
      : {
          bg: 'rgba(255, 255, 255, 0.98)',
          border: '#e2e8f0',
          text: '#64748b',
          textPrimary: '#1e293b',
          accent: '#0066cc',
          danger: '#dc2626',
          success: '#16a34a',
        };

  const accentColor = info.danger ? colors.danger : colors.accent;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onCancel}
    >
      <div
        className="p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4"
        style={{
          backgroundColor: colors.bg,
          border: `2px solid ${accentColor}`,
          boxShadow: `0 0 30px ${accentColor}40`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="text-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl"
            style={{ backgroundColor: accentColor + '20' }}
          >
            {info.icon}
          </div>
        </div>

        {/* Command Name */}
        <h2
          className="text-xl font-bold text-center mb-2"
          style={{ color: accentColor }}
        >
          {info.label}
        </h2>

        {/* Description */}
        <p className="text-center mb-6" style={{ color: colors.text }}>
          {info.description}
        </p>

        {/* Warning for dangerous commands */}
        {info.danger && (
          <div
            className="p-3 rounded-lg mb-4 flex items-center gap-2"
            style={{ backgroundColor: colors.danger + '10', border: `1px solid ${colors.danger}30` }}
          >
            <span>⚠️</span>
            <span className="text-sm" style={{ color: colors.danger }}>
              This action will arm the motors. Ensure area is clear.
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: theme === 'dark' ? '#1a2332' : '#e2e8f0',
              color: colors.textPrimary,
            }}
          >
            Cancel
            <span className="text-xs ml-2 opacity-60">[Esc]</span>
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: accentColor,
              color: info.danger ? '#ffffff' : '#000000',
            }}
          >
            Confirm
            <span className="text-xs ml-2 opacity-60">[Enter]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
