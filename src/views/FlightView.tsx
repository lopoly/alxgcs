import type { Theme, TelemetryData } from '@/types';
import { Header, LeftPanel, RightPanel } from '@/components/layout';
import { MapView, MiniHUD } from '@/components/mission';
import { QuickActions } from '@/components/common';

interface FlightViewProps {
  telemetry: TelemetryData;
  theme: Theme;
  onThemeToggle: () => void;
}

export function FlightView({ telemetry, theme, onThemeToggle }: FlightViewProps) {
  const colors =
    theme === 'dark'
      ? { bg: '#030508' }
      : { bg: '#f0f4f8' };

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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Instruments */}
        <LeftPanel telemetry={telemetry} theme={theme} />

        {/* Center - Map */}
        <div className="flex-1 relative">
          <MapView
            theme={theme}
            waypoints={telemetry.totalWaypoints}
            currentWp={telemetry.nextWaypoint}
          />
          <MiniHUD telemetry={telemetry} theme={theme} />

          {/* Quick Actions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <QuickActions theme={theme} />
          </div>
        </div>

        {/* Right Panel - Video & Stats */}
        <RightPanel telemetry={telemetry} theme={theme} />
      </div>
    </div>
  );
}
