import type { Theme, TelemetryData } from '@/types';
import { AttitudeIndicator, CompassIndicator, VerticalSpeedIndicator } from '@/components/instruments';
import { TelemetryCard, BatteryIndicator, WaypointProgress } from '@/components/telemetry';

interface LeftPanelProps {
  telemetry: TelemetryData;
  theme: Theme;
}

export function LeftPanel({ telemetry, theme }: LeftPanelProps) {
  const colors =
    theme === 'dark'
      ? { bg: '#0a0f14', border: '#1a2332', text: '#8899aa', textPrimary: '#ffffff' }
      : { bg: '#ffffff', border: '#e2e8f0', text: '#64748b', textPrimary: '#1e293b' };

  return (
    <div
      className="w-56 p-3 border-r flex flex-col gap-3 overflow-y-auto scrollbar-thin"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      {/* Instruments */}
      <div className="flex flex-col items-center gap-2">
        <AttitudeIndicator pitch={telemetry.pitch} roll={telemetry.roll} theme={theme} />
        <div className="flex items-center gap-3">
          <CompassIndicator heading={telemetry.heading} theme={theme} />
          <VerticalSpeedIndicator vsi={telemetry.verticalSpeed} theme={theme} />
        </div>
      </div>

      <div className="h-px" style={{ backgroundColor: colors.border }} />

      {/* Battery */}
      <BatteryIndicator
        percentage={telemetry.battery}
        voltage={telemetry.voltage}
        current={telemetry.current}
        theme={theme}
      />

      {/* Mission Progress */}
      <WaypointProgress
        current={telemetry.nextWaypoint}
        total={telemetry.totalWaypoints}
        distance={telemetry.distance}
        eta={telemetry.eta}
        theme={theme}
      />

      <div className="h-px" style={{ backgroundColor: colors.border }} />

      {/* Quick Telemetry Cards */}
      <div className="grid grid-cols-2 gap-2">
        <TelemetryCard
          label="GND SPD"
          value={Math.round(telemetry.groundSpeed)}
          unit="km/h"
          theme={theme}
        />
        <TelemetryCard
          label="AIR SPD"
          value={Math.round(telemetry.airSpeed)}
          unit="km/h"
          theme={theme}
        />
        <TelemetryCard
          label="Throttle"
          value={Math.round(telemetry.throttle)}
          unit="%"
          theme={theme}
        />
        <TelemetryCard
          label="Home"
          value={(telemetry.homeDistance / 1000).toFixed(1)}
          unit="km"
          theme={theme}
        />
      </div>

      <div className="h-px" style={{ backgroundColor: colors.border }} />

      {/* Weather Info */}
      <div
        className="p-2 rounded-lg text-xs"
        style={{ backgroundColor: theme === 'dark' ? '#0d1117' : '#f8fafc' }}
      >
        <div className="flex justify-between mb-1" style={{ color: colors.text }}>
          <span>Wind</span>
          <span style={{ color: colors.textPrimary }}>
            {telemetry.windSpeed} m/s @ {telemetry.windDir}°
          </span>
        </div>
        <div className="flex justify-between" style={{ color: colors.text }}>
          <span>Temp</span>
          <span style={{ color: telemetry.temperature < 0 ? '#00d4ff' : '#ff4466' }}>
            {telemetry.temperature}°C
          </span>
        </div>
      </div>
    </div>
  );
}
