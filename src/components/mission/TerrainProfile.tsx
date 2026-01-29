import { useMemo } from 'react';
import type { Theme } from '@/types';

interface TerrainProfileProps {
  waypoints: Array<{
    lat: number;
    lng: number;
    altitude: number;
  }>;
  theme?: Theme;
  height?: number;
}

export function TerrainProfile({
  waypoints,
  theme = 'dark',
  height = 120,
}: TerrainProfileProps) {
  const colors = useMemo(() => theme === 'dark'
    ? {
        bg: '#0a0f14',
        border: '#1a2332',
        terrain: '#2a3444',
        terrainFill: 'rgba(42, 52, 68, 0.5)',
        path: '#00d4ff',
        pathFill: 'rgba(0, 212, 255, 0.15)',
        text: '#667788',
        textPrimary: '#ffffff',
        grid: '#1a2332',
        warning: '#ff4466',
      }
    : {
        bg: '#ffffff',
        border: '#e2e8f0',
        terrain: '#94a3b8',
        terrainFill: 'rgba(148, 163, 184, 0.3)',
        path: '#0066cc',
        pathFill: 'rgba(0, 102, 204, 0.1)',
        text: '#94a3b8',
        textPrimary: '#1e293b',
        grid: '#e2e8f0',
        warning: '#dc2626',
      }, [theme]);

  // Mock terrain data (in real app, this would come from elevation API)
  const terrainData = useMemo(() => {
    if (waypoints.length < 2) return [];

    // Generate mock terrain based on waypoint positions
    const points: number[] = [];
    const segments = 50;

    for (let i = 0; i < segments; i++) {
      const progress = i / (segments - 1);
      // Create rolling hills terrain
      const base = 50 + Math.sin(progress * Math.PI * 3) * 30;
      const noise = Math.sin(progress * Math.PI * 7) * 15 + Math.sin(progress * Math.PI * 11) * 10;
      points.push(Math.max(0, base + noise));
    }
    return points;
  }, [waypoints]);

  // Calculate path altitudes along the route
  const pathData = useMemo(() => {
    if (waypoints.length < 2) return [];

    const points: number[] = [];
    const segments = 50;

    for (let i = 0; i < segments; i++) {
      const progress = i / (segments - 1);
      const wpIndex = Math.min(Math.floor(progress * (waypoints.length - 1)), waypoints.length - 2);
      const wpProgress = (progress * (waypoints.length - 1)) - wpIndex;
      const alt1 = waypoints[wpIndex].altitude;
      const alt2 = waypoints[wpIndex + 1].altitude;
      points.push(alt1 + (alt2 - alt1) * wpProgress);
    }
    return points;
  }, [waypoints]);

  // Calculate chart dimensions
  const maxAlt = Math.max(...pathData, ...terrainData, 100);
  const minAlt = 0;
  const range = maxAlt - minAlt;

  // Check for terrain collision
  const hasCollision = pathData.some((alt, i) => alt <= terrainData[i] + 10);

  // Generate SVG paths
  const terrainPath = terrainData.map((alt, i) => {
    const x = (i / (terrainData.length - 1)) * 100;
    const y = 100 - ((alt - minAlt) / range) * 85 - 5;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const terrainAreaPath = `${terrainPath} L 100 100 L 0 100 Z`;

  const flightPath = pathData.map((alt, i) => {
    const x = (i / (pathData.length - 1)) * 100;
    const y = 100 - ((alt - minAlt) / range) * 85 - 5;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const flightAreaPath = `${flightPath} L 100 100 L 0 100 Z`;

  if (waypoints.length < 2) {
    return (
      <div
        style={{
          height,
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: colors.text, fontSize: '12px' }}>
          Add waypoints to see terrain profile
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Terrain Profile
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: colors.terrain, borderRadius: '2px' }} />
            <span style={{ fontSize: '10px', color: colors.text }}>Terrain</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: colors.path, borderRadius: '2px' }} />
            <span style={{ fontSize: '10px', color: colors.text }}>Flight Path</span>
          </div>
          {hasCollision && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: colors.warning, fontSize: '12px' }}>⚠️</span>
              <span style={{ fontSize: '10px', color: colors.warning }}>Collision Risk</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', height, padding: '8px' }}>
        {/* Y-axis labels */}
        <div
          style={{
            position: 'absolute',
            left: '8px',
            top: '8px',
            bottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '9px',
            color: colors.text,
          }}
        >
          <span>{Math.round(maxAlt)}m</span>
          <span>{Math.round(maxAlt / 2)}m</span>
          <span>0m</span>
        </div>

        {/* Chart area */}
        <div style={{ marginLeft: '35px', height: '100%' }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {[25, 50, 75].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke={colors.grid}
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}

            {/* Terrain fill */}
            <path
              d={terrainAreaPath}
              fill={colors.terrainFill}
            />

            {/* Terrain line */}
            <path
              d={terrainPath}
              fill="none"
              stroke={colors.terrain}
              strokeWidth="1.5"
            />

            {/* Flight path fill */}
            <path
              d={flightAreaPath}
              fill={colors.pathFill}
            />

            {/* Flight path line */}
            <path
              d={flightPath}
              fill="none"
              stroke={colors.path}
              strokeWidth="2"
            />

            {/* Waypoint markers */}
            {waypoints.map((wp, i) => {
              const x = (i / (waypoints.length - 1)) * 100;
              const y = 100 - ((wp.altitude - minAlt) / range) * 85 - 5;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    fill={colors.path}
                    stroke={colors.bg}
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y - 6}
                    fill={colors.textPrimary}
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '35px',
            right: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '9px',
            color: colors.text,
          }}
        >
          <span>Start</span>
          <span>End</span>
        </div>
      </div>
    </div>
  );
}
