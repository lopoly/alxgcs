import type { Theme } from '@/types';

interface SignalIndicatorProps {
  label: string;
  strength: number;
  theme: Theme;
}

export function SignalIndicator({ label, strength, theme }: SignalIndicatorProps) {
  const colors =
    theme === 'dark'
      ? {
          bg: '#1a2332',
          text: '#8899aa',
          good: '#00d4ff',
          warning: '#ffaa00',
          critical: '#ff4466',
        }
      : {
          bg: '#e2e8f0',
          text: '#64748b',
          good: '#0066cc',
          warning: '#d97706',
          critical: '#dc2626',
        };

  const getColor = (s: number): string => {
    if (s > 70) return colors.good;
    if (s > 40) return colors.warning;
    return colors.critical;
  };

  const bars = 5;
  const signalColor = getColor(strength);

  return (
    <div className="flex items-center gap-2">
      <span style={{ color: colors.text, fontSize: '10px', width: '32px' }}>{label}</span>
      <div className="flex items-end gap-0.5 h-4">
        {[...Array(bars)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 rounded-sm transition-all"
            style={{
              height: `${((i + 1) / bars) * 100}%`,
              backgroundColor: strength > (i / bars) * 100 ? signalColor : colors.bg,
            }}
          />
        ))}
      </div>
      <span style={{ color: signalColor, fontSize: '11px', fontWeight: '600' }}>{strength}%</span>
    </div>
  );
}
