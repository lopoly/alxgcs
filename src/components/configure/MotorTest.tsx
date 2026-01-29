import { useState, useMemo } from 'react';
import type { Theme } from '@/types';

interface MotorTestProps {
  theme: Theme;
  motorCount?: number;
  vehicleType?: 'quad' | 'hexa' | 'octo' | 'tri' | 'plane';
}

interface Motor {
  id: number;
  label: string;
  position: { x: number; y: number };
  rotation: 'cw' | 'ccw';
}

const motorConfigs: Record<string, Motor[]> = {
  quad: [
    { id: 1, label: 'FR', position: { x: 70, y: 30 }, rotation: 'ccw' },
    { id: 2, label: 'BR', position: { x: 70, y: 70 }, rotation: 'cw' },
    { id: 3, label: 'BL', position: { x: 30, y: 70 }, rotation: 'ccw' },
    { id: 4, label: 'FL', position: { x: 30, y: 30 }, rotation: 'cw' },
  ],
  hexa: [
    { id: 1, label: 'FR', position: { x: 75, y: 35 }, rotation: 'ccw' },
    { id: 2, label: 'R', position: { x: 85, y: 50 }, rotation: 'cw' },
    { id: 3, label: 'BR', position: { x: 75, y: 65 }, rotation: 'ccw' },
    { id: 4, label: 'BL', position: { x: 25, y: 65 }, rotation: 'cw' },
    { id: 5, label: 'L', position: { x: 15, y: 50 }, rotation: 'ccw' },
    { id: 6, label: 'FL', position: { x: 25, y: 35 }, rotation: 'cw' },
  ],
  octo: [
    { id: 1, label: 'FR', position: { x: 70, y: 25 }, rotation: 'ccw' },
    { id: 2, label: 'R1', position: { x: 80, y: 40 }, rotation: 'cw' },
    { id: 3, label: 'R2', position: { x: 80, y: 60 }, rotation: 'ccw' },
    { id: 4, label: 'BR', position: { x: 70, y: 75 }, rotation: 'cw' },
    { id: 5, label: 'BL', position: { x: 30, y: 75 }, rotation: 'ccw' },
    { id: 6, label: 'L2', position: { x: 20, y: 60 }, rotation: 'cw' },
    { id: 7, label: 'L1', position: { x: 20, y: 40 }, rotation: 'ccw' },
    { id: 8, label: 'FL', position: { x: 30, y: 25 }, rotation: 'cw' },
  ],
  plane: [
    { id: 1, label: 'Motor', position: { x: 50, y: 30 }, rotation: 'cw' },
  ],
  tri: [
    { id: 1, label: 'FR', position: { x: 70, y: 30 }, rotation: 'ccw' },
    { id: 2, label: 'FL', position: { x: 30, y: 30 }, rotation: 'cw' },
    { id: 3, label: 'Rear', position: { x: 50, y: 75 }, rotation: 'cw' },
  ],
};

