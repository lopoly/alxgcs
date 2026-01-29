import type { Theme } from '@/types';

interface MapViewProps {
  theme: Theme;
  waypoints?: number;
  currentWp?: number;
}

interface Point {
  x: number;
  y: number;
}

export function MapView({ theme, waypoints = 12, currentWp = 7 }: MapViewProps) {
  const colors =
    theme === 'dark'
      ? {
          bg: '#0d1117',
          grid: '#1a2332',
          path: '#00d4ff',
          wpActive: '#00ff88',
          wpPassed: '#667788',
          wpFuture: '#00d4ff',
          aircraft: '#ffaa00',
        }
      : {
          bg: '#e8f4f8',
          grid: '#cbd5e1',
          path: '#0066cc',
          wpActive: '#22c55e',
          wpPassed: '#94a3b8',
          wpFuture: '#0066cc',
          aircraft: '#f97316',
        };

  // Generate path points
  const points: Point[] = [];
  for (let i = 0; i < waypoints; i++) {
    points.push({
      x: 10 + (i % 4) * 25 + Math.sin(i) * 8,
      y: 15 + Math.floor(i / 4) * 25 + Math.cos(i) * 5,
    });
  }

  const currentPoint = points[currentWp - 1] || { x: 50, y: 50 };

  return (
    <div
      className="relative w-full h-full rounded-xl overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id={`grid-${theme}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={colors.grid} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${theme})`} />
      </svg>

      {/* Flight Path */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Full planned path (dashed) */}
        <path
          d={`M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`}
          fill="none"
          stroke={colors.path}
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.5"
        />
        {/* Completed path (solid) */}
        <path
          d={`M ${points.slice(0, currentWp).map((p) => `${p.x},${p.y}`).join(' L ')}`}
          fill="none"
          stroke={colors.path}
          strokeWidth="1"
        />

        {/* Waypoints */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === currentWp - 1 ? 3 : 2}
              fill={
                i < currentWp - 1
                  ? colors.wpPassed
                  : i === currentWp - 1
                    ? colors.wpActive
                    : colors.wpFuture
              }
              stroke={i === currentWp - 1 ? colors.wpActive : 'none'}
              strokeWidth="1"
            />
            <text
              x={p.x}
              y={p.y - 4}
              fill={i === currentWp - 1 ? colors.wpActive : colors.wpFuture}
              fontSize="3"
              textAnchor="middle"
              opacity={i === currentWp - 1 ? 1 : 0.7}
            >
              {i + 1}
            </text>
          </g>
        ))}

        {/* Aircraft */}
        <g transform={`translate(${currentPoint.x}, ${currentPoint.y})`}>
          <polygon points="0,-4 -3,4 0,2 3,4" fill={colors.aircraft} transform="rotate(45)" />
        </g>
      </svg>

      {/* Coordinates overlay */}
      <div
        className="absolute bottom-3 left-3 px-2 py-1 rounded text-xs"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
          color: theme === 'dark' ? '#8899aa' : '#64748b',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
        }}
      >
        50.4501°N, 30.5234°E
      </div>

      {/* Scale */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-2"
        style={{ color: theme === 'dark' ? '#667788' : '#94a3b8', fontSize: '10px' }}
      >
        <div
          className="w-12 h-0.5"
          style={{ backgroundColor: theme === 'dark' ? '#667788' : '#94a3b8' }}
        />
        <span>1 km</span>
      </div>
    </div>
  );
}
