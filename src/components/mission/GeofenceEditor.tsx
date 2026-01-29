import { useState } from 'react';
import type { Theme } from '@/types';

interface GeofenceZone {
  id: string;
  type: 'inclusion' | 'exclusion';
  points: [number, number][];
}

interface GeofenceSettings {
  enabled: boolean;
  action: 'report' | 'rtl' | 'land' | 'brake';
  maxAltitude: number;
  minAltitude: number;
  zones: GeofenceZone[];
}

interface GeofenceEditorProps {
  theme: Theme;
  settings: GeofenceSettings;
  onSettingsChange: (settings: GeofenceSettings) => void;
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;
}

export function GeofenceEditor({
  theme,
  settings,
  onSettingsChange,
  selectedZoneId,
  onSelectZone,
}: GeofenceEditorProps) {
  const [isDrawing, setIsDrawing] = useState(false);

  const colors =
    theme === 'dark'
      ? {
          bg: '#0a0f14',
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
          bg: '#ffffff',
          border: '#e2e8f0',
          text: '#64748b',
          textPrimary: '#1e293b',
          accent: '#0066cc',
          hover: '#f1f5f9',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
        };

  const actionDescriptions: Record<GeofenceSettings['action'], string> = {
    report: 'Only report breach, no action',
    rtl: 'Return to launch point',
    land: 'Land immediately',
    brake: 'Stop and hold position',
  };

  const handleAddZone = (type: 'inclusion' | 'exclusion') => {
    const newZone: GeofenceZone = {
      id: `zone-${Date.now()}`,
      type,
      points: [],
    };
    onSettingsChange({
      ...settings,
      zones: [...settings.zones, newZone],
    });
    onSelectZone(newZone.id);
    setIsDrawing(true);
  };

  const handleDeleteZone = (id: string) => {
    onSettingsChange({
      ...settings,
      zones: settings.zones.filter((z) => z.id !== id),
    });
    if (selectedZoneId === id) {
      onSelectZone(null);
    }
  };

  const handleClearAllZones = () => {
    onSettingsChange({
      ...settings,
      zones: [],
    });
    onSelectZone(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Enable Toggle */}
      <div
        className="p-3 border-b flex items-center justify-between"
        style={{ borderColor: colors.border }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🚧</span>
          <span className="font-medium" style={{ color: colors.textPrimary }}>
            Geofence
          </span>
        </div>
        <button
          onClick={() => onSettingsChange({ ...settings, enabled: !settings.enabled })}
          className="relative w-12 h-6 rounded-full transition-colors"
          style={{
            backgroundColor: settings.enabled ? colors.success : colors.border,
          }}
        >
          <div
            className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
            style={{
              transform: settings.enabled ? 'translateX(26px)' : 'translateX(2px)',
            }}
          />
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Breach Action */}
          <div className="p-3 border-b" style={{ borderColor: colors.border }}>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: colors.text }}>
              Breach Action
            </label>
            <select
              value={settings.action}
              onChange={(e) =>
                onSettingsChange({ ...settings, action: e.target.value as GeofenceSettings['action'] })
              }
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: colors.hover,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
              }}
            >
              <option value="report">Report Only</option>
              <option value="rtl">Return to Launch (RTL)</option>
              <option value="land">Land Immediately</option>
              <option value="brake">Brake / Hold</option>
            </select>
            <div className="mt-1 text-xs" style={{ color: colors.text }}>
              {actionDescriptions[settings.action]}
            </div>
          </div>

          {/* Altitude Limits */}
          <div className="p-3 border-b" style={{ borderColor: colors.border }}>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: colors.text }}>
              Altitude Limits
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs block mb-1" style={{ color: colors.text }}>
                  Min (m)
                </label>
                <input
                  type="number"
                  value={settings.minAltitude}
                  onChange={(e) => onSettingsChange({ ...settings, minAltitude: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.hover,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: colors.text }}>
                  Max (m)
                </label>
                <input
                  type="number"
                  value={settings.maxAltitude}
                  onChange={(e) => onSettingsChange({ ...settings, maxAltitude: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.hover,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Zone Management */}
          <div className="p-3 border-b" style={{ borderColor: colors.border }}>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: colors.text }}>
              Geofence Zones
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddZone('inclusion')}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                style={{
                  backgroundColor: colors.success + '20',
                  color: colors.success,
                  border: `1px solid ${colors.success}40`,
                }}
              >
                <span>+</span> Include
              </button>
              <button
                onClick={() => handleAddZone('exclusion')}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                style={{
                  backgroundColor: colors.error + '20',
                  color: colors.error,
                  border: `1px solid ${colors.error}40`,
                }}
              >
                <span>+</span> Exclude
              </button>
            </div>
          </div>

          {/* Zone List */}
          <div className="flex-1 overflow-y-auto p-2">
            {settings.zones.length === 0 ? (
              <div className="text-center py-6" style={{ color: colors.text }}>
                <div className="text-2xl mb-2">📍</div>
                <div className="text-sm">No zones defined</div>
                <div className="text-xs mt-1">Add inclusion or exclusion zones</div>
              </div>
            ) : (
              <div className="space-y-2">
                {settings.zones.map((zone, index) => (
                  <div
                    key={zone.id}
                    onClick={() => onSelectZone(zone.id)}
                    className="p-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                    style={{
                      backgroundColor: selectedZoneId === zone.id ? colors.accent + '20' : 'transparent',
                      border: `1px solid ${selectedZoneId === zone.id ? colors.accent : colors.border}`,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: zone.type === 'inclusion' ? colors.success : colors.error,
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Zone {index + 1}
                      </div>
                      <div className="text-xs capitalize" style={{ color: colors.text }}>
                        {zone.type} • {zone.points.length} points
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteZone(zone.id);
                      }}
                      className="p-1 rounded hover:bg-red-500/20"
                      style={{ color: colors.error }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawing Status */}
          {isDrawing && (
            <div
              className="p-3 border-t flex items-center gap-2"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.accent + '10',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs" style={{ color: colors.textPrimary }}>
                Click on map to add points, click first point to close
              </span>
            </div>
          )}

          {/* Clear All */}
          {settings.zones.length > 0 && (
            <div className="p-3 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={handleClearAllZones}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: colors.error + '20',
                  color: colors.error,
                }}
              >
                Clear All Zones
              </button>
            </div>
          )}
        </>
      )}

      {/* Warning when disabled */}
      {!settings.enabled && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <div className="font-medium mb-1" style={{ color: colors.warning }}>
              Geofence Disabled
            </div>
            <div className="text-sm" style={{ color: colors.text }}>
              Enable geofence for safety boundaries
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
