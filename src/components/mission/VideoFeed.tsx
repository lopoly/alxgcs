import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@/types';

interface VideoFeedProps {
  theme: Theme;
  isRecording?: boolean;
  resolution?: string;
  streamUrl?: string;
  cameraId?: string;
  cameras?: { id: string; name: string }[];
  onSnapshot?: () => void;
  onToggleRecord?: () => void;
  onFullscreen?: () => void;
  onCameraChange?: (cameraId: string) => void;
  onGimbalMove?: (pitch: number, yaw: number) => void;
  onPictureInPicture?: () => void;
}

type StreamStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
type VideoQuality = '4K' | '1080p' | '720p' | '480p';

export function VideoFeed({
  theme,
  isRecording = false,
  resolution = '1080p 30fps',
  cameraId = 'cam1',
  cameras = [
    { id: 'cam1', name: 'Main Camera' },
    { id: 'cam2', name: 'Thermal' },
    { id: 'cam3', name: 'FPV' },
  ],
  onSnapshot,
  onToggleRecord,
  onFullscreen,
  onCameraChange,
  onGimbalMove,
  onPictureInPicture,
}: VideoFeedProps) {
  const [streamStatus] = useState<StreamStatus>('connected');
  const [showControls, setShowControls] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingSize, setRecordingSize] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('1080p');
  const [showSettings, setShowSettings] = useState(false);
  const [gimbalPitch, setGimbalPitch] = useState(0);
  const [gimbalYaw, setGimbalYaw] = useState(0);
  const [showGimbalControl, setShowGimbalControl] = useState(false);

  // Recording timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
        // Simulate file size growth (~5MB/s for 1080p)
        setRecordingSize((prev) => prev + 5);
      }, 1000);
    } else {
      setRecordingDuration(0);
      setRecordingSize(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatSize = (mb: number): string => {
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  // Handle gimbal control
  const handleGimbalControl = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right' | 'center') => {
      let newPitch = gimbalPitch;
      let newYaw = gimbalYaw;
      const step = 10;

      switch (direction) {
        case 'up':
          newPitch = Math.min(90, gimbalPitch + step);
          break;
        case 'down':
          newPitch = Math.max(-90, gimbalPitch - step);
          break;
        case 'left':
          newYaw = Math.max(-180, gimbalYaw - step);
          break;
        case 'right':
          newYaw = Math.min(180, gimbalYaw + step);
          break;
        case 'center':
          newPitch = 0;
          newYaw = 0;
          break;
      }

      setGimbalPitch(newPitch);
      setGimbalYaw(newYaw);
      onGimbalMove?.(newPitch, newYaw);
    },
    [gimbalPitch, gimbalYaw, onGimbalMove]
  );

  const colors =
    theme === 'dark'
      ? {
          bg: '#0d1117',
          overlay: 'rgba(0, 0, 0, 0.7)',
          text: '#8899aa',
          textPrimary: '#ffffff',
          accent: '#00d4ff',
          recording: '#ff4466',
          success: '#00ff88',
        }
      : {
          bg: '#e2e8f0',
          overlay: 'rgba(255, 255, 255, 0.9)',
          text: '#64748b',
          textPrimary: '#1e293b',
          accent: '#0066cc',
          recording: '#dc2626',
          success: '#16a34a',
        };

  const statusColors: Record<StreamStatus, string> = {
    connecting: '#ffaa00',
    connected: colors.success,
    disconnected: colors.text,
    error: colors.recording,
  };

  const statusLabels: Record<StreamStatus, string> = {
    connecting: 'Connecting...',
    connected: 'Live',
    disconnected: 'No Signal',
    error: 'Error',
  };

  return (
    <div
      className="relative rounded-lg overflow-hidden group"
      style={{ backgroundColor: colors.bg, aspectRatio: '16/9' }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video placeholder with noise pattern */}
      <div className="absolute inset-0">
        {streamStatus === 'connected' ? (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(45deg, ${colors.bg} 25%, transparent 25%),
                         linear-gradient(-45deg, ${colors.bg} 25%, transparent 25%),
                         linear-gradient(45deg, transparent 75%, ${colors.bg} 75%),
                         linear-gradient(-45deg, transparent 75%, ${colors.bg} 75%)`,
              backgroundSize: '4px 4px',
              backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
              opacity: 0.3,
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2 opacity-30">📹</div>
              <div className="text-sm" style={{ color: colors.text }}>
                {statusLabels[streamStatus]}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulated video frame with OSD */}
      {streamStatus === 'connected' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Crosshair */}
          <div className="relative w-16 h-16">
            <div
              className="absolute top-1/2 left-0 right-0 h-px"
              style={{ backgroundColor: colors.accent, opacity: 0.5 }}
            />
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px"
              style={{ backgroundColor: colors.accent, opacity: 0.5 }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 border-2 rounded-full"
              style={{ borderColor: colors.accent, opacity: 0.5 }}
            />
          </div>

          {/* Horizon line indicator */}
          <div
            className="absolute left-4 right-4 h-px opacity-30"
            style={{ backgroundColor: colors.accent, top: '50%' }}
          />
        </div>
      )}

      {/* Top bar - Status */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          {/* Camera selector */}
          <select
            value={cameraId}
            onChange={(e) => onCameraChange?.(e.target.value)}
            className="px-2 py-1 rounded text-xs cursor-pointer"
            style={{
              backgroundColor: colors.overlay,
              color: colors.textPrimary,
              border: 'none',
              outline: 'none',
            }}
          >
            {cameras.map((cam) => (
              <option key={cam.id} value={cam.id}>
                {cam.name}
              </option>
            ))}
          </select>

          {/* Stream status */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
            style={{ backgroundColor: colors.overlay }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: statusColors[streamStatus] }}
            />
            <span style={{ color: colors.textPrimary }}>{statusLabels[streamStatus]}</span>
          </div>

          {/* Recording indicator with duration and size */}
          {isRecording && (
            <div
              className="flex items-center gap-2 px-2 py-1 rounded text-xs"
              style={{ backgroundColor: colors.recording }}
            >
              <span className="animate-pulse">●</span>
              <span style={{ color: '#ffffff' }}>REC</span>
              <span className="font-mono" style={{ color: '#ffffff' }}>
                {formatDuration(recordingDuration)}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{formatSize(recordingSize)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quality indicator */}
          <div
            className="px-2 py-1 rounded text-xs cursor-pointer"
            style={{ backgroundColor: colors.overlay, color: colors.textPrimary }}
            onClick={() => setShowSettings(!showSettings)}
          >
            {selectedQuality}
          </div>

          {/* Latency */}
          <div
            className="px-2 py-1 rounded text-xs"
            style={{ backgroundColor: colors.overlay, color: colors.textPrimary }}
          >
            48ms
          </div>
        </div>
      </div>

      {/* Quality settings dropdown */}
      {showSettings && (
        <div
          className="absolute top-10 right-2 p-2 rounded-lg z-10"
          style={{ backgroundColor: colors.overlay }}
        >
          <div className="text-xs mb-2" style={{ color: colors.text }}>
            Video Quality
          </div>
          {(['4K', '1080p', '720p', '480p'] as VideoQuality[]).map((q) => (
            <button
              key={q}
              onClick={() => {
                setSelectedQuality(q);
                setShowSettings(false);
              }}
              className="block w-full text-left px-3 py-1.5 rounded text-xs hover:bg-white/10"
              style={{
                color: selectedQuality === q ? colors.accent : colors.textPrimary,
              }}
            >
              {q} {q === '4K' && '(60fps)'} {q === '1080p' && '(30fps)'}
              {q === '720p' && '(30fps)'} {q === '480p' && '(30fps)'}
            </button>
          ))}
        </div>
      )}

      {/* Bottom bar - Info */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-2">
        <div
          className="px-2 py-1 rounded text-xs"
          style={{ backgroundColor: colors.overlay, color: colors.textPrimary }}
        >
          CAM 1
        </div>
        <div
          className="px-2 py-1 rounded text-xs font-mono"
          style={{ backgroundColor: colors.overlay, color: colors.textPrimary }}
        >
          {resolution}
        </div>
      </div>

      {/* Controls overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-200"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* Snapshot */}
        <button
          onClick={onSnapshot}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: colors.overlay }}
          title="Take Snapshot (S)"
        >
          📷
        </button>

        {/* Record toggle */}
        <button
          onClick={onToggleRecord}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{
            backgroundColor: isRecording ? colors.recording : colors.overlay,
            border: `2px solid ${isRecording ? colors.recording : colors.accent}`,
          }}
          title={isRecording ? 'Stop Recording (R)' : 'Start Recording (R)'}
        >
          <span className="text-xl">{isRecording ? '⏹' : '⏺'}</span>
        </button>

        {/* Picture-in-Picture */}
        <button
          onClick={onPictureInPicture}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: colors.overlay }}
          title="Picture in Picture (P)"
        >
          📺
        </button>

        {/* Gimbal control toggle */}
        <button
          onClick={() => setShowGimbalControl(!showGimbalControl)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{
            backgroundColor: showGimbalControl ? colors.accent + '40' : colors.overlay,
          }}
          title="Gimbal Control (G)"
        >
          🎯
        </button>

        {/* Fullscreen */}
        <button
          onClick={onFullscreen}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: colors.overlay }}
          title="Fullscreen (F)"
        >
          ⛶
        </button>
      </div>

      {/* Gimbal control pad */}
      {showGimbalControl && showControls && (
        <div
          className="absolute bottom-16 right-4 p-3 rounded-lg"
          style={{ backgroundColor: colors.overlay }}
        >
          <div className="text-xs text-center mb-2" style={{ color: colors.text }}>
            Gimbal Control
          </div>
          <div className="grid grid-cols-3 gap-1" style={{ width: '100px' }}>
            <div />
            <button
              onClick={() => handleGimbalControl('up')}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/10"
              style={{ color: colors.textPrimary }}
            >
              ▲
            </button>
            <div />
            <button
              onClick={() => handleGimbalControl('left')}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/10"
              style={{ color: colors.textPrimary }}
            >
              ◀
            </button>
            <button
              onClick={() => handleGimbalControl('center')}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/10 text-xs"
              style={{ color: colors.accent }}
            >
              ●
            </button>
            <button
              onClick={() => handleGimbalControl('right')}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/10"
              style={{ color: colors.textPrimary }}
            >
              ▶
            </button>
            <div />
            <button
              onClick={() => handleGimbalControl('down')}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/10"
              style={{ color: colors.textPrimary }}
            >
              ▼
            </button>
            <div />
          </div>
          <div className="text-xs text-center mt-2 font-mono" style={{ color: colors.text }}>
            P:{gimbalPitch}° Y:{gimbalYaw}°
          </div>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded text-xs transition-opacity duration-200"
        style={{
          backgroundColor: colors.overlay,
          color: colors.text,
          opacity: showControls ? 1 : 0,
        }}
      >
        <span className="mr-3">R: Record</span>
        <span className="mr-3">S: Snapshot</span>
        <span className="mr-3">F: Fullscreen</span>
        <span>Arrows: Gimbal</span>
      </div>
    </div>
  );
}
