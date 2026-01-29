import { useMemo } from 'react';
import type { Theme } from '@/types';

interface MapHUDProps {
  altitude: number;
  speed: number;
  heading: number;
  verticalSpeed?: number;
  distanceToWaypoint?: number;
  waypointName?: string;
  position?: 'top' | 'bottom';
  theme?: Theme;
  visible?: boolean;
}

export function MapHUD({
  altitude,
  speed,
  heading,
  verticalSpeed,
  distanceToWaypoint,
  waypointName,
  position = 'top',
  theme = 'dark',
  visible = true,
}: MapHUDProps) {
  const colors = useMemo(() => theme === 'dark'
    ? {
        bg: 'rgba(10, 15, 20, 0.85)',
        border: '#1a2332',
        label: '#667788',
        value: '#ffffff',
        unit: '#8899aa',
        altitude: '#00d4ff',
        speed: '#00ff88',
        heading: '#ffaa00',
        vs: '#ff88ff',
      }
    : {
        bg: 'rgba(255, 255, 255, 0.9)',
        border: '#e2e8f0',
        label: '#94a3b8',
        value: '#1e293b',
        unit: '#64748b',
        altitude: '#0066cc',
        speed: '#16a34a',
        heading: '#d97706',
        vs: '#9333ea',
      }, [theme]);

  if (!visible) return null;

  const formatHeading = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  return (
    <div
      style={{
        position: 'absolute',
        [position]: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '8px 4px',
        backgroundColor: colors.bg,
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Altitude */}
      <div style={{ padding: '0 16px', textAlign: 'center', borderRight: `1px solid ${colors.border}` }}>
        <div style={{ fontSize: '9px', color: colors.label, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ALT
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: colors.altitude, fontFamily: "'JetBrains Mono', monospace" }}>
            {altitude.toFixed(0)}
          </span>
          <span style={{ fontSize: '11px', color: colors.unit }}>m</span>
        </div>
      </div>

      {/* Speed */}
      <div style={{ padding: '0 16px', textAlign: 'center', borderRight: `1px solid ${colors.border}` }}>
        <div style={{ fontSize: '9px', color: colors.label, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          GS
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: colors.speed, fontFamily: "'JetBrains Mono', monospace" }}>
            {speed.toFixed(0)}
          </span>
          <span style={{ fontSize: '11px', color: colors.unit }}>km/h</span>
        </div>
      </div>

      {/* Heading */}
      <div style={{ padding: '0 16px', textAlign: 'center', borderRight: verticalSpeed !== undefined ? `1px solid ${colors.border}` : 'none' }}>
        <div style={{ fontSize: '9px', color: colors.label, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          HDG
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: colors.heading, fontFamily: "'JetBrains Mono', monospace" }}>
            {heading.toFixed(0)}°
          </span>
          <span style={{ fontSize: '11px', color: colors.unit }}>{formatHeading(heading)}</span>
        </div>
      </div>

      {/* Vertical Speed (optional) */}
      {verticalSpeed !== undefined && (
        <div style={{ padding: '0 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: colors.label, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            VS
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: colors.vs, fontFamily: "'JetBrains Mono', monospace" }}>
              {verticalSpeed >= 0 ? '+' : ''}{verticalSpeed.toFixed(1)}
            </span>
            <span style={{ fontSize: '11px', color: colors.unit }}>m/s</span>
          </div>
        </div>
      )}

      {/* Waypoint info (if provided) */}
      {distanceToWaypoint !== undefined && (
        <div
          style={{
            marginLeft: '8px',
            padding: '4px 12px',
            backgroundColor: theme === 'dark' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(0, 102, 204, 0.1)',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '9px', color: colors.label, textTransform: 'uppercase' }}>
            {waypointName || 'Next WP'}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.altitude }}>
            {distanceToWaypoint >= 1000
              ? `${(distanceToWaypoint / 1000).toFixed(1)} km`
              : `${distanceToWaypoint.toFixed(0)} m`
            }
          </div>
        </div>
      )}
    </div>
  );
}
