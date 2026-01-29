import { useState, useEffect, useMemo } from 'react';
import type { Theme } from '@/types';

interface FlightMode {
  id: number;
  name: string;
  description: string;
  category: 'basic' | 'assisted' | 'auto' | 'advanced';
}

interface ModeSlot {
  id: number;
  mode: string;
  pwmMin: number;
  pwmMax: number;
}

interface FlightModesConfigProps {
  theme: Theme;
}

const availableModes: FlightMode[] = [
  // Basic modes
  { id: 1, name: 'Stabilize', description: 'Self-levels the roll and pitch axis', category: 'basic' },
  { id: 2, name: 'Acro', description: 'Rate control, no auto-leveling', category: 'basic' },
  { id: 3, name: 'Alt Hold', description: 'Holds altitude using barometer', category: 'basic' },

  // Assisted modes
  { id: 4, name: 'Loiter', description: 'Holds position and altitude using GPS', category: 'assisted' },
  { id: 5, name: 'PosHold', description: 'Like Loiter but with direct control', category: 'assisted' },
  { id: 6, name: 'Sport', description: 'Rate control with altitude hold', category: 'assisted' },

  // Auto modes
  { id: 7, name: 'Auto', description: 'Follows pre-programmed mission', category: 'auto' },
  { id: 8, name: 'RTL', description: 'Returns to launch position', category: 'auto' },
  { id: 9, name: 'Land', description: 'Lands at current position', category: 'auto' },
  { id: 10, name: 'Circle', description: 'Circles around a point', category: 'auto' },
  { id: 11, name: 'Guided', description: 'Guided by GCS commands', category: 'auto' },

  // Advanced modes
  { id: 12, name: 'Drift', description: 'Like stabilize but with coordinated turns', category: 'advanced' },
  { id: 13, name: 'Brake', description: 'Stops and holds position', category: 'advanced' },
  { id: 14, name: 'Smart RTL', description: 'Returns retracing its path', category: 'advanced' },
  { id: 15, name: 'Follow', description: 'Follows another vehicle', category: 'advanced' },
];

