import type { Theme, TelemetryData } from '@/types';

interface MiniHUDProps {
  telemetry: TelemetryData;
  theme: Theme;
}

export function MiniHUD({ telemetry, theme }: MiniHUDProps) {
  const colors =
    theme === 'dark'
      ? { bg: 'rgba(0,0,0,0.6)', text: '#00d4ff', label: '#667788' }
      : { bg: 'rgba(255,255,255,0.85)', text: '#0066cc', label: '#64748b' };

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full backdrop-blur-md flex items-center gap-6"
      style={{ backgroundColor: colors.bg, fontFamily: "'JetBrains Mono', monospace" }}
    >
      <div className="text-center">
        <div style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold' }}>
          {Math.round(telemetry.altitude)}
        </div>
        <div style={{ color: colors.label, fontSize: '9px' }}>ALT m</div>
      </div>
      <div className="w-px h-8" style={{ backgroundColor: colors.label, opacity: 0.3 }} />
      <div className="text-center">
        <div style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold' }}>
          {Math.round(telemetry.speed)}
        </div>
        <div style={{ color: colors.label, fontSize: '9px' }}>SPD km/h</div>
      </div>
      <div className="w-px h-8" style={{ backgroundColor: colors.label, opacity: 0.3 }} />
      <div className="text-center">
        <div style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold' }}>
          {Math.round(telemetry.heading)}°
        </div>
        <div style={{ color: colors.label, fontSize: '9px' }}>HDG</div>
      </div>
    </div>
  );
}
