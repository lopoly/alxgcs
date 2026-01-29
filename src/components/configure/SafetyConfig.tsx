import { useState, useMemo } from 'react';
import type { Theme } from '@/types';

interface SafetyConfigProps {
  theme: Theme;
  onSave?: (config: SafetySettings) => void;
}

type FailsafeAction = 'none' | 'land' | 'rtl' | 'smartRtl' | 'brake' | 'terminate';

interface SafetySettings {
  // Battery failsafe
  batteryFailsafe: boolean;
  batteryLowThreshold: number;
  batteryLowAction: FailsafeAction;
  batteryCriticalThreshold: number;
  batteryCriticalAction: FailsafeAction;

  // RC failsafe
  rcFailsafe: boolean;
  rcLostAction: FailsafeAction;
  rcLostTimeout: number;

  // GCS failsafe
  gcsFailsafe: boolean;
  gcsLostAction: FailsafeAction;
  gcsLostTimeout: number;

  // Geofence
  geofenceEnabled: boolean;
  geofenceAction: FailsafeAction;
  geofenceMaxAltitude: number;
  geofenceMaxDistance: number;

  // EKF/GPS failsafe
  ekfFailsafe: boolean;
  ekfFailsafeAction: FailsafeAction;

  // Crash detection
  crashDetection: boolean;
  crashAction: FailsafeAction;

  // Arming checks
  armingChecks: {
    all: boolean;
    barometer: boolean;
    compass: boolean;
    gps: boolean;
    ins: boolean;
    parameters: boolean;
    rc: boolean;
    voltage: boolean;
  };
}

const defaultSettings: SafetySettings = {
  batteryFailsafe: true,
  batteryLowThreshold: 20,
  batteryLowAction: 'rtl',
  batteryCriticalThreshold: 10,
  batteryCriticalAction: 'land',

  rcFailsafe: true,
  rcLostAction: 'rtl',
  rcLostTimeout: 1.5,

  gcsFailsafe: true,
  gcsLostAction: 'rtl',
  gcsLostTimeout: 5,

  geofenceEnabled: true,
  geofenceAction: 'rtl',
  geofenceMaxAltitude: 120,
  geofenceMaxDistance: 500,

  ekfFailsafe: true,
  ekfFailsafeAction: 'land',

  crashDetection: true,
  crashAction: 'none',

  armingChecks: {
    all: true,
    barometer: true,
    compass: true,
    gps: true,
    ins: true,
    parameters: true,
    rc: true,
    voltage: true,
  },
};

const failsafeOptions: { value: FailsafeAction; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'Continue mission / do nothing' },
  { value: 'land', label: 'Land', description: 'Land immediately at current position' },
  { value: 'rtl', label: 'RTL', description: 'Return to launch point' },
  { value: 'smartRtl', label: 'Smart RTL', description: 'Retrace path back to launch' },
  { value: 'brake', label: 'Brake', description: 'Stop and hover in place' },
  { value: 'terminate', label: 'Terminate', description: 'Kill motors immediately (DANGER)' },
];

