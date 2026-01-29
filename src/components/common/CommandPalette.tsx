import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Theme, ViewType } from '@/types';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  category: 'navigation' | 'flight' | 'mission' | 'settings' | 'help';
  icon?: string;
  action: () => void;
}

interface CommandPaletteProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewType) => void;
  onFlightCommand?: (cmd: string) => void;
}

export function CommandPalette({
  theme,
  isOpen,
  onClose,
  onNavigate,
  onFlightCommand,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const colors = useMemo(() => theme === 'dark'
    ? {
        bg: '#0a0f14',
        overlay: 'rgba(0, 0, 0, 0.7)',
        border: '#1a2332',
        input: '#0d1117',
        text: '#ffffff',
        textMuted: '#667788',
        accent: '#00d4ff',
        hover: '#1a2332',
        category: '#8899aa',
      }
    : {
        bg: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.4)',
        border: '#e2e8f0',
        input: '#f8fafc',
        text: '#1e293b',
        textMuted: '#94a3b8',
        accent: '#0066cc',
        hover: '#f1f5f9',
        category: '#64748b',
      }, [theme]);

  const commands: Command[] = useMemo(() => [
    // Navigation
    { id: 'nav-flight', label: 'Go to Flight View', shortcut: 'F1', category: 'navigation', icon: '✈️', action: () => { onNavigate('flight'); onClose(); } },
    { id: 'nav-plan', label: 'Go to Plan View', shortcut: 'F2', category: 'navigation', icon: '🗺️', action: () => { onNavigate('plan'); onClose(); } },
    { id: 'nav-configure', label: 'Go to Configure View', shortcut: 'F3', category: 'navigation', icon: '⚙️', action: () => { onNavigate('configure'); onClose(); } },
    { id: 'nav-analyze', label: 'Go to Analyze View', shortcut: 'F4', category: 'navigation', icon: '📊', action: () => { onNavigate('analyze'); onClose(); } },
    // Flight commands
    { id: 'flight-arm', label: 'Arm Vehicle', shortcut: 'A', category: 'flight', icon: '🔒', action: () => { onFlightCommand?.('arm'); onClose(); } },
    { id: 'flight-disarm', label: 'Disarm Vehicle', shortcut: 'D', category: 'flight', icon: '🔓', action: () => { onFlightCommand?.('disarm'); onClose(); } },
    { id: 'flight-rtl', label: 'Return to Launch', shortcut: 'R', category: 'flight', icon: '🏠', action: () => { onFlightCommand?.('rtl'); onClose(); } },
    { id: 'flight-land', label: 'Land Now', shortcut: 'L', category: 'flight', icon: '🛬', action: () => { onFlightCommand?.('land'); onClose(); } },
    { id: 'flight-loiter', label: 'Loiter / Hold Position', category: 'flight', icon: '⏸️', action: () => { onFlightCommand?.('loiter'); onClose(); } },
    { id: 'flight-auto', label: 'Start Auto Mission', category: 'flight', icon: '▶️', action: () => { onFlightCommand?.('auto'); onClose(); } },
    { id: 'flight-guided', label: 'Enter Guided Mode', shortcut: 'G', category: 'flight', icon: '🎯', action: () => { onFlightCommand?.('guided'); onClose(); } },
    // Mission
    { id: 'mission-upload', label: 'Upload Mission', category: 'mission', icon: '📤', action: () => { onClose(); } },
    { id: 'mission-download', label: 'Download Mission', category: 'mission', icon: '📥', action: () => { onClose(); } },
    { id: 'mission-clear', label: 'Clear Mission', category: 'mission', icon: '🗑️', action: () => { onClose(); } },
    { id: 'mission-save', label: 'Save Mission to File', shortcut: '⌘S', category: 'mission', icon: '💾', action: () => { onClose(); } },
    // Settings
    { id: 'settings-theme', label: 'Toggle Theme', shortcut: 'T', category: 'settings', icon: '🌓', action: () => { onClose(); } },
    { id: 'settings-fullscreen', label: 'Toggle Fullscreen', shortcut: 'F11', category: 'settings', icon: '⛶', action: () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); onClose(); } },
    { id: 'settings-units', label: 'Change Units', category: 'settings', icon: '📏', action: () => { onClose(); } },
    // Help
    { id: 'help-shortcuts', label: 'Keyboard Shortcuts', shortcut: '?', category: 'help', icon: '⌨️', action: () => { onClose(); } },
    { id: 'help-docs', label: 'Open Documentation', category: 'help', icon: '📚', action: () => { onClose(); } },
    { id: 'help-about', label: 'About ALXGCS', category: 'help', icon: 'ℹ️', action: () => { onClose(); } },
  ], [onNavigate, onFlightCommand, onClose]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const lowerSearch = search.toLowerCase();
    return commands.filter(
      cmd => cmd.label.toLowerCase().includes(lowerSearch) ||
             cmd.category.toLowerCase().includes(lowerSearch)
    );
  }, [commands, search]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    flight: 'Flight Commands',
    mission: 'Mission',
    settings: 'Settings',
    help: 'Help',
  };

  if (!isOpen) return null;

  let globalIndex = 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        backgroundColor: colors.overlay,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: colors.bg,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: colors.textMuted, fontSize: '18px' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              autoFocus
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                color: colors.text,
              }}
            />
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: colors.hover,
                color: colors.textMuted,
                fontSize: '12px',
              }}
            >
              ESC
            </span>
          </div>
        </div>

        {/* Command List */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>
              No commands found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: colors.category,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {categoryLabels[category] || category}
                </div>
                {cmds.map((cmd) => {
                  const index = globalIndex++;
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => cmd.action()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? colors.hover : 'transparent',
                        border: isSelected ? `1px solid ${colors.accent}` : '1px solid transparent',
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '16px' }}>{cmd.icon}</span>
                        <span style={{ color: colors.text, fontSize: '14px' }}>{cmd.label}</span>
                      </div>
                      {cmd.shortcut && (
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: colors.hover,
                            color: colors.textMuted,
                            fontSize: '11px',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {cmd.shortcut}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: colors.textMuted }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>esc Close</span>
          </div>
          <span style={{ fontSize: '11px', color: colors.textMuted }}>
            {filteredCommands.length} commands
          </span>
        </div>
      </div>
    </div>
  );
}
