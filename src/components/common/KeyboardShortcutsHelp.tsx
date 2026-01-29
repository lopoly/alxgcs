import type { Theme } from '@/types';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ theme, isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const colors =
    theme === 'dark'
      ? {
          bg: 'rgba(10, 15, 20, 0.98)',
          border: '#1a2332',
          text: '#8899aa',
          textPrimary: '#ffffff',
          accent: '#00d4ff',
          keyBg: '#1a2332',
        }
      : {
          bg: 'rgba(255, 255, 255, 0.98)',
          border: '#e2e8f0',
          text: '#64748b',
          textPrimary: '#1e293b',
          accent: '#0066cc',
          keyBg: '#f1f5f9',
        };

  const categories = [...new Set(KEYBOARD_SHORTCUTS.map((s) => s.category))];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: colors.text }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.keyBg)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {categories.map((category) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3
                className="text-xs uppercase tracking-wider mb-3"
                style={{ color: colors.accent }}
              >
                {category}
              </h3>
              <div className="space-y-2">
                {KEYBOARD_SHORTCUTS.filter((s) => s.category === category).map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between">
                    <span style={{ color: colors.text }}>{shortcut.action}</span>
                    <kbd
                      className="px-2 py-1 rounded text-xs font-mono"
                      style={{
                        backgroundColor: colors.keyBg,
                        color: colors.textPrimary,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 border-t text-center"
          style={{ borderColor: colors.border }}
        >
          <span className="text-xs" style={{ color: colors.text }}>
            Press <kbd className="px-1.5 py-0.5 rounded mx-1" style={{ backgroundColor: colors.keyBg }}>?</kbd> anytime to show this help
          </span>
        </div>
      </div>
    </div>
  );
}
