import { useState, useEffect } from 'react';
import type { Theme } from '@/types';

type CalibrationSensor = 'compass' | 'accel' | 'gyro' | 'level' | 'radio' | 'esc';
type CalibrationStatus = 'idle' | 'in_progress' | 'success' | 'failed';

interface CalibrationStep {
  id: string;
  instruction: string;
  icon: string;
  orientation?: string;
}

interface CalibrationWizardProps {
  theme: Theme;
  sensor: CalibrationSensor;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (success: boolean) => void;
}

const sensorInfo: Record<CalibrationSensor, { name: string; icon: string; description: string }> = {
  compass: {
    name: 'Compass',
    icon: '🧭',
    description: 'Calibrate the magnetometer for accurate heading',
  },
  accel: {
    name: 'Accelerometer',
    icon: '📐',
    description: 'Calibrate the accelerometer for level flight',
  },
  gyro: {
    name: 'Gyroscope',
    icon: '🔄',
    description: 'Calibrate the gyroscope for stable attitude',
  },
  level: {
    name: 'Level Horizon',
    icon: '⚖️',
    description: 'Set the level horizon reference',
  },
  radio: {
    name: 'Radio Calibration',
    icon: '📻',
    description: 'Calibrate RC transmitter channels',
  },
  esc: {
    name: 'ESC Calibration',
    icon: '⚡',
    description: 'Calibrate electronic speed controllers',
  },
};

const compassSteps: CalibrationStep[] = [
  { id: 'nose-down', instruction: 'Hold vehicle with nose pointing DOWN', icon: '⬇️', orientation: 'Nose Down' },
  { id: 'nose-up', instruction: 'Hold vehicle with nose pointing UP', icon: '⬆️', orientation: 'Nose Up' },
  { id: 'left-side', instruction: 'Hold vehicle on its LEFT side', icon: '⬅️', orientation: 'Left Side' },
  { id: 'right-side', instruction: 'Hold vehicle on its RIGHT side', icon: '➡️', orientation: 'Right Side' },
  { id: 'back-down', instruction: 'Hold vehicle with back pointing DOWN', icon: '🔽', orientation: 'Back Down' },
  { id: 'level', instruction: 'Hold vehicle LEVEL', icon: '➖', orientation: 'Level' },
];

const accelSteps: CalibrationStep[] = [
  { id: 'level', instruction: 'Place vehicle LEVEL on a flat surface', icon: '➖', orientation: 'Level' },
  { id: 'nose-down', instruction: 'Hold vehicle with nose pointing DOWN', icon: '⬇️', orientation: 'Nose Down' },
  { id: 'nose-up', instruction: 'Hold vehicle with nose pointing UP', icon: '⬆️', orientation: 'Nose Up' },
  { id: 'left-side', instruction: 'Hold vehicle on its LEFT side', icon: '⬅️', orientation: 'Left Side' },
  { id: 'right-side', instruction: 'Hold vehicle on its RIGHT side', icon: '➡️', orientation: 'Right Side' },
  { id: 'upside-down', instruction: 'Hold vehicle UPSIDE DOWN', icon: '🔃', orientation: 'Upside Down' },
];

