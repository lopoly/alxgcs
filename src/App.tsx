import { useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { useViewStore } from '@/stores/useViewStore';
import { useTelemetry } from '@/hooks/useTelemetry';
import { FlightView, PlanView, ConfigureView, AnalyzeView } from '@/views';
import type { ViewType } from '@/types';

const navItems: { id: ViewType; label: string; icon: string; shortcut: string }[] = [
  { id: 'flight', label: 'Flight', icon: '✈️', shortcut: 'F1' },
  { id: 'plan', label: 'Plan', icon: '🗺️', shortcut: 'F2' },
  { id: 'configure', label: 'Configure', icon: '⚙️', shortcut: 'F3' },
  { id: 'analyze', label: 'Analyze', icon: '📊', shortcut: 'F4' },
];

function Navigation() {
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
        }
      : {
          bg: '#ffffff',
          border: '#e2e8f0',
          text: '#94a3b8',
          textActive: '#1e293b',
          accent: '#0066cc',
        };

  return (
    <nav
      className="flex items-center justify-center gap-1 px-4 py-1 border-b"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
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
    </nav>
  );
}

export default function App() {
  const { theme, toggleTheme } = useThemeStore();
  const { currentView, setView } = useViewStore();
  const telemetry = useTelemetry();

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [currentView, setView]);

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
      default:
        return <FlightView telemetry={telemetry} theme={theme} onThemeToggle={toggleTheme} />;
    }
  };

  // Flight view has its own header, others use shared navigation
  if (currentView === 'flight') {
    return (
      <div className="h-screen flex flex-col" style={{ backgroundColor: colors.bg }}>
        <Navigation />
        <div className="flex-1 overflow-hidden">{renderView()}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: colors.bg }}>
      <Navigation />
      <div className="flex-1 overflow-hidden">{renderView()}</div>
    </div>
  );
}
