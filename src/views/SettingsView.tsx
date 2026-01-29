import { useState, useMemo } from 'react';
import type { Theme } from '@/types';
import { useUnitStore, type UnitSystem, type SpeedUnit, type AltitudeUnit, type DistanceUnit, type TemperatureUnit } from '@/stores/useUnitStore';

interface SettingsViewProps {
  theme: Theme;
  onThemeChange?: (theme: Theme) => void;
}

type SettingsSection = 'general' | 'map' | 'telemetry' | 'connections' | 'notifications' | 'shortcuts' | 'about';

interface SettingsState {
  // General
  theme: Theme;
  language: string;
  unitSystem: UnitSystem;
  // Map
  mapProvider: string;
  offlineMaps: boolean;
  mapCacheSize: number;
  // Telemetry
  updateRate: number;
  autoRecord: boolean;
  logDirectory: string;
  // Connections
  defaultSerialBaud: number;
  defaultUdpPort: number;
  autoConnect: boolean;
  // Notifications
  soundEnabled: boolean;
  criticalAlertsOnly: boolean;
  notificationDuration: number;
}

const sections: { id: SettingsSection; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'map', label: 'Map', icon: '🗺️' },
  { id: 'telemetry', label: 'Telemetry', icon: '📊' },
  { id: 'connections', label: 'Connections', icon: '📡' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'shortcuts', label: 'Keyboard', icon: '⌨️' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

const shortcuts = [
  { action: 'Command Palette', keys: ['⌘', 'K'], description: 'Open command palette' },
  { action: 'Flight View', keys: ['F1'], description: 'Switch to Flight view' },
  { action: 'Plan View', keys: ['F2'], description: 'Switch to Plan view' },
  { action: 'Configure View', keys: ['F3'], description: 'Switch to Configure view' },
  { action: 'Analyze View', keys: ['F4'], description: 'Switch to Analyze view' },
  { action: 'Arm/Disarm', keys: ['Space'], description: 'Toggle vehicle arm state' },
  { action: 'Return to Launch', keys: ['R'], description: 'Send RTL command' },
  { action: 'Land', keys: ['L'], description: 'Send Land command' },
  { action: 'Guided Mode', keys: ['G'], description: 'Enter Guided mode' },
  { action: 'Show Shortcuts', keys: ['?'], description: 'Show keyboard shortcuts help' },
  { action: 'Fullscreen', keys: ['F11'], description: 'Toggle fullscreen mode' },
];

export function SettingsView({ theme, onThemeChange }: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const { unitSystem, preferences, setUnitSystem, setSpeedUnit, setAltitudeUnit, setDistanceUnit, setTemperatureUnit } = useUnitStore();
  const [settings, setSettings] = useState<SettingsState>({
    theme,
    language: 'en',
    unitSystem: unitSystem,
    mapProvider: 'carto',
    offlineMaps: false,
    mapCacheSize: 500,
    updateRate: 10,
    autoRecord: true,
    logDirectory: '~/Documents/ALXGCS/Logs',
    defaultSerialBaud: 57600,
    defaultUdpPort: 14550,
    autoConnect: true,
    soundEnabled: true,
    criticalAlertsOnly: false,
    notificationDuration: 5,
  });

  const colors = useMemo(() => theme === 'dark'
    ? {
        bg: '#030508',
        panel: '#0a0f14',
        border: '#1a2332',
        text: '#8899aa',
        textPrimary: '#ffffff',
        accent: '#00d4ff',
        hover: '#1a2332',
        input: '#0d1117',
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
      }, [theme]);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'theme' && onThemeChange) {
      onThemeChange(value as Theme);
    }
  };

  const renderGeneral = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Theme</label>
        <div className="flex gap-2">
          {(['dark', 'light'] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => updateSetting('theme', t)}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: settings.theme === t ? colors.accent + '20' : colors.hover,
                border: `2px solid ${settings.theme === t ? colors.accent : 'transparent'}`,
                color: settings.theme === t ? colors.accent : colors.textPrimary,
              }}
            >
              {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Language</label>
        <select
          value={settings.language}
          onChange={(e) => updateSetting('language', e.target.value)}
          className="w-full px-3 py-2 rounded-lg"
          style={{ backgroundColor: colors.input, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
        >
          <option value="en">English</option>
          <option value="uk">Українська</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </div>

      {/* Unit System */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Unit System</label>
        <div className="space-y-2">
          {[
            { id: 'metric' as UnitSystem, label: 'Metric', desc: 'meters, km/h, °C' },
            { id: 'imperial' as UnitSystem, label: 'Imperial', desc: 'feet, mph, °F' },
          ].map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
              style={{
                backgroundColor: unitSystem === opt.id ? colors.accent + '10' : colors.hover,
                border: `1px solid ${unitSystem === opt.id ? colors.accent : 'transparent'}`,
              }}
            >
              <input
                type="radio"
                name="unitSystem"
                checked={unitSystem === opt.id}
                onChange={() => {
                  setUnitSystem(opt.id);
                  updateSetting('unitSystem', opt.id);
                }}
                className="w-4 h-4"
              />
              <div>
                <span style={{ color: colors.textPrimary }}>{opt.label}</span>
                <span className="text-sm ml-2" style={{ color: colors.text }}>({opt.desc})</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Individual Unit Preferences */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Custom Units</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs block mb-1" style={{ color: colors.text }}>Speed</label>
            <select
              value={preferences.speed}
              onChange={(e) => setSpeedUnit(e.target.value as SpeedUnit)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: colors.input, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
            >
              <option value="m/s">m/s</option>
              <option value="km/h">km/h</option>
              <option value="mph">mph</option>
              <option value="kts">knots</option>
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: colors.text }}>Altitude</label>
            <select
              value={preferences.altitude}
              onChange={(e) => setAltitudeUnit(e.target.value as AltitudeUnit)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: colors.input, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
            >
              <option value="m">meters</option>
              <option value="ft">feet</option>
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: colors.text }}>Distance</label>
            <select
              value={preferences.distance}
              onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: colors.input, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
            >
              <option value="m">meters</option>
              <option value="km">kilometers</option>
              <option value="mi">miles</option>
              <option value="nm">nautical miles</option>
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: colors.text }}>Temperature</label>
            <select
              value={preferences.temperature}
              onChange={(e) => setTemperatureUnit(e.target.value as TemperatureUnit)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: colors.input, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
            >
              <option value="C">°C (Celsius)</option>
              <option value="F">°F (Fahrenheit)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMap = () => (
    <div className="space-y-6">
      {/* Map Provider */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Map Provider</label>
        <select
          value={settings.mapProvider}
          onChange={(e) => updateSetting('mapProvider', e.target.value)}
          className="w-full px-3 py-2 rounded-lg"
          style={{ backgroundColor: colors.input, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
        >
          <option value="carto">Carto (Dark/Light)</option>
          <option value="osm">OpenStreetMap</option>
          <option value="satellite">Satellite (Esri)</option>
          <option value="terrain">Terrain (Stamen)</option>
        </select>
      </div>

      {/* Offline Maps */}
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
        <div>
          <span style={{ color: colors.textPrimary }}>Enable Offline Maps</span>
          <p className="text-xs mt-1" style={{ color: colors.text }}>Cache map tiles for offline use</p>
        </div>
        <input
          type="checkbox"
          checked={settings.offlineMaps}
          onChange={(e) => updateSetting('offlineMaps', e.target.checked)}
          className="w-5 h-5"
        />
      </div>

      {/* Cache Size */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>
          Map Cache Size: {settings.mapCacheSize} MB
        </label>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={settings.mapCacheSize}
          onChange={(e) => updateSetting('mapCacheSize', parseInt(e.target.value))}
          className="w-full"
          style={{ accentColor: colors.accent }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: colors.text }}>
          <span>100 MB</span>
          <span>2000 MB</span>
        </div>
      </div>

      {/* Clear Cache */}
      <button
        className="px-4 py-2 rounded-lg text-sm"
        style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
      >
        Clear Map Cache
      </button>
    </div>
  );

  const renderTelemetry = () => (
    <div className="space-y-6">
      {/* Update Rate */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>
          Telemetry Update Rate: {settings.updateRate} Hz
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={settings.updateRate}
          onChange={(e) => updateSetting('updateRate', parseInt(e.target.value))}
          className="w-full"
          style={{ accentColor: colors.accent }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: colors.text }}>
          <span>1 Hz</span>
          <span>50 Hz</span>
        </div>
      </div>

      {/* Auto Record */}
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
        <div>
          <span style={{ color: colors.textPrimary }}>Auto-Record Flights</span>
          <p className="text-xs mt-1" style={{ color: colors.text }}>Automatically record telemetry when armed</p>
        </div>
        <input
          type="checkbox"
          checked={settings.autoRecord}
          onChange={(e) => updateSetting('autoRecord', e.target.checked)}
          className="w-5 h-5"
        />
      </div>

      {/* Log Directory */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Log Directory</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={settings.logDirectory}
            onChange={(e) => updateSetting('logDirectory', e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg"
            style={{ backgroundColor: colors.input, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
          />
          <button
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.hover, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
          >
            Browse
          </button>
        </div>
      </div>
    </div>
  );

  const renderConnections = () => (
    <div className="space-y-6">
      {/* Default Serial Baud */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Default Serial Baud Rate</label>
        <select
          value={settings.defaultSerialBaud}
          onChange={(e) => updateSetting('defaultSerialBaud', parseInt(e.target.value))}
          className="w-full px-3 py-2 rounded-lg"
          style={{ backgroundColor: colors.input, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
        >
          <option value={9600}>9600</option>
          <option value={57600}>57600</option>
          <option value={115200}>115200</option>
          <option value={921600}>921600</option>
        </select>
      </div>

      {/* Default UDP Port */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Default UDP Port</label>
        <input
          type="number"
          value={settings.defaultUdpPort}
          onChange={(e) => updateSetting('defaultUdpPort', parseInt(e.target.value))}
          className="w-full px-3 py-2 rounded-lg"
          style={{ backgroundColor: colors.input, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
        />
      </div>

      {/* Auto Connect */}
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
        <div>
          <span style={{ color: colors.textPrimary }}>Auto-Connect on Startup</span>
          <p className="text-xs mt-1" style={{ color: colors.text }}>Automatically connect to last used link</p>
        </div>
        <input
          type="checkbox"
          checked={settings.autoConnect}
          onChange={(e) => updateSetting('autoConnect', e.target.checked)}
          className="w-5 h-5"
        />
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* Sound Enabled */}
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
        <div>
          <span style={{ color: colors.textPrimary }}>Sound Alerts</span>
          <p className="text-xs mt-1" style={{ color: colors.text }}>Play audio for notifications</p>
        </div>
        <input
          type="checkbox"
          checked={settings.soundEnabled}
          onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
          className="w-5 h-5"
        />
      </div>

      {/* Critical Only */}
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
        <div>
          <span style={{ color: colors.textPrimary }}>Critical Alerts Only</span>
          <p className="text-xs mt-1" style={{ color: colors.text }}>Only show critical warnings</p>
        </div>
        <input
          type="checkbox"
          checked={settings.criticalAlertsOnly}
          onChange={(e) => updateSetting('criticalAlertsOnly', e.target.checked)}
          className="w-5 h-5"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>
          Notification Duration: {settings.notificationDuration}s
        </label>
        <input
          type="range"
          min="2"
          max="15"
          value={settings.notificationDuration}
          onChange={(e) => updateSetting('notificationDuration', parseInt(e.target.value))}
          className="w-full"
          style={{ accentColor: colors.accent }}
        />
      </div>
    </div>
  );

  const renderShortcuts = () => (
    <div className="space-y-2">
      {shortcuts.map((shortcut) => (
        <div
          key={shortcut.action}
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ backgroundColor: colors.hover }}
        >
          <div>
            <span style={{ color: colors.textPrimary }}>{shortcut.action}</span>
            <p className="text-xs mt-0.5" style={{ color: colors.text }}>{shortcut.description}</p>
          </div>
          <div className="flex gap-1">
            {shortcut.keys.map((key) => (
              <span
                key={key}
                className="px-2 py-1 rounded text-xs font-mono"
                style={{ backgroundColor: colors.panel, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-6">
      {/* Logo / Title */}
      <div className="text-center py-6">
        <div className="text-5xl mb-4">✈️</div>
        <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>AIRLOGIX GCS</h2>
        <p className="text-sm mt-1" style={{ color: colors.text }}>Ground Control Station</p>
      </div>

      {/* Version Info */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: colors.hover }}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div style={{ color: colors.text }}>Version</div>
          <div style={{ color: colors.textPrimary }}>1.0.0</div>
          <div style={{ color: colors.text }}>Build</div>
          <div style={{ color: colors.textPrimary }}>2026.01.29</div>
          <div style={{ color: colors.text }}>Platform</div>
          <div style={{ color: colors.textPrimary }}>Tauri 2.0 + React</div>
          <div style={{ color: colors.text }}>License</div>
          <div style={{ color: colors.textPrimary }}>Proprietary</div>
        </div>
      </div>

      {/* Links */}
      <div className="space-y-2">
        <button
          className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3"
          style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
        >
          <span>📚</span>
          <span>Documentation</span>
        </button>
        <button
          className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3"
          style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
        >
          <span>🐛</span>
          <span>Report Issue</span>
        </button>
        <button
          className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3"
          style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
        >
          <span>💬</span>
          <span>Community Forum</span>
        </button>
      </div>

      {/* Copyright */}
      <p className="text-center text-xs" style={{ color: colors.text }}>
        © 2026 AIRLOGIX. All rights reserved.
      </p>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneral();
      case 'map': return renderMap();
      case 'telemetry': return renderTelemetry();
      case 'connections': return renderConnections();
      case 'notifications': return renderNotifications();
      case 'shortcuts': return renderShortcuts();
      case 'about': return renderAbout();
    }
  };

  return (
    <div className="w-full h-full flex" style={{ backgroundColor: colors.bg }}>
      {/* Sidebar */}
      <div
        className="w-56 flex flex-col border-r"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        <div className="p-4 border-b" style={{ borderColor: colors.border }}>
          <h2 className="font-semibold" style={{ color: colors.textPrimary }}>Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1"
              style={{
                backgroundColor: activeSection === section.id ? colors.accent + '20' : 'transparent',
                color: activeSection === section.id ? colors.textPrimary : colors.text,
              }}
            >
              <span>{section.icon}</span>
              <span className="text-sm">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold mb-6" style={{ color: colors.textPrimary }}>
            {sections.find(s => s.id === activeSection)?.label}
          </h3>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
