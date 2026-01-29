import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Theme } from '@/types';

export interface Command {
  id: string;
  name: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  category: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  theme: Theme;
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ theme, commands, isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const colors = useMemo(
    () =>
      theme === 'dark'
        ? {
            bg: '#0a0f14',
            panel: '#0d1117',
            border: '#1a2332',
            text: '#8899aa',
            textPrimary: '#ffffff',
            accent: '#00d4ff',
            hover: '#1a2332',
          }
        : {
            bg: '#ffffff',
            panel: '#f8fafc',
            border: '#e2e8f0',
            text: '#64748b',
            textPrimary: '#1e293b',
            accent: '#0066cc',
            hover: '#f1f5f9',
          },
    [theme]
  );

  // Load recent commands from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('airlogix-recent-commands');
      if (stored) {
        setRecentCommands(JSON.parse(stored));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter and group commands
  const filteredCommands = useMemo(() => {
    const searchLower = search.toLowerCase();

    if (!search) {
      // Show recent commands first, then all commands grouped by category
      const recent = recentCommands
        .map((id) => commands.find((c) => c.id === id))
        .filter(Boolean) as Command[];

      const allByCategory = commands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) {
          acc[cmd.category] = [];
        }
        acc[cmd.category].push(cmd);
        return acc;
      }, {} as Record<string, Command[]>);

      return { recent, byCategory: allByCategory };
    }

    const matches = commands.filter((cmd) => {
      const searchTargets = [
        cmd.name.toLowerCase(),
        cmd.description?.toLowerCase() || '',
        cmd.category.toLowerCase(),
        ...(cmd.keywords?.map((k) => k.toLowerCase()) || []),
      ];
      return searchTargets.some((target) => target.includes(searchLower));
    });

    // Group by category
    const byCategory = matches.reduce((acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    }, {} as Record<string, Command[]>);

