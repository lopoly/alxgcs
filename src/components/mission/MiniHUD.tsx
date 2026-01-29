import type { Theme, TelemetryData } from '@/types';

interface MiniHUDProps {
  telemetry: TelemetryData;
  theme: Theme;
  showExtended?: boolean;
}

const formatHeading = (deg: number) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return directions[index];
};

export function MiniHUD({ telemetry, theme, showExtended = true }: MiniHUDProps) {
  const colors =
    theme === 'dark'
      ? {
          bg: 'rgba(10, 15, 20, 0.85)',
          border: 'rgba(26, 35, 50, 0.8)',
          label: '#667788',
          altitude: '#00d4ff',
          speed: '#00ff88',
          heading: '#ffaa00',
          vs: '#ff88ff',
          distance: '#00d4ff',
        }
      : {
          bg: 'rgba(255, 255, 255, 0.9)',
          border: 'rgba(226, 232, 240, 0.8)',
          label: '#94a3b8',
          altitude: '#0066cc',
          speed: '#16a34a',
          heading: '#d97706',
          vs: '#9333ea',
          distance: '#0066cc',
        };

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-1"
      style={{
        backgroundColor: colors.bg,
        fontFamily: "'JetBrains Mono', monospace",
        border: `1px solid ${colors.border}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Altitude */}
      <div className="text-center px-3">
        <div style={{ color: colors.label, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ALT</div>
        <div className="flex items-baseline justify-center gap-1">
          <span style={{ color: colors.altitude, fontSize: '22px', fontWeight: 700 }}>
            {Math.round(telemetry.altitude)}
          </span>
          <span style={{ color: colors.label, fontSize: '10px' }}>m</span>
        </div>
      </div>

      <div className="w-px h-10" style={{ backgroundColor: colors.label, opacity: 0.2 }} />

      {/* Ground Speed */}
      <div className="text-center px-3">
        <div style={{ color: colors.label, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GS</div>
        <div className="flex items-baseline justify-center gap-1">
          <span style={{ color: colors.speed, fontSize: '22px', fontWeight: 700 }}>
            {Math.round(telemetry.speed)}
          </span>
          <span style={{ color: colors.label, fontSize: '10px' }}>km/h</span>
        </div>
      </div>

      <div className="w-px h-10" style={{ backgroundColor: colors.label, opacity: 0.2 }} />

      {/* Heading */}
      <div className="text-center px-3">
        <div style={{ color: colors.label, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>HDG</div>
        <div className="flex items-baseline justify-center gap-1">
          <span style={{ color: colors.heading, fontSize: '22px', fontWeight: 700 }}>
            {Math.round(telemetry.heading)}°
          </span>
          <span style={{ color: colors.label, fontSize: '10px' }}>{formatHeading(telemetry.heading)}</span>
        </div>
      </div>

      {/* Vertical Speed (Extended) */}
      {showExtended && (
        <>
          <div className="w-px h-10" style={{ backgroundColor: colors.label, opacity: 0.2 }} />
          <div className="text-center px-3">
            <div style={{ color: colors.label, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>VS</div>
            <div className="flex items-baseline justify-center gap-1">
              <span style={{ color: colors.vs, fontSize: '22px', fontWeight: 700 }}>
                {telemetry.verticalSpeed >= 0 ? '+' : ''}{telemetry.verticalSpeed.toFixed(1)}
              </span>
              <span style={{ color: colors.label, fontSize: '10px' }}>m/s</span>
            </div>
          </div>
        </>
      )}

      {/* Distance to waypoint (Extended) */}
      {showExtended && telemetry.distanceToWaypoint > 0 && (
        <>
          <div className="w-px h-10" style={{ backgroundColor: colors.label, opacity: 0.2 }} />
          <div
            className="text-center px-3 py-1 ml-1 rounded-lg"
            style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0, 102, 204, 0.1)' }}
          >
            <div style={{ color: colors.label, fontSize: '9px', textTransform: 'uppercase' }}>
              WP{telemetry.nextWaypoint}
            </div>
            <div style={{ color: colors.distance, fontSize: '14px', fontWeight: 600 }}>
              {telemetry.distanceToWaypoint >= 1000
                ? `${(telemetry.distanceToWaypoint / 1000).toFixed(1)} km`
                : `${Math.round(telemetry.distanceToWaypoint)} m`
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
}
