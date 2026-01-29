import { useState, useMemo, useEffect } from 'react';
import type { Theme } from '@/types';

interface FirmwareVersion {
  version: string;
  date: string;
  type: 'stable' | 'beta' | 'dev';
  changelog: string[];
  size: string;
  downloadUrl?: string;
}

interface FirmwareUpdateProps {
  theme: Theme;
}

const availableFirmware: FirmwareVersion[] = [
  {
    version: '4.5.1',
    date: '2026-01-15',
    type: 'stable',
    changelog: [
      'Fixed altitude hold oscillation in gusty conditions',
      'Improved GPS failsafe response time',
      'Added support for new DShot protocol variants',
      'Fixed memory leak in logging subsystem',
    ],
    size: '1.2 MB',
  },
  {
    version: '4.5.0',
    date: '2026-01-01',
    type: 'stable',
    changelog: [
      'New EKF3 navigation filter improvements',
      'Enhanced battery monitoring accuracy',
      'Support for BLHeli_32 telemetry',
      'Improved compass interference rejection',
    ],
    size: '1.2 MB',
  },
  {
    version: '4.6.0-beta1',
    date: '2026-01-20',
    type: 'beta',
    changelog: [
      'Experimental Lua scripting support',
      'New autonomous landing detection',
      'Improved motor mixer calculations',
      'Beta testing for new sensor drivers',
    ],
    size: '1.3 MB',
  },
  {
    version: '4.6.0-dev',
    date: '2026-01-25',
    type: 'dev',
    changelog: [
      'Latest development features',
      'Experimental code - use at your own risk',
      'May contain breaking changes',
    ],
    size: '1.4 MB',
  },
];

type UpdateStep = 'select' | 'backup' | 'download' | 'flash' | 'verify' | 'complete' | 'error';