export function FlightModesConfig({ theme }: FlightModesConfigProps) {
  const [modeLevel, setModeLevel] = useState<'simple' | 'standard' | 'advanced'>('standard');
  const [switchChannel, setSwitchChannel] = useState(5);
  const [currentPWM, setCurrentPWM] = useState(1500);
  const [activeSlot, setActiveSlot] = useState(3);

  const [modeSlots, setModeSlots] = useState<ModeSlot[]>([
    { id: 1, mode: 'Stabilize', pwmMin: 1000, pwmMax: 1165 },
    { id: 2, mode: 'Alt Hold', pwmMin: 1166, pwmMax: 1330 },
    { id: 3, mode: 'Loiter', pwmMin: 1331, pwmMax: 1495 },
    { id: 4, mode: 'Auto', pwmMin: 1496, pwmMax: 1660 },
    { id: 5, mode: 'RTL', pwmMin: 1661, pwmMax: 1825 },
    { id: 6, mode: 'Land', pwmMin: 1826, pwmMax: 2000 },
  ]);

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

  // Simulate live PWM updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPWM((prev) => prev + (Math.random() - 0.5) * 20);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Calculate active slot based on PWM
  useEffect(() => {
    const slot = modeSlots.find(
      (s) => currentPWM >= s.pwmMin && currentPWM <= s.pwmMax
    );
    if (slot) {
      setActiveSlot(slot.id);
    }
  }, [currentPWM, modeSlots]);

  const updateSlotMode = (slotId: number, mode: string) => {
    setModeSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, mode } : slot))
    );
  };

  const filteredModes = availableModes.filter((mode) => {
    if (modeLevel === 'simple') {
      return ['Stabilize', 'Alt Hold', 'Loiter', 'RTL', 'Land'].includes(mode.name);
    }
    if (modeLevel === 'standard') {
      return mode.category !== 'advanced';
    }
    return true;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic':
        return colors.success;
      case 'assisted':
        return colors.accent;
      case 'auto':
        return colors.warning;
      case 'advanced':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getPWMPosition = (pwm: number) => {
    return ((pwm - 1000) / 1000) * 100;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Mode Level Selection */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Mode Complexity
        </h3>
        <div className="flex gap-2">
          {(['simple', 'standard', 'advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setModeLevel(level)}
              className="flex-1 px-4 py-3 rounded-lg text-sm capitalize"
              style={{
                backgroundColor: modeLevel === level ? colors.accent + '20' : colors.hover,
                color: modeLevel === level ? colors.accent : colors.text,
                border: `1px solid ${modeLevel === level ? colors.accent : colors.border}`,
              }}
            >
              <div className="font-medium">{level}</div>
              <div className="text-xs mt-1" style={{ color: colors.text }}>
                {level === 'simple' && '5 modes'}
                {level === 'standard' && '11 modes'}
                {level === 'advanced' && '15 modes'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Switch Channel Selection */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Mode Switch Channel
        </h3>
        <div className="flex items-center gap-4">
          <select
            value={switchChannel}
            onChange={(e) => setSwitchChannel(parseInt(e.target.value))}
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: colors.hover,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            {[5, 6, 7, 8].map((ch) => (
              <option key={ch} value={ch}>
                Channel {ch}
              </option>
            ))}
          </select>
          <div className="text-right">
            <div className="font-mono text-lg" style={{ color: colors.accent }}>
              {Math.round(currentPWM)}
            </div>
            <div className="text-xs" style={{ color: colors.text }}>
              Current PWM
            </div>
          </div>
        </div>

        {/* PWM Visualization */}
        <div className="mt-4">
          <div
            className="relative h-8 rounded-lg overflow-hidden"
            style={{ backgroundColor: colors.hover }}
          >
            {/* Slot regions */}
            {modeSlots.map((slot, index) => (
              <div
                key={slot.id}
                className="absolute top-0 bottom-0 flex items-center justify-center text-xs font-medium transition-colors"
                style={{
                  left: `${getPWMPosition(slot.pwmMin)}%`,
                  width: `${((slot.pwmMax - slot.pwmMin) / 1000) * 100}%`,
                  backgroundColor:
                    activeSlot === slot.id
                      ? colors.accent + '40'
                      : index % 2 === 0
                      ? 'transparent'
                      : colors.border + '40',
                  color: activeSlot === slot.id ? colors.accent : colors.text,
                  borderRight: `1px solid ${colors.border}`,
                }}
              >
                {slot.id}
              </div>
            ))}
            {/* Current position indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 transition-all duration-75"
              style={{
                left: `${getPWMPosition(currentPWM)}%`,
                backgroundColor: colors.textPrimary,
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: colors.text }}>
            <span>1000</span>
            <span>1500</span>
            <span>2000</span>
          </div>
        </div>
      </div>

      {/* Flight Mode Slots */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Flight Mode Slots
        </h3>

        <div className="space-y-3">
          {modeSlots.map((slot) => {
            const selectedMode = availableModes.find((m) => m.name === slot.mode);
            return (
              <div
                key={slot.id}
                className="p-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: activeSlot === slot.id ? colors.accent + '15' : colors.hover,
                  border: `1px solid ${activeSlot === slot.id ? colors.accent : colors.border}`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-lg"
                    style={{
                      backgroundColor:
                        activeSlot === slot.id ? colors.accent : colors.border,
                      color: activeSlot === slot.id ? '#000' : colors.textPrimary,
                    }}
                  >
                    {slot.id}
                  </div>
                  <div className="flex-1">
                    <select
                      value={slot.mode}
                      onChange={(e) => updateSlotMode(slot.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.textPrimary,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {filteredModes.map((mode) => (
                        <option key={mode.id} value={mode.name}>
                          {mode.name}
                        </option>
                      ))}
                    </select>
                    {selectedMode && (
                      <p className="text-xs mt-1" style={{ color: colors.text }}>
                        {selectedMode.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs" style={{ color: colors.text }}>
                    <div>{slot.pwmMin} - {slot.pwmMax}</div>
                    <div>PWM</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Modes Reference */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Available Flight Modes
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {filteredModes.map((mode) => (
            <div
              key={mode.id}
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.hover }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getCategoryColor(mode.category) }}
                />
                <span className="font-medium text-sm" style={{ color: colors.textPrimary }}>
                  {mode.name}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: colors.text }}>
                {mode.description}
              </p>
            </div>
          ))}
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
          {[
            { name: 'Basic', category: 'basic' },
            { name: 'Assisted', category: 'assisted' },
            { name: 'Auto', category: 'auto' },
            { name: 'Advanced', category: 'advanced' },
          ].map((cat) => (
            <div key={cat.category} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat.category) }}
              />
              <span className="text-xs" style={{ color: colors.text }}>
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{ backgroundColor: colors.warning + '15', border: `1px solid ${colors.warning}40` }}
      >
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke={colors.warning}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <p className="font-medium text-sm" style={{ color: colors.warning }}>
            Test your configuration
          </p>
          <p className="text-xs mt-1" style={{ color: colors.text }}>
            Always test flight mode changes on the ground before flying. Move your mode switch and
            verify the correct mode is displayed on the HUD.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        className="w-full px-4 py-3 rounded-lg font-medium"
        style={{ backgroundColor: colors.accent, color: '#000' }}
      >
        Save Flight Modes
      </button>
    </div>
  );
}
