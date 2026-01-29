import type { Theme, TelemetryData, ConnectionStatus } from '@/types';
import { Header, LeftPanel, RightPanel } from '@/components/layout';
import { MapView, MiniHUD } from '@/components/mission';
import { QuickActions } from '@/components/common';

interface FlightViewProps {
  telemetry: TelemetryData;
  theme: Theme;
  onThemeToggle: () => void;
  connectionStatus: ConnectionStatus;
  isDemo: boolean;
  onEnableDemo: () => void;
  onDisableDemo: () => void;
}

function DisconnectedOverlay({ theme, onEnableDemo }: { theme: Theme; onEnableDemo: () => void }) {
  const colors =
    theme === 'dark'
      ? {
          bg: 'rgba(3, 5, 8, 0.95)',
          card: '#0a0f14',
          border: '#1a2332',
          text: '#8899aa',
          textPrimary: '#ffffff',
          accent: '#00d4ff',
        }
      : {
          bg: 'rgba(240, 244, 248, 0.95)',
          card: '#ffffff',
          border: '#e2e8f0',
          text: '#64748b',
          textPrimary: '#1e293b',
          accent: '#0066cc',
        };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: colors.bg }}
    >
      <div
        className="text-center p-8 rounded-2xl max-w-md"
        style={{
          backgroundColor: colors.card,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Disconnected Icon */}
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.border }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.text}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        </div>

        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: colors.textPrimary }}
        >
          No Vehicle Connected
        </h2>
        <p className="mb-6" style={{ color: colors.text }}>
          Connect a vehicle via USB, UDP, or TCP to see live telemetry data.
          You can also enable demo mode to explore the interface.
        </p>

        <div className="flex flex-col gap-3">
          <button
            className="w-full px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer hover:opacity-90"
            style={{
              backgroundColor: colors.accent,
              color: '#000000',
            }}
            onClick={onEnableDemo}
          >
            Enable Demo Mode
          </button>
          <button
            className="w-full px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: colors.border,
              color: colors.textPrimary,
            }}
          >
            Configure Connection
          </button>
        </div>

        <p className="mt-4 text-xs" style={{ color: colors.text }}>
          Use the Links button in the navigation bar to manage connections
        </p>
      </div>
    </div>
  );
}

function DemoBanner({ theme, onDisable }: { theme: Theme; onDisable: () => void }) {
  const colors =
    theme === 'dark'
      ? { bg: '#ffaa00', text: '#000000' }
      : { bg: '#d97706', text: '#ffffff' };

  return (
    <div
      className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg"
      style={{ backgroundColor: colors.bg }}
    >
      <span className="font-medium text-sm" style={{ color: colors.text }}>
        Demo Mode - Simulated Data
      </span>
      <button
        onClick={onDisable}
        className="px-2 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80 cursor-pointer"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          color: colors.text,
        }}
      >
        Exit Demo
      </button>
    </div>
  );
}

export function FlightView({
  telemetry,
  theme,
  onThemeToggle,
  connectionStatus,
  isDemo,
  onEnableDemo,
  onDisableDemo,
}: FlightViewProps) {
  const colors =
    theme === 'dark'
      ? { bg: '#030508' }
      : { bg: '#f0f4f8' };

  const isConnected = connectionStatus === 'connected';

  return (
    <div
      className="w-full h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: colors.bg,
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <Header telemetry={telemetry} theme={theme} onThemeToggle={onThemeToggle} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - Instruments */}
        <LeftPanel telemetry={telemetry} theme={theme} />

        {/* Center - Map */}
        <div className="flex-1 relative">
          <MapView
            theme={theme}
            waypoints={isConnected ? telemetry.totalWaypoints : 0}
            currentWp={isConnected ? telemetry.nextWaypoint : 0}
            latitude={isConnected && telemetry.latitude !== 0 ? telemetry.latitude : 50.4501}
            longitude={isConnected && telemetry.longitude !== 0 ? telemetry.longitude : 30.5234}
            heading={isConnected ? telemetry.heading : 0}
          />

          {isConnected && <MiniHUD telemetry={telemetry} theme={theme} />}

          {/* Quick Actions - only show when connected */}
          {isConnected && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <QuickActions theme={theme} />
            </div>
          )}

          {/* Demo mode banner */}
          {isDemo && <DemoBanner theme={theme} onDisable={onDisableDemo} />}
        </div>

        {/* Right Panel - Video & Stats */}
        <RightPanel telemetry={telemetry} theme={theme} />

        {/* Disconnected Overlay */}
        {!isConnected && <DisconnectedOverlay theme={theme} onEnableDemo={onEnableDemo} />}
      </div>
    </div>
  );
}