export function MotorTest({ theme, vehicleType = 'quad' }: MotorTestProps) {
  const [selectedMotor, setSelectedMotor] = useState<number | null>(null);
  const [throttle, setThrottle] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [allMotorsMode, setAllMotorsMode] = useState(false);

  const colors = useMemo(() => theme === 'dark'
    ? {
        bg: '#0a0f14',
        panel: '#0d1117',
        border: '#1a2332',
        text: '#8899aa',
        textPrimary: '#ffffff',
        accent: '#00d4ff',
        warning: '#ffaa00',
        error: '#ff4466',
        success: '#00ff88',
        motorOff: '#2a3444',
        motorActive: '#00d4ff',
        cw: '#00ff88',
        ccw: '#ffaa00',
      }
    : {
        bg: '#ffffff',
        panel: '#f8fafc',
        border: '#e2e8f0',
        text: '#64748b',
        textPrimary: '#1e293b',
        accent: '#0066cc',
        warning: '#d97706',
        error: '#dc2626',
        success: '#16a34a',
        motorOff: '#e2e8f0',
        motorActive: '#0066cc',
        cw: '#16a34a',
        ccw: '#d97706',
      }, [theme]);

  const motors = motorConfigs[vehicleType] || motorConfigs.quad;

  const handleTestMotor = () => {
    if (throttle === 0) return;
    setIsTestRunning(true);
    // In real app, send command to vehicle
    setTimeout(() => setIsTestRunning(false), 2000);
  };

  const handleStopAll = () => {
    setIsTestRunning(false);
    setThrottle(0);
    setSelectedMotor(null);
  };

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div
        className="p-4 rounded-lg flex items-start gap-3"
        style={{ backgroundColor: colors.warning + '20', border: `1px solid ${colors.warning}` }}
      >
        <span style={{ fontSize: '20px' }}>⚠️</span>
        <div>
          <div className="font-semibold" style={{ color: colors.warning }}>Safety Warning</div>
          <p className="text-sm mt-1" style={{ color: colors.text }}>
            Remove all propellers before testing motors. Ensure the vehicle is secured and
            keep clear of rotating parts. Test at low throttle first.
          </p>
        </div>
      </div>

      {/* Motor Diagram */}
      <div
        className="p-4 rounded-lg border"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: colors.textPrimary }}>Motor Layout</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.cw }} />
              <span style={{ color: colors.text }}>CW</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.ccw }} />
              <span style={{ color: colors.text }}>CCW</span>
            </div>
          </div>
        </div>

        {/* Drone Diagram */}
        <div
          className="relative mx-auto"
          style={{ width: '240px', height: '240px' }}
        >
          {/* Frame lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {/* Draw arms from center to motors */}
            {motors.map((motor) => (
              <line
                key={`arm-${motor.id}`}
                x1="50"
                y1="50"
                x2={motor.position.x}
                y2={motor.position.y}
                stroke={colors.border}
                strokeWidth="3"
              />
            ))}
            {/* Center body */}
            <circle cx="50" cy="50" r="8" fill={colors.panel} stroke={colors.border} strokeWidth="2" />
            {/* Direction indicator (nose) */}
            <polygon
              points="50,35 45,45 55,45"
              fill={colors.accent}
            />
          </svg>

          {/* Motor buttons */}
          {motors.map((motor) => (
            <button
              key={motor.id}
              onClick={() => setSelectedMotor(allMotorsMode ? null : motor.id)}
              className="absolute w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all"
              style={{
                left: `${motor.position.x}%`,
                top: `${motor.position.y}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: (selectedMotor === motor.id || allMotorsMode) && isTestRunning
                  ? colors.motorActive
                  : selectedMotor === motor.id
                  ? colors.motorActive + '40'
                  : colors.motorOff,
                border: `2px solid ${motor.rotation === 'cw' ? colors.cw : colors.ccw}`,
                color: (selectedMotor === motor.id || allMotorsMode) && isTestRunning ? '#000' : colors.textPrimary,
              }}
            >
              <span className="text-xs font-bold">{motor.id}</span>
              <span className="text-[9px]">{motor.label}</span>
            </button>
          ))}
        </div>

        {/* Vehicle type selector */}
        <div className="flex justify-center gap-2 mt-4">
          {['quad', 'hexa', 'octo', 'tri', 'plane'].map((type) => (
            <button
              key={type}
              className="px-3 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: vehicleType === type ? colors.accent + '20' : 'transparent',
                color: vehicleType === type ? colors.accent : colors.text,
                border: `1px solid ${vehicleType === type ? colors.accent : colors.border}`,
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div
        className="p-4 rounded-lg border"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Test Controls</h3>

        {/* Mode toggle */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!allMotorsMode}
              onChange={() => setAllMotorsMode(false)}
              className="w-4 h-4"
            />
            <span style={{ color: colors.textPrimary }}>Single Motor</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={allMotorsMode}
              onChange={() => setAllMotorsMode(true)}
              className="w-4 h-4"
            />
            <span style={{ color: colors.textPrimary }}>All Motors</span>
          </label>
        </div>

        {/* Selected motor info */}
        {!allMotorsMode && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.bg }}>
            <span style={{ color: colors.text }}>Selected: </span>
            <span style={{ color: selectedMotor ? colors.accent : colors.text }}>
              {selectedMotor ? `Motor ${selectedMotor}` : 'Click a motor to select'}
            </span>
          </div>
        )}

        {/* Throttle slider */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <label className="text-xs uppercase" style={{ color: colors.text }}>Throttle</label>
            <span className="text-sm font-mono" style={{ color: colors.accent }}>{throttle}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={throttle}
            onChange={(e) => setThrottle(parseInt(e.target.value))}
            className="w-full"
            style={{ accentColor: colors.accent }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: colors.text }}>
            <span>0%</span>
            <span>Safe: &lt;20%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleTestMotor}
            disabled={(!selectedMotor && !allMotorsMode) || throttle === 0 || isTestRunning}
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: isTestRunning ? colors.success : colors.accent,
              color: '#000',
              opacity: ((!selectedMotor && !allMotorsMode) || throttle === 0) ? 0.5 : 1,
              cursor: ((!selectedMotor && !allMotorsMode) || throttle === 0) ? 'not-allowed' : 'pointer',
            }}
          >
            {isTestRunning ? '⟳ Running...' : allMotorsMode ? 'Test All Motors' : 'Test Motor'}
          </button>
          <button
            onClick={handleStopAll}
            className="px-4 py-3 rounded-lg font-medium"
            style={{ backgroundColor: colors.error, color: '#fff' }}
          >
            Stop All
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div
        className="p-4 rounded-lg border"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        <h3 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>Instructions</h3>
        <ol className="space-y-2 text-sm" style={{ color: colors.text }}>
          <li>1. Verify propellers are removed</li>
          <li>2. Select a motor or enable "All Motors" mode</li>
          <li>3. Set throttle to a low value (start with 5-10%)</li>
          <li>4. Click "Test Motor" and verify rotation direction</li>
          <li>5. CW motors should spin clockwise when viewed from above</li>
          <li>6. CCW motors should spin counter-clockwise</li>
        </ol>
      </div>
    </div>
  );
}
