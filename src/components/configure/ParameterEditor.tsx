import { useState, useMemo, useCallback } from 'react';
import type { Theme } from '@/types';

interface Parameter {
  name: string;
  value: number;
  defaultValue: number;
  min?: number;
  max?: number;
  increment?: number;
  description: string;
  group: string;
  type: 'float' | 'int' | 'bitmask' | 'enum';
  options?: { value: number; label: string }[];
  modified?: boolean;
}

interface ParameterEditorProps {
  theme: Theme;
  onParameterChange?: (name: string, value: number) => void;
  onSave?: (parameters: Parameter[]) => void;
  onRevert?: () => void;
}

// Mock parameters organized by group
const mockParameters: Parameter[] = [
  // ARMING parameters
  { name: 'ARMING_CHECK', value: 1, defaultValue: 1, min: 0, max: 1, description: 'Enable arming checks', group: 'ARMING', type: 'int' },
  { name: 'ARMING_REQUIRE', value: 1, defaultValue: 1, min: 0, max: 2, description: 'Arming require mode', group: 'ARMING', type: 'enum', options: [{ value: 0, label: 'No' }, { value: 1, label: 'Throttle down' }, { value: 2, label: 'Rudder and Throttle' }] },

  // BATT parameters
  { name: 'BATT_CAPACITY', value: 5000, defaultValue: 5000, min: 0, max: 100000, description: 'Battery capacity in mAh', group: 'BATT', type: 'int' },
  { name: 'BATT_LOW_VOLT', value: 10.5, defaultValue: 10.5, min: 0, max: 50, increment: 0.1, description: 'Low battery voltage threshold', group: 'BATT', type: 'float' },
  { name: 'BATT_CRT_VOLT', value: 9.8, defaultValue: 9.8, min: 0, max: 50, increment: 0.1, description: 'Critical battery voltage threshold', group: 'BATT', type: 'float' },
  { name: 'BATT_ARM_VOLT', value: 11.0, defaultValue: 11.0, min: 0, max: 50, increment: 0.1, description: 'Minimum voltage to arm', group: 'BATT', type: 'float' },

  // COMPASS parameters
  { name: 'COMPASS_USE', value: 1, defaultValue: 1, min: 0, max: 1, description: 'Use compass for navigation', group: 'COMPASS', type: 'int' },
  { name: 'COMPASS_DEC', value: 0.15, defaultValue: 0, min: -3.14, max: 3.14, increment: 0.01, description: 'Compass declination (radians)', group: 'COMPASS', type: 'float' },
  { name: 'COMPASS_LEARN', value: 1, defaultValue: 1, min: 0, max: 3, description: 'Compass learning mode', group: 'COMPASS', type: 'enum', options: [{ value: 0, label: 'Disabled' }, { value: 1, label: 'Internal' }, { value: 2, label: 'EKF' }, { value: 3, label: 'InFlight' }] },

  // EKF parameters
  { name: 'EK3_ENABLE', value: 1, defaultValue: 1, min: 0, max: 1, description: 'Enable EKF3', group: 'EKF', type: 'int' },
  { name: 'EK3_GPS_TYPE', value: 0, defaultValue: 0, min: 0, max: 3, description: 'GPS type for EKF', group: 'EKF', type: 'enum', options: [{ value: 0, label: '3D velocity' }, { value: 1, label: '2D+height' }, { value: 2, label: '2D' }, { value: 3, label: 'None' }] },

  // FLIGHT parameters
  { name: 'FLTMODE1', value: 0, defaultValue: 0, min: 0, max: 24, description: 'Flight mode 1', group: 'FLIGHT', type: 'enum', options: [{ value: 0, label: 'Stabilize' }, { value: 2, label: 'Alt Hold' }, { value: 3, label: 'Auto' }, { value: 5, label: 'Loiter' }, { value: 6, label: 'RTL' }, { value: 9, label: 'Land' }] },
  { name: 'FLTMODE2', value: 2, defaultValue: 2, min: 0, max: 24, description: 'Flight mode 2', group: 'FLIGHT', type: 'enum', options: [{ value: 0, label: 'Stabilize' }, { value: 2, label: 'Alt Hold' }, { value: 3, label: 'Auto' }, { value: 5, label: 'Loiter' }, { value: 6, label: 'RTL' }, { value: 9, label: 'Land' }] },
  { name: 'FLTMODE3', value: 5, defaultValue: 5, min: 0, max: 24, description: 'Flight mode 3', group: 'FLIGHT', type: 'enum', options: [{ value: 0, label: 'Stabilize' }, { value: 2, label: 'Alt Hold' }, { value: 3, label: 'Auto' }, { value: 5, label: 'Loiter' }, { value: 6, label: 'RTL' }, { value: 9, label: 'Land' }] },

  // GPS parameters
  { name: 'GPS_TYPE', value: 1, defaultValue: 1, min: 0, max: 22, description: 'GPS type', group: 'GPS', type: 'enum', options: [{ value: 0, label: 'None' }, { value: 1, label: 'Auto' }, { value: 2, label: 'uBlox' }, { value: 5, label: 'NMEA' }] },
  { name: 'GPS_GNSS_MODE', value: 0, defaultValue: 0, min: 0, max: 127, description: 'GNSS systems enabled', group: 'GPS', type: 'bitmask' },

  // PILOT parameters
  { name: 'PILOT_THR_FILT', value: 0.5, defaultValue: 0.5, min: 0, max: 10, increment: 0.1, description: 'Throttle filter cutoff frequency', group: 'PILOT', type: 'float' },
  { name: 'PILOT_TKOFF_ALT', value: 2.5, defaultValue: 2.5, min: 0, max: 100, increment: 0.1, description: 'Takeoff altitude', group: 'PILOT', type: 'float' },

  // RTL parameters
  { name: 'RTL_ALT', value: 1500, defaultValue: 1500, min: 200, max: 300000, description: 'RTL altitude in cm', group: 'RTL', type: 'int' },
  { name: 'RTL_SPEED', value: 0, defaultValue: 0, min: 0, max: 2000, description: 'RTL speed (0=WPNAV_SPEED)', group: 'RTL', type: 'int' },
  { name: 'RTL_CONE_SLOPE', value: 3, defaultValue: 3, min: 0.5, max: 10, increment: 0.1, description: 'RTL cone slope', group: 'RTL', type: 'float' },

  // WPNAV parameters
  { name: 'WPNAV_SPEED', value: 500, defaultValue: 500, min: 20, max: 2000, description: 'Waypoint horizontal speed cm/s', group: 'WPNAV', type: 'int' },
  { name: 'WPNAV_SPEED_UP', value: 250, defaultValue: 250, min: 10, max: 1000, description: 'Waypoint climb speed cm/s', group: 'WPNAV', type: 'int' },
  { name: 'WPNAV_SPEED_DN', value: 150, defaultValue: 150, min: 10, max: 500, description: 'Waypoint descent speed cm/s', group: 'WPNAV', type: 'int' },
  { name: 'WPNAV_ACCEL', value: 100, defaultValue: 100, min: 50, max: 500, description: 'Waypoint acceleration cm/s/s', group: 'WPNAV', type: 'int' },
];