export function CalibrationWizard({
  theme,
  sensor,
  isOpen,
  onClose,
  onComplete,
}: CalibrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<CalibrationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState<Record<string, CalibrationStatus>>({});

  const info = sensorInfo[sensor];
  const steps = sensor === 'compass' ? compassSteps : sensor === 'accel' ? accelSteps : [];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setStatus('idle');
      setProgress(0);
      setStepProgress({});
    }
  }, [isOpen]);

  // Simulate calibration progress for demo
  useEffect(() => {
    if (status !== 'in_progress') return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Mark current step as complete
          setStepProgress((sp) => ({ ...sp, [steps[currentStep]?.id]: 'success' }));

          // Move to next step or complete
          if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
            setStatus('idle');
            setProgress(0);
          } else {
            setStatus('success');
            setTimeout(() => onComplete(true), 1500);
          }
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [status, currentStep, steps, onComplete]);

  if (!isOpen) return null;

  const colors =
    theme === 'dark'
      ? {
          bg: 'rgba(10, 15, 20, 0.98)',
          bgSecondary: '#0d1117',
          border: '#1a2332',
          text: '#8899aa',
          textPrimary: '#ffffff',
          accent: '#00d4ff',
          success: '#00ff88',
          warning: '#ffaa00',
          error: '#ff4466',
        }
      : {
          bg: 'rgba(255, 255, 255, 0.98)',
          bgSecondary: '#f8fafc',
          border: '#e2e8f0',
          text: '#64748b',
          textPrimary: '#1e293b',
          accent: '#0066cc',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
        };

  const handleStartCalibration = () => {
    setStatus('in_progress');
    setProgress(0);
  };

  const handleCancel = () => {
    setStatus('idle');
    onClose();
  };

  const renderOrientationGuide = () => {
    const step = steps[currentStep];
    if (!step) return null;

    return (
      <div
        className="p-6 rounded-xl text-center"
        style={{ backgroundColor: colors.bgSecondary, border: `1px solid ${colors.border}` }}
      >
        <div className="text-6xl mb-4">{step.icon}</div>
        <div className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>
          {step.orientation}
        </div>
        <div className="text-sm" style={{ color: colors.text }}>
          {step.instruction}
        </div>

        {/* Visual orientation guide */}
        <div className="mt-6 relative">
          <svg width="120" height="80" viewBox="0 0 120 80" className="mx-auto">
            {/* Simple drone silhouette */}
            <g
              transform={`translate(60, 40) rotate(${
                step.id === 'nose-down' ? 90 :
                step.id === 'nose-up' ? -90 :
                step.id === 'left-side' ? 0 :
                step.id === 'right-side' ? 180 :
                step.id === 'upside-down' ? 180 :
                0
              })`}
            >
              {/* Body */}
              <ellipse cx="0" cy="0" rx="25" ry="8" fill={colors.accent} opacity="0.8" />
              {/* Arms */}
              <line x1="-20" y1="-15" x2="-35" y2="-25" stroke={colors.accent} strokeWidth="3" />
              <line x1="20" y1="-15" x2="35" y2="-25" stroke={colors.accent} strokeWidth="3" />
              <line x1="-20" y1="15" x2="-35" y2="25" stroke={colors.accent} strokeWidth="3" />
              <line x1="20" y1="15" x2="35" y2="25" stroke={colors.accent} strokeWidth="3" />
              {/* Motors */}
              <circle cx="-35" cy="-25" r="8" fill={colors.accent} opacity="0.6" />
              <circle cx="35" cy="-25" r="8" fill={colors.accent} opacity="0.6" />
              <circle cx="-35" cy="25" r="8" fill={colors.accent} opacity="0.6" />
              <circle cx="35" cy="25" r="8" fill={colors.accent} opacity="0.6" />
              {/* Direction indicator (front) */}
              <polygon points="0,-12 -6,-4 6,-4" fill={colors.success} />
            </g>
          </svg>
        </div>
      </div>
    );
  };

  const renderProgress = () => (
    <div className="space-y-2">
      <div className="flex justify-between text-xs" style={{ color: colors.text }}>
        <span>Collecting data...</span>
        <span>{progress}%</span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.border }}
      >
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${progress}%`,
            backgroundColor: colors.accent,
          }}
        />
      </div>
      <div className="text-xs text-center" style={{ color: colors.text }}>
        Keep the vehicle steady in this position
      </div>
    </div>
  );

  const renderStepIndicators = () => (
    <div className="flex justify-center gap-2 mb-6">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all"
          style={{
            backgroundColor:
              stepProgress[step.id] === 'success'
                ? colors.success
                : index === currentStep
                ? colors.accent
                : colors.border,
            color:
              stepProgress[step.id] === 'success' || index === currentStep
                ? '#000'
                : colors.text,
          }}
        >
          {stepProgress[step.id] === 'success' ? '✓' : index + 1}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={handleCancel}
    >
      <div
        className="rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{info.icon}</span>
            <div>
              <h2 className="font-semibold" style={{ color: colors.textPrimary }}>
                {info.name} Calibration
              </h2>
              <p className="text-xs" style={{ color: colors.text }}>
                {info.description}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: colors.text }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl mb-4"
                style={{ backgroundColor: colors.success + '20' }}
              >
                ✓
              </div>
              <div className="text-xl font-semibold mb-2" style={{ color: colors.success }}>
                Calibration Complete!
              </div>
              <div className="text-sm" style={{ color: colors.text }}>
                {info.name} has been calibrated successfully
              </div>
            </div>
          ) : status === 'failed' ? (
            <div className="text-center py-8">
              <div
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl mb-4"
                style={{ backgroundColor: colors.error + '20' }}
              >
                ✕
              </div>
              <div className="text-xl font-semibold mb-2" style={{ color: colors.error }}>
                Calibration Failed
              </div>
              <div className="text-sm" style={{ color: colors.text }}>
                Please try again or check sensor connections
              </div>
            </div>
          ) : steps.length > 0 ? (
            <>
              {renderStepIndicators()}
              {renderOrientationGuide()}

              {status === 'in_progress' && (
                <div className="mt-6">{renderProgress()}</div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">{info.icon}</div>
              <div className="text-sm" style={{ color: colors.text }}>
                Click Start to begin {info.name.toLowerCase()} calibration
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t flex gap-3"
          style={{ borderColor: colors.border }}
        >
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm"
            style={{
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            {status === 'success' ? 'Close' : 'Cancel'}
          </button>
          {status !== 'success' && status !== 'failed' && (
            <button
              onClick={handleStartCalibration}
              disabled={status === 'in_progress'}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-opacity"
              style={{
                backgroundColor: colors.accent,
                color: '#000',
                opacity: status === 'in_progress' ? 0.5 : 1,
              }}
            >
              {status === 'in_progress' ? 'Calibrating...' : currentStep > 0 ? 'Next Position' : 'Start'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
