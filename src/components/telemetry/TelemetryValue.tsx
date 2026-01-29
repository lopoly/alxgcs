import { useMemo } from 'react';
import type { Theme } from '@/types';

type TelemetrySize = 'sm' | 'md' | 'lg' | 'xl';
type TelemetryStatus = 'normal' | 'warning' | 'critical';
type TelemetryTrend = 'up' | 'down' | 'stable';

interface TelemetryValueProps {
  label: string;
  value: number | string;
  unit?: string;
  precision?: number;
  trend?: TelemetryTrend;
  status?: TelemetryStatus;
  size?: TelemetrySize;
  theme?: Theme;
  accentColor?: string;
}

export function TelemetryValue({
  label,
  value,
  unit,
  precision = 1,
  trend,
  status = 'normal',
  size = 'md',
  theme = 'dark',
  accentColor,
}: TelemetryValueProps) {
  const colors = useMemo(() => theme === 'dark'
    ? {
        label: '#667788',
        value: '#ffffff',
        unit: '#8899aa',
        normal: '#00d4ff',
        warning: '#ffaa00',
        critical: '#ff4466',
        trendUp: '#00ff88',
        trendDown: '#ff4466',
      }
    : {
        label: '#94a3b8',
        value: '#1e293b',
        unit: '#64748b',
        normal: '#0066cc',
        warning: '#d97706',
        critical: '#dc2626',
        trendUp: '#16a34a',
        trendDown: '#dc2626',
      }, [theme]);

  const sizes = {
    sm: { label: '9px', value: '16px', unit: '10px' },
    md: { label: '10px', value: '20px', unit: '11px' },
    lg: { label: '11px', value: '28px', unit: '12px' },
    xl: { label: '12px', value: '36px', unit: '14px' },
  };

  const sizeStyles = sizes[size];
  const statusColor = status === 'warning' ? colors.warning : status === 'critical' ? colors.critical : colors.normal;
  const displayColor = accentColor || statusColor;

  const formattedValue = typeof value === 'number' ? value.toFixed(precision) : value;

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : null;
  const trendColor = trend === 'up' ? colors.trendUp : trend === 'down' ? colors.trendDown : colors.value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span
        style={{
          fontSize: sizeStyles.label,
          fontWeight: 500,
          color: colors.label,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span
          style={{
            fontSize: sizeStyles.value,
            fontWeight: 600,
            color: displayColor,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {formattedValue}
        </span>
        {unit && (
          <span
            style={{
              fontSize: sizeStyles.unit,
              color: colors.unit,
            }}
          >
            {unit}
          </span>
        )}
        {trendIcon && (
          <span
            style={{
              fontSize: sizeStyles.unit,
              color: trendColor,
              fontWeight: 600,
            }}
          >
            {trendIcon}
          </span>
        )}
      </div>
    </div>
  );
}
