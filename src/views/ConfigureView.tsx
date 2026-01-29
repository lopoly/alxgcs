import { useState, useMemo } from 'react';
import type { Theme } from '@/types';
import { CalibrationWizard, MotorTest, ParameterEditor, SafetyConfig, RadioCalibration, FlightModesConfig, FirmwareUpdate } from '@/components/configure';
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
  | 'motors'
  | 'firmware'
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
  { id: 'motors', label: 'Motors', icon: '🔄' },
  { id: 'firmware', label: 'Firmware', icon: '💾' },
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


export function ConfigureView({ theme }: ConfigureViewProps) {
  const [activeSection, setActiveSection] = useState<ConfigSection>('summary');
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

  const renderAirframe = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Airframe Selection</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'flying-wing', name: 'Flying Wing', icon: '🦅', selected: true },
            { id: 'standard-plane', name: 'Standard Plane', icon: '✈️', selected: false },
            { id: 'vtol', name: 'VTOL', icon: '🚁', selected: false },
            { id: 'quadplane', name: 'QuadPlane', icon: '🛩️', selected: false },
            { id: 'tailsitter', name: 'Tailsitter', icon: '🚀', selected: false },
            { id: 'custom', name: 'Custom', icon: '⚙️', selected: false },
          ].map((frame) => (
            <div
              key={frame.id}
              className="p-4 rounded-lg cursor-pointer transition-all"
              style={{
                backgroundColor: frame.selected ? colors.accent + '20' : colors.hover,
                border: `2px solid ${frame.selected ? colors.accent : 'transparent'}`,
              }}
            >
              <div className="text-3xl mb-2">{frame.icon}</div>
              <div className="font-medium text-sm" style={{ color: colors.textPrimary }}>{frame.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Control Surfaces</h3>
        <div className="space-y-3">
          {[
            { channel: 1, function: 'Aileron', reversed: false },
            { channel: 2, function: 'Elevator', reversed: false },
            { channel: 3, function: 'Throttle', reversed: false },
            { channel: 4, function: 'Rudder', reversed: true },
          ].map((surface) => (
            <div key={surface.channel} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium" style={{ backgroundColor: colors.accent + '20', color: colors.accent }}>
                  {surface.channel}
                </span>
                <select
                  className="px-3 py-2 rounded text-sm"
                  style={{ backgroundColor: colors.panel, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                  defaultValue={surface.function}
                >
                  <option>Aileron</option>
                  <option>Elevator</option>
                  <option>Throttle</option>
                  <option>Rudder</option>
                  <option>Flap</option>
                  <option>None</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={surface.reversed} className="w-4 h-4" />
                <span className="text-sm" style={{ color: colors.text }}>Reversed</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Motor Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>Motor PWM Min</label>
            <input type="number" defaultValue={1000} className="w-full px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>Motor PWM Max</label>
            <input type="number" defaultValue={2000} className="w-full px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPower = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Battery Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>Cell Count</label>
            <select className="w-full px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
              <option>3S (11.1V)</option>
              <option>4S (14.8V)</option>
              <option>5S (18.5V)</option>
              <option>6S (22.2V)</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>Capacity (mAh)</label>
            <input type="number" defaultValue={5000} className="w-full px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>Low Voltage (V)</label>
            <input type="number" defaultValue={10.5} step={0.1} className="w-full px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>Critical Voltage (V)</label>
            <input type="number" defaultValue={10.0} step={0.1} className="w-full px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }} />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Power Monitor</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg text-center" style={{ backgroundColor: colors.hover }}>
            <div className="text-2xl font-bold" style={{ color: colors.success }}>12.4V</div>
            <div className="text-xs mt-1" style={{ color: colors.text }}>Voltage</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ backgroundColor: colors.hover }}>
            <div className="text-2xl font-bold" style={{ color: colors.accent }}>8.2A</div>
            <div className="text-xs mt-1" style={{ color: colors.text }}>Current</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ backgroundColor: colors.hover }}>
            <div className="text-2xl font-bold" style={{ color: colors.warning }}>1250</div>
            <div className="text-xs mt-1" style={{ color: colors.text }}>mAh Used</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>Voltage Multiplier</label>
            <input type="number" defaultValue={10.1} step={0.01} className="w-full px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>Amps per Volt</label>
            <input type="number" defaultValue={17.0} step={0.1} className="w-full px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }} />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.border }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>ESC Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>ESC Protocol</label>
            <select className="w-full px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
              <option>Standard PWM</option>
              <option>OneShot125</option>
              <option>OneShot42</option>
              <option>DShot150</option>
              <option>DShot300</option>
              <option>DShot600</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ color: colors.text }}>Motor Spin When Armed</label>
            <select className="w-full px-3 py-2 rounded text-sm" style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'summary': return renderSummary();
      case 'airframe': return renderAirframe();
      case 'sensors': return renderSensors();
      case 'radio': return <RadioCalibration theme={theme} />;
      case 'flight-modes': return <FlightModesConfig theme={theme} />;
      case 'safety': return <SafetyConfig theme={theme} />;
      case 'power': return renderPower();
      case 'motors': return <MotorTest theme={theme} vehicleType="quad" />;
      case 'firmware': return <FirmwareUpdate theme={theme} />;
      case 'parameters': return <ParameterEditor theme={theme} />;
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