export function FirmwareUpdate({ theme }: FirmwareUpdateProps) {
  const [currentVersion] = useState('4.4.4');
  const [selectedVersion, setSelectedVersion] = useState<FirmwareVersion | null>(null);
  const [showBeta, setShowBeta] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [useCustomFile, setUseCustomFile] = useState(false);

  // Update process state
  const [updateStep, setUpdateStep] = useState<UpdateStep>('select');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backupComplete, setBackupComplete] = useState(false);

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

  const filteredFirmware = availableFirmware.filter((fw) => {
    if (fw.type === 'stable') return true;
    if (fw.type === 'beta' && showBeta) return true;
    if (fw.type === 'dev' && showDev) return true;
    return false;
  });

  const getTypeColor = (type: FirmwareVersion['type']) => {
    switch (type) {
      case 'stable': return colors.success;
      case 'beta': return colors.warning;
      case 'dev': return colors.error;
    }
  };

  // Simulate update process
  useEffect(() => {
    if (updateStep === 'backup') {
      const timer = setTimeout(() => {
        setProgress(100);
        setBackupComplete(true);
        setUpdateStep('download');
        setProgress(0);
      }, 2000);

      const progressTimer = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 150);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }

    if (updateStep === 'download') {
      const timer = setTimeout(() => {
        setProgress(100);
        setUpdateStep('flash');
        setProgress(0);
      }, 3000);

      const progressTimer = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 95));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }

    if (updateStep === 'flash') {
      const timer = setTimeout(() => {
        setProgress(100);
        setUpdateStep('verify');
        setProgress(0);
      }, 5000);

      const progressTimer = setInterval(() => {
        setProgress((p) => Math.min(p + 2, 95));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }

    if (updateStep === 'verify') {
      const timer = setTimeout(() => {
        setProgress(100);
        // Simulate occasional failure
        if (Math.random() > 0.9) {
          setErrorMessage('Verification failed: CRC mismatch');
          setUpdateStep('error');
        } else {
          setUpdateStep('complete');
        }
      }, 2000);

      const progressTimer = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 150);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }
  }, [updateStep]);

  const startUpdate = () => {
    if (!selectedVersion && !customFile) return;
    setUpdateStep('backup');
    setProgress(0);
    setErrorMessage(null);
    setBackupComplete(false);
  };

  const cancelUpdate = () => {
    setUpdateStep('select');
    setProgress(0);
    setErrorMessage(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCustomFile(file);
      setUseCustomFile(true);
      setSelectedVersion(null);
    }
  };

  const getStepLabel = (step: UpdateStep) => {
    switch (step) {
      case 'backup': return 'Backing up parameters...';
      case 'download': return 'Downloading firmware...';
      case 'flash': return 'Flashing firmware...';
      case 'verify': return 'Verifying installation...';
      case 'complete': return 'Update complete!';
      case 'error': return 'Update failed';
      default: return '';
    }
  };

  const renderUpdateProcess = () => (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {(['backup', 'download', 'flash', 'verify'] as UpdateStep[]).map((step, index) => {
          const isActive = step === updateStep;
          const isComplete = ['backup', 'download', 'flash', 'verify'].indexOf(updateStep) > index ||
                            updateStep === 'complete';
          const hasError = updateStep === 'error' && step === 'verify';

          return (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: hasError ? colors.error :
                                    isComplete ? colors.success :
                                    isActive ? colors.accent :
                                    colors.hover,
                    color: (isComplete || isActive || hasError) ? '#000' : colors.text,
                  }}
                >
                  {hasError ? '!' : isComplete ? '✓' : index + 1}
                </div>
                <span className="text-xs mt-2 capitalize" style={{ color: colors.text }}>
                  {step}
                </span>
              </div>
              {index < 3 && (
                <div
                  className="w-16 h-0.5 mx-2"
                  style={{
                    backgroundColor: isComplete ? colors.success : colors.border,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Progress */}
      {updateStep !== 'complete' && updateStep !== 'error' && updateStep !== 'select' && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: colors.hover }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium" style={{ color: colors.textPrimary }}>
              {getStepLabel(updateStep)}
            </span>
            <span style={{ color: colors.accent }}>{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: colors.accent }}
            />
          </div>
        </div>
      )}

      {/* Warning during flash */}
      {updateStep === 'flash' && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{ backgroundColor: colors.error + '15', border: `1px solid ${colors.error}40` }}
        >
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke={colors.error}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-sm" style={{ color: colors.error }}>
              Do not disconnect power or USB!
            </p>
            <p className="text-xs mt-1" style={{ color: colors.text }}>
              Interrupting the flash process may brick your flight controller.
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {updateStep === 'complete' && (
        <div
          className="p-6 rounded-lg text-center"
          style={{ backgroundColor: colors.success + '15', border: `1px solid ${colors.success}40` }}
        >
          <div className="text-4xl mb-3">✓</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.success }}>
            Firmware Update Complete!
          </h3>
          <p className="text-sm" style={{ color: colors.text }}>
            Your vehicle has been updated to {selectedVersion?.version || 'custom firmware'}.
            Please reboot the vehicle to apply changes.
          </p>
          <button
            onClick={cancelUpdate}
            className="mt-4 px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: colors.accent, color: '#000' }}
          >
            Done
          </button>
        </div>
      )}

      {/* Error State */}
      {updateStep === 'error' && (
        <div
          className="p-6 rounded-lg text-center"
          style={{ backgroundColor: colors.error + '15', border: `1px solid ${colors.error}40` }}
        >
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.error }}>
            Update Failed
          </h3>
          <p className="text-sm mb-4" style={{ color: colors.text }}>
            {errorMessage || 'An unknown error occurred during the update.'}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={cancelUpdate}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
            >
              Cancel
            </button>
            <button
              onClick={startUpdate}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ backgroundColor: colors.accent, color: '#000' }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Cancel button during update */}
      {updateStep !== 'complete' && updateStep !== 'error' && updateStep !== 'select' && updateStep !== 'flash' && (
        <button
          onClick={cancelUpdate}
          className="w-full px-4 py-2 rounded-lg"
          style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
        >
          Cancel Update
        </button>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Current Version */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Current Firmware
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold" style={{ color: colors.accent }}>
              ArduPlane v{currentVersion}
            </div>
            <div className="text-sm mt-1" style={{ color: colors.text }}>
              Installed: December 15, 2025
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: colors.warning + '20', color: colors.warning }}
          >
            Update Available
          </div>
        </div>
      </div>

      {updateStep !== 'select' ? (
        renderUpdateProcess()
      ) : (
        <>
          {/* Available Versions */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: colors.textPrimary }}>
                Available Firmware
              </h3>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBeta}
                    onChange={(e) => setShowBeta(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span style={{ color: colors.warning }}>Beta</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDev}
                    onChange={(e) => setShowDev(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span style={{ color: colors.error }}>Dev</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {filteredFirmware.map((fw) => (
                <div
                  key={fw.version}
                  onClick={() => {
                    setSelectedVersion(fw);
                    setUseCustomFile(false);
                    setCustomFile(null);
                  }}
                  className="p-4 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: selectedVersion?.version === fw.version && !useCustomFile
                      ? colors.accent + '15'
                      : colors.hover,
                    border: `1px solid ${
                      selectedVersion?.version === fw.version && !useCustomFile
                        ? colors.accent
                        : colors.border
                    }`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold" style={{ color: colors.textPrimary }}>
                        v{fw.version}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium uppercase"
                        style={{
                          backgroundColor: getTypeColor(fw.type) + '20',
                          color: getTypeColor(fw.type),
                        }}
                      >
                        {fw.type}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: colors.text }}>
                      {fw.date} • {fw.size}
                    </span>
                  </div>
                  <ul className="text-xs space-y-1" style={{ color: colors.text }}>
                    {fw.changelog.slice(0, 2).map((change, i) => (
                      <li key={i}>• {change}</li>
                    ))}
                    {fw.changelog.length > 2 && (
                      <li style={{ color: colors.accent }}>
                        + {fw.changelog.length - 2} more changes
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Firmware */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
          >
            <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Custom Firmware
            </h3>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
              style={{ borderColor: customFile ? colors.accent : colors.border }}
              onClick={() => document.getElementById('firmware-file-input')?.click()}
            >
              <input
                id="firmware-file-input"
                type="file"
                accept=".apj,.bin,.px4"
                onChange={handleFileSelect}
                className="hidden"
              />
              {customFile ? (
                <div>
                  <div className="text-2xl mb-2">📦</div>
                  <div className="font-medium" style={{ color: colors.textPrimary }}>
                    {customFile.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.text }}>
                    {(customFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-2">📁</div>
                  <div className="font-medium" style={{ color: colors.textPrimary }}>
                    Click to select firmware file
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.text }}>
                    Supports .apj, .bin, .px4 files
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Backup Parameters */}
          <div
            className="rounded-xl p-4 flex items-center justify-between"
            style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
          >
            <div>
              <h4 className="font-medium" style={{ color: colors.textPrimary }}>
                Backup Parameters
              </h4>
              <p className="text-xs mt-1" style={{ color: colors.text }}>
                Parameters will be backed up before updating
              </p>
            </div>
            <div className="flex items-center gap-2">
              {backupComplete && (
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.success + '20', color: colors.success }}>
                  Backup saved
                </span>
              )}
              <button
                className="px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
              >
                Export Params
              </button>
            </div>
          </div>

          {/* Warning */}
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ backgroundColor: colors.warning + '15', border: `1px solid ${colors.warning}40` }}
          >
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke={colors.warning}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-sm" style={{ color: colors.warning }}>
                Important Safety Notice
              </p>
              <ul className="text-xs mt-1 space-y-1" style={{ color: colors.text }}>
                <li>• Ensure battery is disconnected from the vehicle</li>
                <li>• Keep USB connected throughout the entire process</li>
                <li>• Do not interrupt the flashing process</li>
                <li>• Recalibrate sensors after major version updates</li>
              </ul>
            </div>
          </div>

          {/* Update Button */}
          <button
            onClick={startUpdate}
            disabled={!selectedVersion && !customFile}
            className="w-full px-4 py-3 rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: colors.accent, color: '#000' }}
          >
            {selectedVersion
              ? `Update to v${selectedVersion.version}`
              : customFile
              ? `Flash ${customFile.name}`
              : 'Select a firmware version'}
          </button>
        </>
      )}
    </div>
  );
}