export function SafetyConfig({ theme, onSave }: SafetyConfigProps) {
  const [settings, setSettings] = useState<SafetySettings>(defaultSettings);
  const [activeSection, setActiveSection] = useState<string>('battery');

  const colors = useMemo(() => theme === 'dark'
    ? {
        bg: '#0a0f14',
        panel: '#0d1117',
        border: '#1a2332',
        text: '#8899aa',
        textPrimary: '#ffffff',
        accent: '#00d4ff',
        hover: '#1a2332',
        input: '#0d1117',
        warning: '#ffaa00',
        error: '#ff4466',
        success: '#00ff88',
      }
    : {
        bg: '#f0f4f8',
        panel: '#ffffff',
        border: '#e2e8f0',
        text: '#64748b',
        textPrimary: '#1e293b',
        accent: '#0066cc',
        hover: '#f1f5f9',
        input: '#ffffff',
        warning: '#d97706',
        error: '#dc2626',
        success: '#16a34a',
      }, [theme]);

  const sections = [
    { id: 'battery', label: 'Battery Failsafe', icon: '🔋' },
    { id: 'rc', label: 'RC Failsafe', icon: '📡' },
    { id: 'gcs', label: 'GCS Failsafe', icon: '💻' },
    { id: 'geofence', label: 'Geofence', icon: '🚧' },
    { id: 'ekf', label: 'EKF/GPS Failsafe', icon: '📍' },
    { id: 'crash', label: 'Crash Detection', icon: '💥' },
    { id: 'arming', label: 'Arming Checks', icon: '✅' },
  ];

  const updateSetting = <K extends keyof SafetySettings>(key: K, value: SafetySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateArmingCheck = (key: keyof SafetySettings['armingChecks'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      armingChecks: { ...prev.armingChecks, [key]: value },
    }));
  };

  const renderActionSelect = (value: FailsafeAction, onChange: (value: FailsafeAction) => void) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FailsafeAction)}
      className="w-full px-3 py-2 rounded-lg text-sm"
      style={{
        backgroundColor: colors.input,
        color: colors.textPrimary,
        border: `1px solid ${colors.border}`,
      }}
    >
      {failsafeOptions.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  const renderToggle = (enabled: boolean, onChange: (value: boolean) => void, label: string) => (
    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
      <span style={{ color: colors.textPrimary }}>{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className="relative w-12 h-6 rounded-full transition-colors"
        style={{ backgroundColor: enabled ? colors.accent : colors.border }}
      >
        <span
          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ left: enabled ? '26px' : '4px' }}
        />
      </button>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'battery':
        return (
          <div className="space-y-4">
            {renderToggle(settings.batteryFailsafe, (v) => updateSetting('batteryFailsafe', v), 'Enable Battery Failsafe')}

            {settings.batteryFailsafe && (
              <>
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.hover }}>
                  <h4 className="font-medium mb-3" style={{ color: colors.warning }}>Low Battery</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs block mb-1" style={{ color: colors.text }}>Threshold (%)</label>
                      <input
                        type="number"
                        value={settings.batteryLowThreshold}
                        onChange={(e) => updateSetting('batteryLowThreshold', parseInt(e.target.value))}
                        min={5}
                        max={50}
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{
                          backgroundColor: colors.input,
                          color: colors.textPrimary,
                          border: `1px solid ${colors.border}`,
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs block mb-1" style={{ color: colors.text }}>Action</label>
                      {renderActionSelect(settings.batteryLowAction, (v) => updateSetting('batteryLowAction', v))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.hover }}>
                  <h4 className="font-medium mb-3" style={{ color: colors.error }}>Critical Battery</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs block mb-1" style={{ color: colors.text }}>Threshold (%)</label>
                      <input
                        type="number"
                        value={settings.batteryCriticalThreshold}
                        onChange={(e) => updateSetting('batteryCriticalThreshold', parseInt(e.target.value))}
                        min={1}
                        max={settings.batteryLowThreshold - 1}
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{
                          backgroundColor: colors.input,
                          color: colors.textPrimary,
                          border: `1px solid ${colors.border}`,
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs block mb-1" style={{ color: colors.text }}>Action</label>
                      {renderActionSelect(settings.batteryCriticalAction, (v) => updateSetting('batteryCriticalAction', v))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'rc':
        return (
          <div className="space-y-4">
            {renderToggle(settings.rcFailsafe, (v) => updateSetting('rcFailsafe', v), 'Enable RC Failsafe')}

            {settings.rcFailsafe && (
              <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: colors.hover }}>
                <div>
                  <label className="text-xs block mb-1" style={{ color: colors.text }}>Timeout (seconds)</label>
                  <input
                    type="number"
                    value={settings.rcLostTimeout}
                    onChange={(e) => updateSetting('rcLostTimeout', parseFloat(e.target.value))}
                    min={0.5}
                    max={10}
                    step={0.5}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: colors.input,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1" style={{ color: colors.text }}>Action when RC lost</label>
                  {renderActionSelect(settings.rcLostAction, (v) => updateSetting('rcLostAction', v))}
                </div>
              </div>
            )}
          </div>
        );

      case 'gcs':
        return (
          <div className="space-y-4">
            {renderToggle(settings.gcsFailsafe, (v) => updateSetting('gcsFailsafe', v), 'Enable GCS Failsafe')}

            {settings.gcsFailsafe && (
              <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: colors.hover }}>
                <div>
                  <label className="text-xs block mb-1" style={{ color: colors.text }}>Timeout (seconds)</label>
                  <input
                    type="number"
                    value={settings.gcsLostTimeout}
                    onChange={(e) => updateSetting('gcsLostTimeout', parseInt(e.target.value))}
                    min={1}
                    max={60}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: colors.input,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1" style={{ color: colors.text }}>Action when GCS lost</label>
                  {renderActionSelect(settings.gcsLostAction, (v) => updateSetting('gcsLostAction', v))}
                </div>
              </div>
            )}
          </div>
        );

      case 'geofence':
        return (
          <div className="space-y-4">
            {renderToggle(settings.geofenceEnabled, (v) => updateSetting('geofenceEnabled', v), 'Enable Geofence')}

            {settings.geofenceEnabled && (
              <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: colors.hover }}>
                <div>
                  <label className="text-xs block mb-1" style={{ color: colors.text }}>Max Altitude (m)</label>
                  <input
                    type="number"
                    value={settings.geofenceMaxAltitude}
                    onChange={(e) => updateSetting('geofenceMaxAltitude', parseInt(e.target.value))}
                    min={10}
                    max={500}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: colors.input,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1" style={{ color: colors.text }}>Max Distance from Home (m)</label>
                  <input
                    type="number"
                    value={settings.geofenceMaxDistance}
                    onChange={(e) => updateSetting('geofenceMaxDistance', parseInt(e.target.value))}
                    min={50}
                    max={10000}
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: colors.input,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1" style={{ color: colors.text }}>Breach Action</label>
                  {renderActionSelect(settings.geofenceAction, (v) => updateSetting('geofenceAction', v))}
                </div>
              </div>
            )}
          </div>
        );

      case 'ekf':
        return (
          <div className="space-y-4">
            {renderToggle(settings.ekfFailsafe, (v) => updateSetting('ekfFailsafe', v), 'Enable EKF/GPS Failsafe')}

            {settings.ekfFailsafe && (
              <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: colors.hover }}>
                <p className="text-xs" style={{ color: colors.text }}>
                  Triggers when EKF variance exceeds threshold or GPS is lost during flight
                </p>
                <div>
                  <label className="text-xs block mb-1" style={{ color: colors.text }}>Action</label>
                  {renderActionSelect(settings.ekfFailsafeAction, (v) => updateSetting('ekfFailsafeAction', v))}
                </div>
              </div>
            )}
          </div>
        );

      case 'crash':
        return (
          <div className="space-y-4">
            {renderToggle(settings.crashDetection, (v) => updateSetting('crashDetection', v), 'Enable Crash Detection')}

            {settings.crashDetection && (
              <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: colors.hover }}>
                <p className="text-xs" style={{ color: colors.text }}>
                  Detects sudden attitude changes or impacts during flight
                </p>
                <div>
                  <label className="text-xs block mb-1" style={{ color: colors.text }}>Action on crash detected</label>
                  {renderActionSelect(settings.crashAction, (v) => updateSetting('crashAction', v))}
                </div>
              </div>
            )}
          </div>
        );

      case 'arming':
        return (
          <div className="space-y-4">
            {renderToggle(settings.armingChecks.all, (v) => updateArmingCheck('all', v), 'Enable All Arming Checks')}

            <div className="p-4 rounded-lg space-y-2" style={{ backgroundColor: colors.hover }}>
              <p className="text-xs mb-3" style={{ color: colors.text }}>
                Individual checks (disabled when "All" is enabled)
              </p>
              {Object.entries(settings.armingChecks)
                .filter(([key]) => key !== 'all')
                .map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-white/5"
                    style={{ opacity: settings.armingChecks.all ? 0.5 : 1 }}
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      disabled={settings.armingChecks.all}
                      onChange={(e) => updateArmingCheck(key as keyof SafetySettings['armingChecks'], e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm capitalize" style={{ color: colors.textPrimary }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex" style={{ backgroundColor: colors.bg }}>
      {/* Sidebar */}
      <div className="w-48 border-r p-2" style={{ borderColor: colors.border }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors mb-1"
            style={{
              backgroundColor: activeSection === section.id ? colors.accent + '20' : 'transparent',
              color: activeSection === section.id ? colors.textPrimary : colors.text,
            }}
          >
            <span>{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-lg">
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
            {sections.find(s => s.id === activeSection)?.label}
          </h3>
          {renderSection()}
        </div>

        {/* Save button */}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={() => onSave?.(settings)}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: colors.accent, color: '#000000' }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
