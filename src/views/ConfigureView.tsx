import { useState, useMemo } from 'react';
import type { Theme } from '@/types';
import { CalibrationWizard } from '@/components/configure';
import { useNotificationStore } from '@/stores/useNotificationStore';

interface ConfigureViewProps {
  theme: Theme;
}

type ConfigSection =
  | 'summary'
  | 'airframe'
  | 'sensors'
  | 'radio'
  | 'flight-modes'
  | 'safety'
  | 'power'
  | 'parameters';

type CalibrationSensor = 'compass' | 'accel' | 'gyro' | 'level' | 'radio' | 'esc';

const sections: { id: ConfigSection; label: string; icon: string }[] = [
  { id: 'summary', label: 'Summary', icon: '📊' },
  { id: 'airframe', label: 'Airframe', icon: '✈️' },
  { id: 'sensors', label: 'Sensors', icon: '🧭' },
  { id: 'radio', label: 'Radio', icon: '📡' },
  { id: 'flight-modes', label: 'Flight Modes', icon: '🎮' },
  { id: 'safety', label: 'Safety', icon: '🛡️' },
  { id: 'power', label: 'Power', icon: '🔋' },
  { id: 'parameters', label: 'Parameters', icon: '⚙️' },
];

const sensorStatus = [
  { name: 'Accelerometer', status: 'ok', value: 'Calibrated' },
  { name: 'Gyroscope', status: 'ok', value: 'Calibrated' },
  { name: 'Magnetometer', status: 'warning', value: 'Needs calibration' },
  { name: 'Barometer', status: 'ok', value: '1013.25 hPa' },
  { name: 'GPS', status: 'ok', value: '14 satellites' },
  { name: 'Airspeed', status: 'ok', value: 'Enabled' },
];

const parameters = [
  { name: 'ARMING_CHECK', value: 1, description: 'Arming checks to perform', group: 'Arming' },
  { name: 'ARMING_REQUIRE', value: 1, description: 'Require arm gesture', group: 'Arming' },
  { name: 'BATT_ARM_VOLT', value: 10.5, description: 'Minimum arm voltage', group: 'Battery' },
  { name: 'BATT_CAPACITY', value: 5000, description: 'Battery capacity mAh', group: 'Battery' },
  { name: 'BATT_LOW_VOLT', value: 10.0, description: 'Low battery voltage', group: 'Battery' },
  { name: 'FS_THR_ENABLE', value: 1, description: 'Throttle failsafe', group: 'Failsafe' },
  { name: 'FS_THR_VALUE', value: 975, description: 'Throttle failsafe PWM', group: 'Failsafe' },
  { name: 'RTL_ALT', value: 60, description: 'RTL altitude (m)', group: 'RTL' },
  { name: 'RTL_SPEED', value: 0, description: 'RTL speed (0=auto)', group: 'RTL' },
  { name: 'WP_RADIUS', value: 5, description: 'Waypoint radius (m)', group: 'Navigation' },
  { name: 'WP_SPEED', value: 12, description: 'Waypoint speed (m/s)', group: 'Navigation' },
];

const flightModes = [
  { channel: 1, low: 'MANUAL', mid: 'FBWA', high: 'AUTO' },
  { channel: 2, low: 'RTL', mid: 'LOITER', high: 'GUIDED' },
];

