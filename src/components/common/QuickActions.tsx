import { useState } from 'react';
import type { Theme } from '@/types';

interface QuickActionsProps {
  theme: Theme;
}

interface Action {
  icon: string;
  label: string;
  color: string;
}

const actions: Action[] = [
  { icon: '⏸', label: 'Pause', color: '#ffaa00' },
  { icon: '🏠', label: 'RTL', color: '#ff4466' },
  { icon: '🎯', label: 'Loiter', color: '#8855ff' },
  { icon: '📍', label: 'Go To', color: '#00d4ff' },
  { icon: '📷', label: 'Camera', color: '#00ff88' },
];

export function QuickActions({ theme }: QuickActionsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const colors =
    theme === 'dark'
      ? { bg: '#0a0f14', border: '#1a2332', text: '#8899aa', hover: '#1a2332' }
      : { bg: '#ffffff', border: '#e2e8f0', text: '#64748b', hover: '#f1f5f9' };

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg border"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      {actions.map((action, i) => (
        <button
          key={i}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-md transition-colors cursor-pointer"
          style={{
            color: colors.text,
            backgroundColor: hoveredIndex === i ? colors.hover : 'transparent',
          }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <span style={{ fontSize: '18px' }}>{action.icon}</span>
          <span style={{ fontSize: '9px', color: action.color }}>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