export function ParameterEditor({ theme, onParameterChange, onSave, onRevert }: ParameterEditorProps) {
  const [parameters, setParameters] = useState<Parameter[]>(mockParameters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);

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
        modified: '#ffaa00',
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
        input: '#ffffff',
        modified: '#d97706',
        error: '#dc2626',
      }, [theme]);

  // Get unique groups
  const groups = useMemo(() => {
    const groupSet = new Set(parameters.map(p => p.group));
    return Array.from(groupSet).sort();
  }, [parameters]);

  // Filter parameters
  const filteredParameters = useMemo(() => {
    return parameters.filter(p => {
      const matchesSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = selectedGroup === null || p.group === selectedGroup;
      const matchesModified = !showModifiedOnly || p.modified;
      return matchesSearch && matchesGroup && matchesModified;
    });
  }, [parameters, searchQuery, selectedGroup, showModifiedOnly]);

  // Count modified parameters
  const modifiedCount = useMemo(() => parameters.filter(p => p.modified).length, [parameters]);

  // Update parameter value
  const handleValueChange = useCallback((name: string, value: number) => {
    setParameters(prev => prev.map(p => {
      if (p.name === name) {
        const modified = value !== p.defaultValue;
        return { ...p, value, modified };
      }
      return p;
    }));
    onParameterChange?.(name, value);
  }, [onParameterChange]);

  // Reset parameter to default
  const handleReset = useCallback((name: string) => {
    setParameters(prev => prev.map(p => {
      if (p.name === name) {
        return { ...p, value: p.defaultValue, modified: false };
      }
      return p;
    }));
  }, []);

  // Reset all parameters
  const handleRevertAll = useCallback(() => {
    setParameters(prev => prev.map(p => ({ ...p, value: p.defaultValue, modified: false })));
    onRevert?.();
  }, [onRevert]);

  // Save all parameters
  const handleSaveAll = useCallback(() => {
    onSave?.(parameters.filter(p => p.modified));
  }, [parameters, onSave]);

  // Render parameter input based on type
  const renderInput = (param: Parameter) => {
    const inputStyle = {
      backgroundColor: colors.input,
      color: colors.textPrimary,
      border: `1px solid ${param.modified ? colors.modified : colors.border}`,
    };

    if (param.type === 'enum' && param.options) {
      return (
        <select
          value={param.value}
          onChange={(e) => handleValueChange(param.name, parseFloat(e.target.value))}
          className="w-full px-3 py-1.5 rounded text-sm"
          style={inputStyle}
        >
          {param.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="number"
        value={param.value}
        min={param.min}
        max={param.max}
        step={param.increment || (param.type === 'float' ? 0.1 : 1)}
        onChange={(e) => handleValueChange(param.name, parseFloat(e.target.value))}
        className="w-full px-3 py-1.5 rounded text-sm font-mono"
        style={inputStyle}
      />
    );
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: colors.border }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Parameter Editor
          </h3>
          <div className="flex items-center gap-2">
            {modifiedCount > 0 && (
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: colors.modified + '20', color: colors.modified }}
              >
                {modifiedCount} modified
              </span>
            )}
            <button
              onClick={handleRevertAll}
              disabled={modifiedCount === 0}
              className="px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: colors.hover, color: colors.text }}
            >
              Revert All
            </button>
            <button
              onClick={handleSaveAll}
              disabled={modifiedCount === 0}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: colors.accent, color: '#000000' }}
            >
              Write to Vehicle
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg text-sm"
              style={{
                backgroundColor: colors.input,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
              }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.text }}>
              🔍
            </span>
          </div>
          <select
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value || null)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: colors.input,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <option value="">All Groups</option>
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showModifiedOnly}
              onChange={(e) => setShowModifiedOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm" style={{ color: colors.text }}>Modified only</span>
          </label>
        </div>
      </div>

      {/* Parameter list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredParameters.map(param => (
            <div
              key={param.name}
              className="p-3 rounded-lg"
              style={{
                backgroundColor: colors.panel,
                border: `1px solid ${param.modified ? colors.modified : colors.border}`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-sm font-medium"
                      style={{ color: param.modified ? colors.modified : colors.textPrimary }}
                    >
                      {param.name}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-xs"
                      style={{ backgroundColor: colors.hover, color: colors.text }}
                    >
                      {param.group}
                    </span>
                    {param.modified && (
                      <span className="text-xs" style={{ color: colors.modified }}>●</span>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.text }}>
                    {param.description}
                  </p>
                  {param.min !== undefined && param.max !== undefined && (
                    <p className="text-xs mt-0.5 font-mono" style={{ color: colors.text }}>
                      Range: {param.min} - {param.max}
                      {param.defaultValue !== undefined && ` (default: ${param.defaultValue})`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    {renderInput(param)}
                  </div>
                  {param.modified && (
                    <button
                      onClick={() => handleReset(param.name)}
                      className="p-1.5 rounded hover:bg-white/10"
                      title="Reset to default"
                      style={{ color: colors.text }}
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredParameters.length === 0 && (
            <div className="text-center py-8" style={{ color: colors.text }}>
              No parameters found matching your criteria
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t text-xs" style={{ borderColor: colors.border, color: colors.text }}>
        Showing {filteredParameters.length} of {parameters.length} parameters
      </div>
    </div>
  );
}