    return { recent: [], byCategory };
  }, [search, commands, recentCommands]);

  // Get flat list for keyboard navigation
  const flatList = useMemo(() => {
    const list: Command[] = [];
    if (filteredCommands.recent.length > 0) {
      list.push(...filteredCommands.recent);
    }
    Object.values(filteredCommands.byCategory).forEach((categoryCommands) => {
      list.push(...categoryCommands);
    });
    return list;
  }, [filteredCommands]);

  // Keep selected index in bounds
  useEffect(() => {
    if (selectedIndex >= flatList.length) {
      setSelectedIndex(Math.max(0, flatList.length - 1));
    }
  }, [flatList.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const executeCommand = useCallback(
    (command: Command) => {
      // Add to recent commands
      const newRecent = [command.id, ...recentCommands.filter((id) => id !== command.id)].slice(0, 5);
      setRecentCommands(newRecent);
      try {
        localStorage.setItem('airlogix-recent-commands', JSON.stringify(newRecent));
      } catch {
        // Ignore errors
      }

      // Execute command
      onClose();
      command.action();
    },
    [recentCommands, onClose]
  );

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatList[selectedIndex]) {
            executeCommand(flatList[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatList, executeCommand, onClose]);

  if (!isOpen) return null;

  let currentIndex = 0;

  return (
    <div className="fixed inset-0 z-[10001] flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-xl rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
      >
        {/* Search Input */}
        <div className="relative border-b" style={{ borderColor: colors.border }}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: colors.text }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="w-full pl-12 pr-4 py-4 bg-transparent text-base outline-none"
            style={{ color: colors.textPrimary }}
          />
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded"
            style={{ backgroundColor: colors.hover, color: colors.text }}
          >
            ESC
          </div>
        </div>

        {/* Command List */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
          {flatList.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: colors.text }}>
                No commands found
              </p>
            </div>
          ) : (
            <>
              {/* Recent Commands */}
              {filteredCommands.recent.length > 0 && (
                <div className="mb-2">
                  <div
                    className="px-4 py-2 text-xs uppercase tracking-wider"
                    style={{ color: colors.text }}
                  >
                    Recent
                  </div>
                  {filteredCommands.recent.map((cmd) => {
                    const index = currentIndex++;
                    return (
                      <CommandItem
                        key={`recent-${cmd.id}`}
                        command={cmd}
                        isSelected={index === selectedIndex}
                        index={index}
                        colors={colors}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      />
                    );
                  })}
                </div>
              )}

              {/* Commands by Category */}
              {Object.entries(filteredCommands.byCategory).map(([category, categoryCommands]) => (
                <div key={category} className="mb-2">
                  <div
                    className="px-4 py-2 text-xs uppercase tracking-wider"
                    style={{ color: colors.text }}
                  >
                    {category}
                  </div>
                  {categoryCommands.map((cmd) => {
                    const index = currentIndex++;
                    return (
                      <CommandItem
                        key={cmd.id}
                        command={cmd}
                        isSelected={index === selectedIndex}
                        index={index}
                        colors={colors}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      />
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-2 text-xs border-t"
          style={{ borderColor: colors.border, color: colors.text }}
        >
          <div className="flex items-center gap-1">
            <kbd
              className="px-1.5 py-0.5 rounded"
              style={{ backgroundColor: colors.hover }}
            >
              Enter
            </kbd>
            <span>to select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd
              className="px-1.5 py-0.5 rounded"
              style={{ backgroundColor: colors.hover }}
            >
              Up/Down
            </kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd
              className="px-1.5 py-0.5 rounded"
              style={{ backgroundColor: colors.hover }}
            >
              Esc
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CommandItemProps {
  command: Command;
  isSelected: boolean;
  index: number;
  colors: Record<string, string>;
  onClick: () => void;
  onMouseEnter: () => void;
}

function CommandItem({ command, isSelected, index, colors, onClick, onMouseEnter }: CommandItemProps) {
  return (
    <button
      data-index={index}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
      style={{
        backgroundColor: isSelected ? colors.accent + '20' : 'transparent',
        borderLeft: isSelected ? `2px solid ${colors.accent}` : '2px solid transparent',
      }}
    >
      {command.icon && (
        <div style={{ color: isSelected ? colors.accent : colors.text }}>
          {command.icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate" style={{ color: colors.textPrimary }}>
          {command.name}
        </div>
        {command.description && (
          <div className="text-xs truncate" style={{ color: colors.text }}>
            {command.description}
          </div>
        )}
      </div>
      {command.shortcut && (
        <div className="flex items-center gap-1">
          {command.shortcut.split('+').map((key, i) => (
            <kbd
              key={i}
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ backgroundColor: colors.hover, color: colors.text }}
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
    </button>
  );
}

// Default commands for the application
export function useDefaultCommands(
  setView: (view: string) => void,
  toggleTheme: () => void,
  theme: Theme
): Command[] {
  return useMemo(
    () => [
      // Navigation
      {
        id: 'nav-flight',
        name: 'Go to Flight View',
        description: 'Switch to Flight View',
        shortcut: 'F1',
        category: 'Navigation',
        keywords: ['fly', 'monitor', 'telemetry'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        ),
        action: () => setView('flight'),
      },
      {
        id: 'nav-plan',
        name: 'Go to Plan View',
        description: 'Mission planning and waypoints',
        shortcut: 'F2',
        category: 'Navigation',
        keywords: ['mission', 'waypoint', 'route'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        ),
        action: () => setView('plan'),
      },
      {
        id: 'nav-configure',
        name: 'Go to Configure View',
        description: 'Vehicle setup and calibration',
        shortcut: 'F3',
        category: 'Navigation',
        keywords: ['setup', 'calibrate', 'params'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        action: () => setView('configure'),
      },
      {
        id: 'nav-analyze',
        name: 'Go to Analyze View',
        description: 'Flight logs and data analysis',
        shortcut: 'F4',
        category: 'Navigation',
        keywords: ['logs', 'replay', 'graphs'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        action: () => setView('analyze'),
      },
      {
        id: 'nav-settings',
        name: 'Go to Settings',
        description: 'Application preferences',
        shortcut: 'F5',
        category: 'Navigation',
        keywords: ['preferences', 'options', 'config'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        ),
        action: () => setView('settings'),
      },

      // Appearance
      {
        id: 'toggle-theme',
        name: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        description: 'Toggle application theme',
        shortcut: 'Ctrl+T',
        category: 'Appearance',
        keywords: ['dark', 'light', 'mode', 'theme'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {theme === 'dark' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            )}
          </svg>
        ),
        action: toggleTheme,
      },
      {
        id: 'fullscreen',
        name: 'Toggle Fullscreen',
        description: 'Enter or exit fullscreen mode',
        shortcut: 'F11',
        category: 'Appearance',
        keywords: ['full', 'screen', 'maximize'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        ),
        action: () => document.documentElement.requestFullscreen?.(),
      },

      // Flight Commands
      {
        id: 'cmd-arm',
        name: 'Arm Vehicle',
        description: 'Arm motors for flight',
        category: 'Flight Commands',
        keywords: ['start', 'enable', 'motors'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        action: () => console.log('Arm vehicle'),
      },
      {
        id: 'cmd-disarm',
        name: 'Disarm Vehicle',
        description: 'Disarm motors',
        category: 'Flight Commands',
        keywords: ['stop', 'disable', 'motors'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ),
        action: () => console.log('Disarm vehicle'),
      },
      {
        id: 'cmd-rtl',
        name: 'Return to Launch',
        description: 'Command vehicle to return home',
        shortcut: 'R',
        category: 'Flight Commands',
        keywords: ['home', 'return', 'rtl'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
        action: () => console.log('RTL'),
      },
      {
        id: 'cmd-land',
        name: 'Land Now',
        description: 'Command immediate landing',
        shortcut: 'L',
        category: 'Flight Commands',
        keywords: ['down', 'descend'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        ),
        action: () => console.log('Land'),
      },
      {
        id: 'cmd-pause',
        name: 'Pause Mission',
        description: 'Hold current position',
        shortcut: 'P',
        category: 'Flight Commands',
        keywords: ['hold', 'loiter', 'stop'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        action: () => console.log('Pause'),
      },

      // Tools
      {
        id: 'tool-connect',
        name: 'Connect Vehicle',
        description: 'Open connection dialog',
        shortcut: 'Ctrl+Shift+C',
        category: 'Tools',
        keywords: ['link', 'serial', 'udp'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        ),
        action: () => console.log('Connect'),
      },
      {
        id: 'tool-screenshot',
        name: 'Take Screenshot',
        description: 'Capture current view',
        shortcut: 'Ctrl+Shift+S',
        category: 'Tools',
        keywords: ['capture', 'image', 'save'],
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        action: () => console.log('Screenshot'),
      },
    ],
    [setView, toggleTheme, theme]
  );
}
