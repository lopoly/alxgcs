import { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';

/**
 * US-111: Screen Reader Support
 * Provides ARIA labels, live regions, and screen reader utilities
 */

// Types
interface LiveRegionMessage {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
}

interface ScreenReaderContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  announceFlightUpdate: (update: FlightUpdate) => void;
  announceTelemetry: (telemetry: TelemetryAnnouncement) => void;
}

interface FlightUpdate {
  type: 'mode_change' | 'waypoint' | 'altitude' | 'battery' | 'warning' | 'error';
  message: string;
}

interface TelemetryAnnouncement {
  altitude?: number;
  speed?: number;
  battery?: number;
  heading?: number;
  mode?: string;
}

// Context
const ScreenReaderContext = createContext<ScreenReaderContextType | null>(null);

/**
 * Screen Reader Provider - Manages live regions and announcements
 */
export function ScreenReaderProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<LiveRegionMessage[]>([]);
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  // Clean up old messages
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setMessages((prev) => prev.filter((m) => now - m.timestamp < 5000));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = `sr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMessages((prev) => [...prev, { id, message, priority, timestamp: Date.now() }]);
  }, []);

  const announceFlightUpdate = useCallback((update: FlightUpdate) => {
    const priority = update.type === 'error' || update.type === 'warning' ? 'assertive' : 'polite';
    announce(update.message, priority);
  }, [announce]);

  const announceTelemetry = useCallback((telemetry: TelemetryAnnouncement) => {
    const parts: string[] = [];
    if (telemetry.altitude !== undefined) {
      parts.push(`Altitude ${telemetry.altitude} meters`);
    }
    if (telemetry.speed !== undefined) {
      parts.push(`Speed ${telemetry.speed.toFixed(1)} meters per second`);
    }
    if (telemetry.battery !== undefined) {
      parts.push(`Battery ${telemetry.battery} percent`);
    }
    if (telemetry.heading !== undefined) {
      parts.push(`Heading ${telemetry.heading} degrees`);
    }
    if (telemetry.mode) {
      parts.push(`Flight mode ${telemetry.mode}`);
    }
    if (parts.length > 0) {
      announce(parts.join('. '));
    }
  }, [announce]);

  const politeMessages = messages.filter((m) => m.priority === 'polite');
  const assertiveMessages = messages.filter((m) => m.priority === 'assertive');

  return (
    <ScreenReaderContext.Provider value={{ announce, announceFlightUpdate, announceTelemetry }}>
      {children}

      {/* Live regions - visually hidden but read by screen readers */}
      <div
        ref={politeRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessages.map((m) => (
          <span key={m.id}>{m.message}</span>
        ))}
      </div>

      <div
        ref={assertiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessages.map((m) => (
          <span key={m.id}>{m.message}</span>
        ))}
      </div>
    </ScreenReaderContext.Provider>
  );
}

/**
 * Hook to access screen reader announcements
 */
export function useScreenReader() {
  const context = useContext(ScreenReaderContext);
  if (!context) {
    throw new Error('useScreenReader must be used within a ScreenReaderProvider');
  }
  return context;
}

/**
 * Visually Hidden component - hidden visually but accessible to screen readers
 */
export function VisuallyHidden({ children, as: Component = 'span' }: { children: ReactNode; as?: keyof JSX.IntrinsicElements }) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

/**
 * Skip Link component - allows users to skip to main content
 */
export function SkipLink({ targetId, children = 'Skip to main content' }: { targetId: string; children?: ReactNode }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none"
    >
      {children}
    </a>
  );
}

/**
 * ARIA Description component - provides additional context
 */
export function AriaDescription({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span id={id} className="sr-only">
      {children}
    </span>
  );
}

/**
 * Telemetry Value with ARIA support
 */
interface AccessibleTelemetryValueProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical';
  precision?: number;
  children?: ReactNode;
}

export function AccessibleTelemetryValue({
  label,
  value,
  unit,
  trend,
  status,
  precision = 1,
  children,
}: AccessibleTelemetryValueProps) {
  const formattedValue = typeof value === 'number' ? value.toFixed(precision) : value;
  const trendLabel = trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable';
  const statusLabel = status === 'warning' ? ', warning' : status === 'critical' ? ', critical' : '';

  const ariaLabel = `${label}: ${formattedValue}${unit ? ` ${unit}` : ''}${trend ? `, ${trendLabel}` : ''}${statusLabel}`;

  return (
    <div role="group" aria-label={ariaLabel}>
      {children || (
        <>
          <span className="sr-only">{label}:</span>
          <span aria-hidden="true">{formattedValue}</span>
          {unit && <span aria-hidden="true" className="text-xs ml-1">{unit}</span>}
        </>
      )}
    </div>
  );
}

/**
 * Accessible Progress indicator
 */
interface AccessibleProgressProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  showValue = true,
  className,
  style,
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label} className={className} style={style}>
      <span className="sr-only">{`${label}: ${percentage}%`}</span>
      {showValue && <span aria-hidden="true">{percentage}%</span>}
    </div>
  );
}

/**
 * Accessible Alert component
 */
interface AccessibleAlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function AccessibleAlert({ type, children, dismissible, onDismiss }: AccessibleAlertProps) {
  const role = type === 'error' || type === 'warning' ? 'alert' : 'status';

  return (
    <div role={role} aria-live={type === 'error' ? 'assertive' : 'polite'}>
      {children}
      {dismissible && onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss alert">
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}

/**
 * Accessible Icon Button
 */
interface AccessibleIconButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AccessibleIconButton({
  icon,
  label,
  onClick,
  disabled,
  className,
  style,
}: AccessibleIconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={className}
      style={style}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

/**
 * Status indicator with ARIA support
 */
interface AccessibleStatusProps {
  status: 'connected' | 'disconnected' | 'warning' | 'error' | 'ok';
  label: string;
  showIcon?: boolean;
}

export function AccessibleStatus({ status, label, showIcon = true }: AccessibleStatusProps) {
  const statusText = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    warning: 'Warning',
    error: 'Error',
    ok: 'OK',
  }[status];

  const statusColors = {
    connected: '#00ff88',
    ok: '#00ff88',
    disconnected: '#ff4466',
    error: '#ff4466',
    warning: '#ffaa00',
  };

  return (
    <span role="status" aria-label={`${label}: ${statusText}`}>
      {showIcon && (
        <span
          aria-hidden="true"
          className="inline-block w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: statusColors[status] }}
        />
      )}
      <span className="sr-only">{`${label}: ${statusText}`}</span>
    </span>
  );
}

/**
 * Landmark regions for main content areas
 */
export function MainContent({ children, id = 'main-content' }: { children: ReactNode; id?: string }) {
  return (
    <main id={id} role="main" tabIndex={-1}>
      {children}
    </main>
  );
}

export function NavigationRegion({ children, label = 'Main navigation' }: { children: ReactNode; label?: string }) {
  return (
    <nav role="navigation" aria-label={label}>
      {children}
    </nav>
  );
}

export function ComplementaryRegion({ children, label }: { children: ReactNode; label: string }) {
  return (
    <aside role="complementary" aria-label={label}>
      {children}
    </aside>
  );
}

/**
 * CSS for screen reader utilities (add to global styles)
 */
export const screenReaderStyles = `
/* Screen reader only - visually hidden but accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Allow focus to make skip links visible */
.sr-only:focus,
.sr-only:active,
.focus\\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-border: #ffffff;
    --color-text: #ffffff;
  }
}

/* Focus visible styling */
:focus-visible {
  outline: 2px solid #00d4ff;
  outline-offset: 2px;
}
`;
