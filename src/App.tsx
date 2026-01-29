import { useEffect, useState, useCallback } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { useViewStore } from '@/stores/useViewStore';
import { useCommandStore } from '@/stores/useCommandStore';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useKeyboardShortcuts, type FlightCommand } from '@/hooks/useKeyboardShortcuts';
import { useFullscreen } from '@/hooks/useFullscreen';
import { FlightView, PlanView, ConfigureView, AnalyzeView, SettingsView } from '@/views';
import { CommandDialog, VehicleSelector, KeyboardShortcutsHelp, ConnectionManager, NotificationToast, CommandPalette, type SelectorVehicle } from '@/components/common';
import type { ViewType, Link, LinkType } from '@/types';

const navItems: { id: ViewType; label: string; icon: string; shortcut: string }[] = [
  { id: 'flight', label: 'Flight', icon: '✈️', shortcut: 'F1' },
  { id: 'plan', label: 'Plan', icon: '🗺️', shortcut: 'F2' },
  { id: 'configure', label: 'Configure', icon: '⚙️', shortcut: 'F3' },
  { id: 'analyze', label: 'Analyze', icon: '📊', shortcut: 'F4' },
  { id: 'settings', label: 'Settings', icon: '🔧', shortcut: 'F5' },
];

// Mock vehicles for demonstration
const mockVehicles: SelectorVehicle[] = [
  {
    id: 'uav-001',
    name: 'Survey Drone Alpha',
    type: 'quadcopter',
    connectionStatus: 'connected',
    batteryPercent: 78,
    signalStrength: 92,
    lastSeen: Date.now(),
  },
  {
    id: 'uav-002',
    name: 'Inspection UAV Beta',
    type: 'hexacopter',
    connectionStatus: 'connected',
    batteryPercent: 45,
    signalStrength: 85,
    lastSeen: Date.now(),
  },
  {
    id: 'uav-003',
    name: 'Fixed Wing Gamma',
    type: 'fixed-wing',
    connectionStatus: 'disconnected',
    batteryPercent: 100,
    signalStrength: 0,
    lastSeen: Date.now() - 300000,
  },
];

interface NavigationProps {
  selectedVehicle: SelectorVehicle | null;
  onVehicleSelect: (vehicle: SelectorVehicle) => void;
  onShowHelp: () => void;
  onShowConnections: () => void;
  connectionCount: number;
  isArmed: boolean;
  onThemeToggle: () => void;
}

