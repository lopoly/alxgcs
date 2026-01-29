import type { Theme } from '@/types';

interface WaypointProgressProps {
  current: number;
  total: number;
  distance: number;
  eta: string;
  theme: Theme;
}

export function WaypointProgress({ current, total, distance, eta, theme }: WaypointProgressProps) {
  const colors =
    theme === 'dark'
      ? {
          bg: '#0a0f14',
          border: '#1a2332',
          text: '#8899aa',
          value: '#ffffff',
          accent: '#00d4ff',
          track: '#1a2332',
        }
      : {
          bg: '#ffffff',
          border: '#e2e8f0',
          text: '#64748b',
          value: '#1e293b',
          accent: '#0066cc',
          track: '#e2e8f0',
        };

  const progress = (current / total) * 100;

  return (
    <div
      className="p-3 rounded-lg border backdrop-blur-sm"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: colors.text, fontSize: '10px', textTransform: 'uppercase' }}>
          Mission Progress
        </span>
        <span style={{ color: colors.value, fontSize: '12px', fontWeight: 'bold' }}>
          WP {current}/{total}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden mb-2"
        style={{ backgroundColor: colors.track }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: colors.accent }}
        />
      </div>
      <div className="flex justify-between">
        <span style={{ color: colors.text, fontSize: '10px' }}>
          <span style={{ color: colors.value }}>{(distance / 1000).toFixed(1)}</span> km remaining
        </span>
        <span style={{ color: colors.text, fontSize: '10px' }}>
          ETA <span style={{ color: colors.accent }}>{eta}</span>
        </span>
      </div>
    </div>
  );
}
