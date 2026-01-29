import type { Theme, TelemetryData } from '@/types';
import { FlightModeBadge } from '@/components/common';
import { SignalIndicator } from '@/components/telemetry';

interface HeaderProps {
  telemetry: TelemetryData;
  theme: Theme;
  onThemeToggle: () => void;
}

export function Header({ telemetry, theme, onThemeToggle }: HeaderProps) {
  const colors =
    theme === 'dark'
      ? {
          bg: '#0a0f14',
          border: '#1a2332',
          text: '#8899aa',
          textPrimary: '#ffffff',
          accent: '#00d4ff',
        }
      : {
          bg: '#ffffff',
          border: '#e2e8f0',
          text: '#64748b',
          textPrimary: '#1e293b',
          accent: '#0066cc',
        };

  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <div className="flex items-center gap-4">
        {/* Logo and Vehicle Name */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: colors.accent + '20' }}
          >
            <span style={{ color: colors.accent, fontWeight: 'bold', fontSize: '14px' }}>A</span>
          </div>
          <div>
            <div style={{ color: colors.textPrimary, fontWeight: '600', fontSize: '14px' }}>
              GOR-01
            </div>
            <div style={{ color: colors.text, fontSize: '10px' }}>Airlogix GCS v1.0</div>
          </div>
        </div>
        <FlightModeBadge mode={telemetry.flightMode} armed={telemetry.armed} />
      </div>

      <div className="flex items-center gap-4">
        <SignalIndicator label="RC" strength={telemetry.signalStrength} theme={theme} />
        <SignalIndicator label="VTX" strength={85} theme={theme} />
        <div className="flex items-center gap-1" style={{ color: colors.text, fontSize: '11px' }}>
          <span>🛰</span>
          <span
            style={{
              color: theme === 'dark' ? '#00ff88' : '#16a34a',
              fontWeight: '600',
            }}
          >
            {telemetry.gpsCount}
          </span>
          <span>GPS</span>
        </div>
        <div style={{ color: colors.text, fontSize: '11px' }}>🕐 {telemetry.flightTime}</div>
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: theme === 'dark' ? '#1a2332' : '#e2e8f0',
            color: theme === 'dark' ? '#ffffff' : '#1e293b',
          }}
          onClick={onThemeToggle}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </div>
  );
}
