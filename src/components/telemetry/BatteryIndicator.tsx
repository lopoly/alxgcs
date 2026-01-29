import type { Theme } from '@/types';

interface BatteryIndicatorProps {
  percentage: number;
  voltage: number;
  current: number;
  theme: Theme;
}

export function BatteryIndicator({ percentage, voltage, current, theme }: BatteryIndicatorProps) {
  const colors =
    theme === 'dark'
      ? { bg: '#0a0f14', border: '#1a2332', text: '#8899aa', value: '#ffffff' }
      : { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b', value: '#1e293b' };

  const getBatteryColor = (pct: number): string => {
    if (pct > 50) return theme === 'dark' ? '#00d4ff' : '#0066cc';
    if (pct > 25) return '#ffaa00';
    return '#ff4466';
  };

  const batteryColor = getBatteryColor(percentage);

  return (
    <div
      className="p-3 rounded-lg border backdrop-blur-sm"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-12 h-6 rounded border-2 relative"
            style={{ borderColor: batteryColor }}
          >
            <div
              className="absolute inset-0.5 rounded-sm transition-all duration-300"
              style={{
                width: `${percentage}%`,
                backgroundColor: batteryColor,
                opacity: 0.8,
              }}
            />
            <div
              className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-r"
              style={{ backgroundColor: batteryColor }}
            />
          </div>
        </div>
        <div>
          <div style={{ color: batteryColor, fontSize: '18px', fontWeight: 'bold' }}>
            {percentage.toFixed(0)}%
          </div>
          <div style={{ color: colors.text, fontSize: '10px' }}>
            {voltage.toFixed(1)}V • {current.toFixed(1)}A
          </div>
        </div>
      </div>
    </div>
  );
}