export function ConfigureView({ theme }: ConfigureViewProps) {
  const [activeSection, setActiveSection] = useState<ConfigSection>('summary');
  const [paramSearch, setParamSearch] = useState('');
  const [editingParam, setEditingParam] = useState<string | null>(null);
  const [calibrationSensor, setCalibrationSensor] = useState<CalibrationSensor | null>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const colors = useMemo(
    () =>
      theme === 'dark'
        ? {
            bg: '#030508',
            panel: '#0a0f14',
            border: '#1a2332',
            text: '#8899aa',
            textPrimary: '#ffffff',
            accent: '#00d4ff',
            hover: '#1a2332',
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff4466',
          }
        : {
            bg: '#f0f4f8',
            panel: '#ffffff',
            border: '#e2e8f0',
            text: '#64748b',
            textPrimary: '#1e293b',
            accent: '#0066cc',
            hover: '#f1f5f9',
            success: '#16a34a',
            warning: '#d97706',
            error: '#dc2626',
          },
    [theme]
  );

  const filteredParams = parameters.filter(
    (p) =>
      p.name.toLowerCase().includes(paramSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(paramSearch.toLowerCase())
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <div
        className="p-4 rounded-lg border"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Vehicle Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase mb-1" style={{ color: colors.text }}>Name</div>
            <div style={{ color: colors.textPrimary }}>GOR-01</div>
          </div>
          <div>
            <div className="text-xs uppercase mb-1" style={{ color: colors.text }}>Type</div>
            <div style={{ color: colors.textPrimary }}>Fixed Wing</div>
          </div>
          <div>
            <div className="text-xs uppercase mb-1" style={{ color: colors.text }}>Autopilot</div>
            <div style={{ color: colors.textPrimary }}>ArduPlane 4.5.0</div>
          </div>
          <div>
            <div className="text-xs uppercase mb-1" style={{ color: colors.text }}>Frame</div>
            <div style={{ color: colors.textPrimary }}>Flying Wing</div>
          </div>
        </div>
      </div>

      <div
        className="p-4 rounded-lg border"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          System Health
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {sensorStatus.map((sensor) => (
            <div key={sensor.name} className="p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      sensor.status === 'ok' ? colors.success : sensor.status === 'warning' ? colors.warning : colors.error,
                  }}
                />
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>{sensor.name}</span>
              </div>
              <div className="text-xs" style={{ color: colors.text }}>{sensor.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-4 rounded-lg border"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {['🔄 Refresh Parameters', '💾 Save to File', '📂 Load from File', '🔃 Reset to Default'].map((action) => (
            <button
              key={action}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const calibrationItems: { sensor: CalibrationSensor; name: string; desc: string; action: string; status: 'ok' | 'warning' | 'error' }[] = [
    { sensor: 'accel', name: 'Accelerometer', desc: 'Level calibration required', action: 'Calibrate', status: 'ok' },
    { sensor: 'compass', name: 'Compass', desc: 'Outdoor calibration recommended', action: 'Calibrate', status: 'warning' },
    { sensor: 'gyro', name: 'Gyroscope', desc: 'Keep vehicle still during calibration', action: 'Calibrate', status: 'ok' },
    { sensor: 'level', name: 'Level Horizon', desc: 'Set level flight reference', action: 'Calibrate', status: 'ok' },
    { sensor: 'radio', name: 'Radio', desc: 'Calibrate RC transmitter endpoints', action: 'Calibrate', status: 'ok' },
    { sensor: 'esc', name: 'ESC', desc: 'Calibrate motor speed controllers', action: 'Calibrate', status: 'ok' },
  ];

  const handleCalibrationComplete = (success: boolean) => {
    setCalibrationSensor(null);
    if (success) {
      addNotification({
        type: 'success',
        title: 'Calibration Complete',
        message: 'Sensor has been calibrated successfully',
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Calibration Failed',
        message: 'Please try again or check sensor connections',
      });
    }
  };

  const renderSensors = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Sensor Calibration</h3>
        <div className="space-y-3">
          {calibrationItems.map((cal) => (
            <div key={cal.sensor} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
              <div className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      cal.status === 'ok' ? colors.success : cal.status === 'warning' ? colors.warning : colors.error,
                  }}
                />
                <div>
                  <div className="font-medium" style={{ color: colors.textPrimary }}>{cal.name}</div>
                  <div className="text-sm" style={{ color: colors.text }}>{cal.desc}</div>
                </div>
              </div>
              <button
                onClick={() => setCalibrationSensor(cal.sensor)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
              >
                {cal.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Sensor Orientation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>Board Rotation</label>
            <select
              className="w-full px-3 py-2 rounded text-sm"
              style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
              defaultValue="0"
            >
              <option value="0">None (0°)</option>
              <option value="1">Yaw 45°</option>
              <option value="2">Yaw 90°</option>
              <option value="3">Yaw 135°</option>
              <option value="4">Yaw 180°</option>
              <option value="5">Yaw 225°</option>
              <option value="6">Yaw 270°</option>
              <option value="7">Yaw 315°</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>External Compass</label>
            <select
              className="w-full px-3 py-2 rounded text-sm"
              style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
              defaultValue="0"
            >
              <option value="0">None (0°)</option>
              <option value="1">Yaw 45°</option>
              <option value="2">Yaw 90°</option>
              <option value="4">Yaw 180°</option>
              <option value="6">Yaw 270°</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFlightModes = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Flight Mode Configuration</h3>
        <div className="space-y-4">
          {flightModes.map((fm, idx) => (
            <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
              <div className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>Switch {fm.channel}</div>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'mid', 'high'] as const).map((pos) => (
                  <div key={pos}>
                    <div className="text-xs uppercase mb-1" style={{ color: colors.text }}>{pos}</div>
                    <select
                      className="w-full px-3 py-2 rounded text-sm"
                      style={{ backgroundColor: colors.panel, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                      defaultValue={fm[pos]}
                    >
                      {['MANUAL', 'STABILIZE', 'FBWA', 'FBWB', 'AUTO', 'RTL', 'LOITER', 'GUIDED', 'CRUISE'].map((mode) => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderParameters = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search parameters..."
          value={paramSearch}
          onChange={(e) => setParamSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: colors.panel, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
        />
        <button className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: colors.accent, color: '#000' }}>
          Write Changes
        </button>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: colors.hover }}>
              <th className="text-left px-4 py-3 text-xs uppercase" style={{ color: colors.text }}>Parameter</th>
              <th className="text-left px-4 py-3 text-xs uppercase" style={{ color: colors.text }}>Value</th>
              <th className="text-left px-4 py-3 text-xs uppercase" style={{ color: colors.text }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredParams.map((param) => (
              <tr key={param.name} className="border-t" style={{ borderColor: colors.border }}>
                <td className="px-4 py-3">
                  <div className="font-mono text-sm" style={{ color: colors.accent }}>{param.name}</div>
                  <div className="text-xs" style={{ color: colors.text }}>{param.group}</div>
                </td>
                <td className="px-4 py-3">
                  {editingParam === param.name ? (
                    <input
                      type="number"
                      defaultValue={param.value}
                      className="w-24 px-2 py-1 rounded text-sm"
                      style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.accent}` }}
                      onBlur={() => setEditingParam(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingParam(null)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="cursor-pointer px-2 py-1 rounded"
                      style={{ color: colors.textPrimary }}
                      onClick={() => setEditingParam(param.name)}
                    >
                      {param.value}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>{param.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSafety = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Failsafe Settings</h3>
        <div className="space-y-4">
          {[
            { name: 'Low Battery', value: 'Return to Launch', enabled: true },
            { name: 'RC Loss', value: 'Continue Mission', enabled: true },
            { name: 'GPS Loss', value: 'Land', enabled: true },
            { name: 'Geofence Breach', value: 'Return to Launch', enabled: true },
          ].map((fs) => (
            <div key={fs.name} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
              <div className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={fs.enabled} className="w-4 h-4" />
                <span style={{ color: colors.textPrimary }}>{fs.name}</span>
              </div>
              <select
                className="px-3 py-2 rounded text-sm"
                style={{ backgroundColor: colors.panel, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                defaultValue={fs.value}
              >
                <option>Return to Launch</option>
                <option>Land</option>
                <option>Continue Mission</option>
                <option>Loiter</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>RTL Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>RTL Altitude (m)</label>
            <input
              type="number"
              defaultValue={60}
              className="w-full px-3 py-2 rounded text-sm"
              style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
            />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>RTL Speed (m/s)</label>
            <input
              type="number"
              defaultValue={0}
              className="w-full px-3 py-2 rounded text-sm"
              style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'summary': return renderSummary();
      case 'sensors': return renderSensors();
      case 'flight-modes': return renderFlightModes();
      case 'parameters': return renderParameters();
      case 'safety': return renderSafety();
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-2">🚧</div>
              <p style={{ color: colors.text }}>Section under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex" style={{ backgroundColor: colors.bg }}>
      <div className="w-56 flex flex-col border-r" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <div className="p-4 border-b" style={{ borderColor: colors.border }}>
          <h2 className="font-semibold" style={{ color: colors.textPrimary }}>Vehicle Setup</h2>
          <p className="text-xs mt-1" style={{ color: colors.text }}>GOR-01 • ArduPlane</p>
        </div>

        <nav className="flex-1 p-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-left transition-colors"
              style={{
                backgroundColor: activeSection === section.id ? colors.accent + '20' : 'transparent',
                color: activeSection === section.id ? colors.accent : colors.text,
              }}
            >
              <span>{section.icon}</span>
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
            <span className="text-sm" style={{ color: colors.text }}>Connected via UDP</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

      {/* Calibration Wizard */}
      {calibrationSensor && (
        <CalibrationWizard
          theme={theme}
          sensor={calibrationSensor}
          isOpen={true}
          onClose={() => setCalibrationSensor(null)}
          onComplete={handleCalibrationComplete}
        />
      )}
    </div>
  );
}
