import type { Theme, TelemetryData, SystemHealth } from '@/types';
import { TelemetryCard } from '@/components/telemetry';
import { SystemStatus, WarningBanner } from '@/components/common';
import { VideoFeed } from '@/components/mission';

interface RightPanelProps {
  telemetry: TelemetryData;
  theme: Theme;
}

const defaultHealth: SystemHealth = {
  autopilot: 'ok',
  gps: 'ok',
  compass: 'ok',
  barometer: 'ok',
  ekf: 'ok',
  gyro: 'ok',
  accel: 'ok',
  mag: 'ok',
};

export function RightPanel({ telemetry, theme }: RightPanelProps) {
  const colors =
    theme === 'dark'
      ? { bg: '#0a0f14', border: '#1a2332' }
      : { bg: '#ffffff', border: '#e2e8f0' };

  const getVoltageStatus = (): 'good' | 'warning' | 'critical' | undefined => {
    if (telemetry.voltage < 22) return 'critical';
    if (telemetry.voltage < 23) return 'warning';
    return undefined;
  };

  const getMahStatus = (): 'good' | 'warning' | 'critical' | undefined => {
    if (telemetry.mah > 4000) return 'warning';
    return undefined;
  };

  return (
    <div
      className="w-72 p-3 border-l flex flex-col gap-3"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      {/* Video Feed */}
      <VideoFeed theme={theme} />

      {/* Telemetry Cards */}
      <div className="grid grid-cols-2 gap-2">
        <TelemetryCard
          label="Altitude"
          value={Math.round(telemetry.altitude)}
          unit="m AGL"
          status="good"
          theme={theme}
        />
        <TelemetryCard
          label="Distance"
          value={(telemetry.distance / 1000).toFixed(1)}
          unit="km"
          theme={theme}
        />
        <TelemetryCard
          label="mAh Used"
          value={telemetry.mah}
          unit="mAh"
          status={getMahStatus()}
          theme={theme}
        />
        <TelemetryCard
          label="Voltage"
          value={telemetry.voltage.toFixed(1)}
          unit="V"
          status={getVoltageStatus()}
          theme={theme}
        />
      </div>

      {/* System Status */}
      <SystemStatus health={defaultHealth} theme={theme} />

      {/* Warnings */}
      <WarningBanner
        title="High Wind Warning"
        message="Wind gusts up to 12 m/s detected"
        theme={theme}
      />
    </div>
  );
}
