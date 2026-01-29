import type { Theme, SystemHealth } from '@/types';

interface SystemStatusProps {
  health: SystemHealth;
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

export function SystemStatus({ health = defaultHealth, theme }: SystemStatusProps) {
  const colors =
    theme === 'dark'
      ? { bg: '#0d1117', border: '#1a2332', text: '#8899aa', ok: '#00ff88', fail: '#ff4466' }
      : { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b', ok: '#16a34a', fail: '#dc2626' };

  const systems = [
    { name: 'Autopilot', status: health.autopilot },
    { name: 'GPS', status: health.gps },
    { name: 'Compass', status: health.compass },
    { name: 'Baro', status: health.barometer },
    { name: 'EKF', status: health.ekf },
  ];

  return (
    <div
      className="p-3 rounded-lg border"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <div
        style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          marginBottom: '8px',
          letterSpacing: '0.5px',
          color: colors.text,
        }}
      >
        System Status
      </div>
      {systems.map((sys, i) => (
        <div key={i} className="flex items-center justify-between py-1">
          <span style={{ fontSize: '11px', color: colors.text }}>{sys.name}</span>
          <span
            style={{
              fontSize: '10px',
              color: sys.status === 'ok' ? colors.ok : colors.fail,
              fontWeight: '600',
            }}
          >
            {sys.status === 'ok' ? '● OK' : '● FAIL'}
          </span>
        </div>
      ))}
    </div>
  );
}