function Navigation({ selectedVehicle, onVehicleSelect, onShowHelp, onShowConnections, connectionCount, isArmed, onThemeToggle }: NavigationProps) {
  const { theme } = useThemeStore();
  const { currentView, setView } = useViewStore();

  const colors =
    theme === 'dark'
      ? {
          bg: '#0a0f14',
          border: '#1a2332',
          text: '#667788',
          textActive: '#ffffff',
          accent: '#00d4ff',
          armed: '#ff4466',
          disarmed: '#00ff88',
        }
      : {
          bg: '#ffffff',
          border: '#e2e8f0',
          text: '#94a3b8',
          textActive: '#1e293b',
          accent: '#0066cc',
          armed: '#dc2626',
          disarmed: '#16a34a',
        };

  return (
    <nav
      className="flex items-center justify-between px-4 py-1 border-b"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      {/* Vehicle Selector */}
      <div className="w-64">
        <VehicleSelector
          theme={theme}
          vehicles={mockVehicles}
          selectedVehicle={selectedVehicle}
          onSelect={onVehicleSelect}
        />
      </div>

      {/* Navigation Items */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer"
            style={{
              backgroundColor: currentView === item.id ? colors.accent + '20' : 'transparent',
              borderBottom: currentView === item.id ? `2px solid ${colors.accent}` : '2px solid transparent',
              color: currentView === item.id ? colors.textActive : colors.text,
            }}
          >
            <span>{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: theme === 'dark' ? '#1a2332' : '#e2e8f0',
                color: colors.text,
              }}
            >
              {item.shortcut}
            </span>
          </button>
        ))}
      </div>

      {/* Right side buttons */}
      <div className="flex justify-end items-center gap-2">
        {/* Armed Status Indicator */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            backgroundColor: isArmed ? colors.armed + '20' : colors.disarmed + '20',
            border: `1px solid ${isArmed ? colors.armed : colors.disarmed}`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: isArmed ? colors.armed : colors.disarmed }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: isArmed ? colors.armed : colors.disarmed }}
          >
            {isArmed ? 'ARMED' : 'DISARMED'}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{
            backgroundColor: theme === 'dark' ? '#1a2332' : '#e2e8f0',
            color: colors.text,
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>

        {/* Connections Button */}
        <button
          onClick={onShowConnections}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
          style={{
            backgroundColor: theme === 'dark' ? '#1a2332' : '#e2e8f0',
            color: colors.text,
          }}
          title="Manage Connections"
        >
          <span>📡</span>
          <span className="text-sm">Links</span>
          {connectionCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: colors.accent, color: '#000000' }}
            >
              {connectionCount}
            </span>
          )}
        </button>

        {/* Help Button */}
        <button
          onClick={onShowHelp}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
          style={{
            backgroundColor: theme === 'dark' ? '#1a2332' : '#e2e8f0',
            color: colors.text,
          }}
          title="Keyboard Shortcuts (?)"
        >
          <span>⌨️</span>
          <span className="text-sm">Shortcuts</span>
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  const { theme, toggleTheme } = useThemeStore();
  const { currentView, setView } = useViewStore();
  const { pendingCommand, setPendingCommand, confirmCommand, cancelCommand, isArmed } = useCommandStore();
  const telemetry = useTelemetry();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // State
  const [selectedVehicle, setSelectedVehicle] = useState<SelectorVehicle | null>(mockVehicles[0]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showConnectionManager, setShowConnectionManager] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [hideNavInFullscreen] = useState(true);
  const [connections, setConnections] = useState<Link[]>([
    // Mock connection for demonstration
    {
      id: 'link-1',
      name: 'USB Serial',
      linkType: { type: 'Serial', port: '/dev/ttyUSB0', baud: 57600 },
      connected: true,
      stats: {
        bytesSent: 245760,
        bytesReceived: 1048576,
        packetLossPercent: 0.5,
        latencyMs: 12,
      },
    },
  ]);

  // Handle connection management
  const handleConnect = useCallback((linkType: LinkType) => {
    let linkName: string;
    if (linkType.type === 'Serial') {
      linkName = `Serial ${linkType.port}`;
    } else if (linkType.type === 'UdpClient') {
      linkName = `UDP Client ${linkType.host}:${linkType.port}`;
    } else if (linkType.type === 'UdpServer') {
      linkName = `UDP Server ${linkType.bind}:${linkType.port}`;
    } else if (linkType.type === 'TcpClient') {
      linkName = `TCP ${linkType.host}:${linkType.port}`;
    } else {
      linkName = `Bluetooth ${linkType.address}`;
    }

    const newLink: Link = {
      id: `link-${Date.now()}`,
      name: linkName,
      linkType,
      connected: true,
      stats: {
        bytesSent: 0,
        bytesReceived: 0,
        packetLossPercent: 0,
        latencyMs: 0,
      },
    };
    setConnections((prev) => [...prev, newLink]);
    setShowConnectionManager(false);
  }, []);

  const handleDisconnect = useCallback((linkId: string) => {
    setConnections((prev) => prev.filter((link) => link.id !== linkId));
  }, []);

  // Handle flight commands from keyboard shortcuts
  const handleFlightCommand = useCallback((command: FlightCommand) => {
    // Show confirmation dialog for the command
    setPendingCommand(command);
  }, [setPendingCommand]);

  // Handle vehicle selection from keyboard (1-9 keys)
  const handleVehicleSelect = useCallback((index: number) => {
    if (index >= 0 && index < mockVehicles.length) {
      setSelectedVehicle(mockVehicles[index]);
    }
  }, []);

  // Handle zoom
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    // This would integrate with the map view
    console.log('Zoom:', direction);
  }, []);

  // Handle fullscreen toggle
  const handleFullscreen = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    onFlightCommand: handleFlightCommand,
    onVehicleSelect: handleVehicleSelect,
    onZoom: handleZoom,
    onFullscreen: handleFullscreen,
    enabled: currentView === 'flight' && !pendingCommand && !showHelpModal,
  });

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // View switching and help modal keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette toggle (Cmd+K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      // Help modal toggle
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowHelpModal((prev) => !prev);
        return;
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        if (showCommandPalette) {
          e.preventDefault();
          setShowCommandPalette(false);
          return;
        }
        if (showHelpModal) {
          e.preventDefault();
          setShowHelpModal(false);
          return;
        }
      }

      // Don't process view shortcuts if modal is open
      if (showHelpModal || pendingCommand || showCommandPalette) return;

      // Function keys for view switching
      if (e.key === 'F1') {
        e.preventDefault();
        setView('flight');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setView('plan');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setView('configure');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setView('analyze');
      } else if (e.key === 'F5') {
        e.preventDefault();
        setView('settings');
      } else if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      // Tab to cycle views
      else if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const currentIndex = navItems.findIndex((item) => item.id === currentView);
        const nextIndex = (currentIndex + 1) % navItems.length;
        setView(navItems[nextIndex].id);
      }
      // Shift+Tab to cycle views backwards
      else if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        const currentIndex = navItems.findIndex((item) => item.id === currentView);
        const prevIndex = (currentIndex - 1 + navItems.length) % navItems.length;
        setView(navItems[prevIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, setView, showHelpModal, showCommandPalette, pendingCommand, toggleFullscreen]);

  const colors =
    theme === 'dark'
      ? { bg: '#030508' }
      : { bg: '#f0f4f8' };

  const renderView = () => {
    switch (currentView) {
      case 'flight':
        return <FlightView telemetry={telemetry} theme={theme} onThemeToggle={toggleTheme} />;
      case 'plan':
        return <PlanView theme={theme} />;
      case 'configure':
        return <ConfigureView theme={theme} />;
      case 'analyze':
        return <AnalyzeView theme={theme} />;
      case 'settings':
        return <SettingsView theme={theme} onThemeChange={toggleTheme} />;
      default:
        return <FlightView telemetry={telemetry} theme={theme} onThemeToggle={toggleTheme} />;
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: colors.bg }}>
      {/* Navigation - hidden in fullscreen if enabled */}
      {!(isFullscreen && hideNavInFullscreen) && (
        <Navigation
          selectedVehicle={selectedVehicle}
          onVehicleSelect={setSelectedVehicle}
          onShowHelp={() => setShowHelpModal(true)}
          onShowConnections={() => setShowConnectionManager(true)}
          connectionCount={connections.filter((c) => c.connected).length}
          isArmed={isArmed}
          onThemeToggle={toggleTheme}
        />
      )}
      <div className="flex-1 overflow-hidden">{renderView()}</div>

      {/* Fullscreen exit hint */}
      {isFullscreen && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm z-50 transition-opacity duration-300"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            color: theme === 'dark' ? '#ffffff' : '#1e293b',
            border: `1px solid ${theme === 'dark' ? '#1a2332' : '#e2e8f0'}`,
          }}
        >
          Press <span className="font-mono px-1 py-0.5 rounded" style={{ backgroundColor: theme === 'dark' ? '#1a2332' : '#e2e8f0' }}>F11</span> or <span className="font-mono px-1 py-0.5 rounded" style={{ backgroundColor: theme === 'dark' ? '#1a2332' : '#e2e8f0' }}>Esc</span> to exit fullscreen
        </div>
      )}

      {/* Command Confirmation Dialog */}
      <CommandDialog
        theme={theme}
        command={pendingCommand?.command ?? null}
        isArmed={isArmed}
        onConfirm={confirmCommand}
        onCancel={cancelCommand}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        theme={theme}
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Connection Manager Modal */}
      <ConnectionManager
        theme={theme}
        isOpen={showConnectionManager}
        onClose={() => setShowConnectionManager(false)}
        connections={connections}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Notification Toasts */}
      <NotificationToast theme={theme} />

      {/* Command Palette */}
      <CommandPalette
        theme={theme}
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={setView}
        onFlightCommand={(cmd) => setPendingCommand({ type: cmd as FlightCommand['type'] })}
      />
    </div>
  );
}
