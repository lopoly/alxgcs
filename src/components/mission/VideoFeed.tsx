import { useState } from 'react';
import type { Theme } from '@/types';

interface VideoFeedProps {
  theme: Theme;
  isRecording?: boolean;
  resolution?: string;
  streamUrl?: string;
  onSnapshot?: () => void;
  onToggleRecord?: () => void;
  onFullscreen?: () => void;
}

type StreamStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function VideoFeed({
  theme,
  isRecording = false,
  resolution = '1080p 30fps',
  onSnapshot,
  onToggleRecord,
  onFullscreen,
}: VideoFeedProps) {
  const [streamStatus] = useState<StreamStatus>('connected');
  const [showControls, setShowControls] = useState(false);

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

          {/* Recording indicator */}
          {isRecording && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs animate-pulse"
              style={{ backgroundColor: colors.recording }}
            >
              <span>●</span>
              <span style={{ color: '#ffffff' }}>REC</span>
            </div>
          )}
        </div>

        {/* Latency */}
        <div
          className="px-2 py-1 rounded text-xs"
          style={{ backgroundColor: colors.overlay, color: colors.textPrimary }}
        >
          48ms
        </div>
      </div>

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
        className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200"
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
          title="Take Snapshot"
        >
          📷
        </button>

        {/* Record toggle */}
        <button
          onClick={onToggleRecord}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{
            backgroundColor: isRecording ? colors.recording : colors.overlay,
          }}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? '⏹' : '⏺'}
        </button>

        {/* Fullscreen */}
        <button
          onClick={onFullscreen}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: colors.overlay }}
          title="Fullscreen"
        >
          ⛶
        </button>
      </div>

      {/* Gimbal controls hint */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs transition-opacity duration-200"
        style={{
          backgroundColor: colors.overlay,
          color: colors.text,
          opacity: showControls ? 1 : 0,
        }}
      >
        Use arrow keys to control gimbal
      </div>
    </div>
  );
}
