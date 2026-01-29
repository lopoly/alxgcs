import type { Theme } from '@/types';

type CardStatus = 'good' | 'warning' | 'critical';

interface TelemetryCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon?: string;
  status?: CardStatus;
  theme: Theme;
}

export function TelemetryCard({ label, value, unit, icon, status, theme }: TelemetryCardProps) {
  const colors =
    theme === 'dark'
      ? {
          bg: 'rgba(10, 15, 20, 0.9)',
          border: '#1a2332',
          label: '#667788',
          value: '#ffffff',
          unit: '#8899aa',
        }
      : {
          bg: 'rgba(255, 255, 255, 0.95)',
          border: '#e2e8f0',
          label: '#64748b',
          value: '#1e293b',
          unit: '#94a3b8',
        };

  const statusColors: Record<CardStatus, string> = {
    good: theme === 'dark' ? '#00d4ff' : '#0066cc',
    warning: '#ffaa00',
    critical: '#ff4466',
  };

  return (
    <div
      className="px-3 py-2 rounded-lg backdrop-blur-sm border"
      style={{
        backgroundColor: colors.bg,
        borderColor: status ? statusColors[status] : colors.border,
        boxShadow: status === 'critical' ? `0 0 12px ${statusColors.critical}40` : 'none',
      }}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span style={{ color: status ? statusColors[status] : colors.label }}>{icon}</span>
        )}
        <div>
          <div
            style={{
              color: colors.label,
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {label}
          </div>
          <div className="flex items-baseline gap-1">
            <span style={{ color: colors.value, fontSize: '18px', fontWeight: '600' }}>{value}</span>
            <span style={{ color: colors.unit, fontSize: '11px' }}>{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
