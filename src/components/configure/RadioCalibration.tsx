import { useState, useEffect, useMemo } from 'react';
import type { Theme } from '@/types';

interface ChannelData {
  id: number;
  name: string;
  value: number;
  min: number;
  max: number;
  trim: number;
  reversed: boolean;
  function: string;
}

interface RadioCalibrationProps {
  theme: Theme;
}

type CalibrationStep = 'idle' | 'center' | 'move' | 'complete';

export function RadioCalibration({ theme }: RadioCalibrationProps) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState<CalibrationStep>('idle');
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  const [channels, setChannels] = useState<ChannelData[]>([
    { id: 1, name: 'Roll', value: 1500, min: 1100, max: 1900, trim: 0, reversed: false, function: 'Roll' },
    { id: 2, name: 'Pitch', value: 1500, min: 1100, max: 1900, trim: 0, reversed: false, function: 'Pitch' },
    { id: 3, name: 'Throttle', value: 1000, min: 1000, max: 2000, trim: 0, reversed: false, function: 'Throttle' },
    { id: 4, name: 'Yaw', value: 1500, min: 1100, max: 1900, trim: 0, reversed: false, function: 'Yaw' },
    { id: 5, name: 'Aux 1', value: 1500, min: 1000, max: 2000, trim: 0, reversed: false, function: 'Flight Mode' },
    { id: 6, name: 'Aux 2', value: 1000, min: 1000, max: 2000, trim: 0, reversed: false, function: 'RTL Switch' },
    { id: 7, name: 'Aux 3', value: 1500, min: 1000, max: 2000, trim: 0, reversed: false, function: 'Unused' },
    { id: 8, name: 'Aux 4', value: 1500, min: 1000, max: 2000, trim: 0, reversed: false, function: 'Unused' },
  ]);

  const [failsafeValue, setFailsafeValue] = useState(975);
  const [failsafeAction, setFailsafeAction] = useState<'rtl' | 'land' | 'hold'>('rtl');

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

  // Simulate live RC values
  useEffect(() => {
    const interval = setInterval(() => {
      setChannels((prev) =>
        prev.map((ch) => ({
          ...ch,
          value: ch.value + (Math.random() - 0.5) * 10,
        }))
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Calibration simulation
  useEffect(() => {
    if (!isCalibrating) return;

    if (calibrationStep === 'center') {
      const timer = setTimeout(() => {
        setCalibrationStep('move');
        setCalibrationProgress(50);
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (calibrationStep === 'move') {
      const progressInterval = setInterval(() => {
        setCalibrationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setCalibrationStep('complete');
            return 100;
          }
          return prev + 2;
        });
      }, 200);
      return () => clearInterval(progressInterval);
    }
  }, [isCalibrating, calibrationStep]);

  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationStep('center');
    setCalibrationProgress(0);
  };

  const cancelCalibration = () => {
    setIsCalibrating(false);
    setCalibrationStep('idle');
    setCalibrationProgress(0);
  };

  const finishCalibration = () => {
    setIsCalibrating(false);
    setCalibrationStep('idle');
    setCalibrationProgress(0);
    // Update min/max values based on calibration
    setChannels((prev) =>
      prev.map((ch) => ({
        ...ch,
        min: Math.min(ch.min, ch.value - 400),
        max: Math.max(ch.max, ch.value + 400),
      }))
    );
  };

  const toggleReverse = (id: number) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, reversed: !ch.reversed } : ch))
    );
  };

  const updateTrim = (id: number, delta: number) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === id ? { ...ch, trim: Math.max(-100, Math.min(100, ch.trim + delta)) } : ch
      )
    );
  };

  const getChannelPercentage = (channel: ChannelData) => {
    const range = channel.max - channel.min;
    const adjusted = channel.value - channel.min;
    return Math.max(0, Math.min(100, (adjusted / range) * 100));
  };

  const functionOptions = [
    'Roll', 'Pitch', 'Throttle', 'Yaw', 'Flight Mode', 'RTL Switch',
    'Arm Switch', 'Gimbal Pitch', 'Gimbal Yaw', 'Camera Trigger', 'Unused',
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Calibration Card */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Radio Calibration
        </h3>

        {!isCalibrating ? (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.text }}>
              Calibrate your RC transmitter to ensure proper control response. Make sure your
              transmitter is on and bound to the receiver.
            </p>
            <button
              onClick={startCalibration}
              className="px-4 py-2 rounded-lg font-medium text-sm"
              style={{ backgroundColor: colors.accent, color: '#000' }}
            >
              Start Calibration
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: colors.textPrimary }}>
                  {calibrationStep === 'center' && 'Step 1: Center all sticks and trims'}
                  {calibrationStep === 'move' && 'Step 2: Move all sticks to extremes'}
                  {calibrationStep === 'complete' && 'Calibration Complete!'}
                </span>
                <span style={{ color: colors.accent }}>{calibrationProgress}%</span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.hover }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${calibrationProgress}%`,
                    backgroundColor: calibrationStep === 'complete' ? colors.success : colors.accent,
                  }}
                />
              </div>
            </div>

            {/* Instructions */}
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.hover }}
            >
              {calibrationStep === 'center' && (
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: colors.warning + '20', color: colors.warning }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      Center all sticks and trims
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.text }}>
                      Move all control sticks to center position and ensure all trim switches are centered.
                      Then wait for the next step.
                    </p>
                  </div>
                </div>
              )}
              {calibrationStep === 'move' && (
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      Move all sticks to their extremes
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.text }}>
                      Move each stick to all corners: up, down, left, right, and diagonals.
                      Toggle all switches through their full range.
                    </p>
                  </div>
                </div>
              )}
              {calibrationStep === 'complete' && (
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: colors.success + '20', color: colors.success }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      Calibration successful!
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.text }}>
                      All channels have been calibrated. Click "Finish" to save the calibration data.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={cancelCalibration}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
              >
                Cancel
              </button>
              {calibrationStep === 'complete' && (
                <button
                  onClick={finishCalibration}
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{ backgroundColor: colors.success, color: '#000' }}
                >
                  Finish Calibration
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Channel Visualization */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Channel Monitor
        </h3>

        <div className="space-y-3">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.hover }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                    style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
                  >
                    {channel.id}
                  </span>
                  <div>
                    <div className="font-medium text-sm" style={{ color: colors.textPrimary }}>
                      {channel.name}
                    </div>
                    <div className="text-xs" style={{ color: colors.text }}>
                      {channel.function}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm" style={{ color: colors.textPrimary }}>
                    {Math.round(channel.value)}
                  </div>
                  <div className="text-xs" style={{ color: colors.text }}>
                    {channel.min} - {channel.max}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-4 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                <div
                  className="absolute h-full transition-all duration-75"
                  style={{
                    width: `${getChannelPercentage(channel)}%`,
                    backgroundColor: channel.id <= 4 ? colors.accent : colors.success,
                  }}
                />
                {/* Center marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{ left: '50%', backgroundColor: colors.textPrimary }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => toggleReverse(channel.id)}
                  className={`text-xs px-2 py-1 rounded ${
                    channel.reversed ? 'font-bold' : ''
                  }`}
                  style={{
                    backgroundColor: channel.reversed ? colors.warning + '20' : colors.border,
                    color: channel.reversed ? colors.warning : colors.text,
                  }}
                >
                  {channel.reversed ? 'Reversed' : 'Normal'}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateTrim(channel.id, -5)}
                    className="w-6 h-6 flex items-center justify-center rounded"
                    style={{ backgroundColor: colors.border, color: colors.text }}
                  >
                    -
                  </button>
                  <span
                    className="text-xs w-12 text-center font-mono"
                    style={{ color: colors.textPrimary }}
                  >
                    Trim: {channel.trim}
                  </span>
                  <button
                    onClick={() => updateTrim(channel.id, 5)}
                    className="w-6 h-6 flex items-center justify-center rounded"
                    style={{ backgroundColor: colors.border, color: colors.text }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel Assignment */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Channel Assignment
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {channels.map((channel) => (
            <div key={channel.id} className="space-y-1">
              <label className="text-xs" style={{ color: colors.text }}>
                Channel {channel.id} ({channel.name})
              </label>
              <select
                value={channel.function}
                onChange={(e) =>
                  setChannels((prev) =>
                    prev.map((ch) =>
                      ch.id === channel.id ? { ...ch, function: e.target.value } : ch
                    )
                  )
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: colors.hover,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {functionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Failsafe Configuration */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          RC Failsafe
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: colors.text }}>
              Failsafe PWM Value
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={failsafeValue}
                onChange={(e) => setFailsafeValue(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: colors.hover,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                }}
              />
              <span className="text-sm" style={{ color: colors.text }}>
                us
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: colors.text }}>
              Failsafe triggers when throttle drops below this value
            </p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: colors.text }}>
              Failsafe Action
            </label>
            <div className="flex gap-2">
              {(['rtl', 'land', 'hold'] as const).map((action) => (
                <button
                  key={action}
                  onClick={() => setFailsafeAction(action)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm capitalize"
                  style={{
                    backgroundColor: failsafeAction === action ? colors.accent + '20' : colors.hover,
                    color: failsafeAction === action ? colors.accent : colors.text,
                    border: `1px solid ${failsafeAction === action ? colors.accent : colors.border}`,
                  }}
                >
                  {action === 'rtl' ? 'Return to Launch' : action === 'land' ? 'Land Now' : 'Hold Position'}
                </button>
              ))}
            </div>
          </div>

          <button
            className="w-full px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: colors.error + '20', color: colors.error }}
          >
            Test Failsafe
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        className="w-full px-4 py-3 rounded-lg font-medium"
        style={{ backgroundColor: colors.accent, color: '#000' }}
      >
        Save Radio Settings
      </button>
    </div>
  );
}
