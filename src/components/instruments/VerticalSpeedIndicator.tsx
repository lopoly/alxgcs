import type { Theme } from '@/types';

interface VerticalSpeedIndicatorProps {
  vsi: number;
  theme: Theme;
}

export function VerticalSpeedIndicator({ vsi, theme }: VerticalSpeedIndicatorProps) {
  const colors =
    theme === 'dark'
      ? {
          bg: '#0a0f14',
          bar: '#1a2332',
          positive: '#00d4ff',
          negative: '#ff4466',
          text: '#8899aa',
        }
      : {
          bg: '#f8fafc',
          bar: '#e2e8f0',
          positive: '#0066cc',
          negative: '#dc2626',
          text: '#64748b',
        };

  const maxVsi = 10;
  const clampedVsi = Math.max(-maxVsi, Math.min(maxVsi, vsi));
  const height = (Math.abs(clampedVsi) / maxVsi) * 60;

  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <span style={{ color: colors.text, fontSize: '10px' }}>VS m/s</span>
      <div className="relative w-8 h-32 rounded" style={{ backgroundColor: colors.bar }}>
        <div
          className="absolute left-0 right-0 top-1/2 h-px"
          style={{ backgroundColor: colors.text, opacity: 0.3 }}
        />
        <div
          className="absolute left-1 right-1 rounded-sm transition-all duration-100"
          style={{
            backgroundColor: vsi >= 0 ? colors.positive : colors.negative,
            height: `${height}px`,
            bottom: vsi >= 0 ? '50%' : 'auto',
            top: vsi < 0 ? '50%' : 'auto',
          }}
        />
      </div>
      <span
        style={{
          color: vsi >= 0 ? colors.positive : colors.negative,
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {vsi >= 0 ? '+' : ''}
        {vsi.toFixed(1)}
      </span>
    </div>
  );
}
