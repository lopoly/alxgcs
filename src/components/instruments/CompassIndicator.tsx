import type { Theme } from '@/types';

interface CompassIndicatorProps {
  heading: number;
  theme: Theme;
}

export function CompassIndicator({ heading, theme }: CompassIndicatorProps) {
  const colors =
    theme === 'dark'
      ? {
          bg: '#0a0f14',
          ring: '#1a2332',
          text: '#8899aa',
          accent: '#00d4ff',
          cardinal: '#ffffff',
        }
      : {
          bg: '#f0f4f8',
          ring: '#e2e8f0',
          text: '#64748b',
          accent: '#0066cc',
          cardinal: '#1e293b',
        };

  return (
    <div className="relative w-32 h-32" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill={colors.bg} stroke={colors.ring} strokeWidth="1" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={colors.ring} strokeWidth="0.5" />

        {/* Tick marks */}
        {[...Array(36)].map((_, i) => {
          const angle = i * 10 - 90;
          const isMajor = i % 9 === 0;
          const r1 = isMajor ? 38 : 40;
          const r2 = 44;
          return (
            <line
              key={i}
              x1={50 + r1 * Math.cos((angle * Math.PI) / 180)}
              y1={50 + r1 * Math.sin((angle * Math.PI) / 180)}
              x2={50 + r2 * Math.cos((angle * Math.PI) / 180)}
              y2={50 + r2 * Math.sin((angle * Math.PI) / 180)}
              stroke={isMajor ? colors.cardinal : colors.text}
              strokeWidth={isMajor ? 2 : 0.5}
              opacity={isMajor ? 1 : 0.5}
            />
          );
        })}

        {/* Cardinal directions */}
        {['N', 'E', 'S', 'W'].map((dir, i) => {
          const angle = i * 90 - 90;
          return (
            <text
              key={dir}
              x={50 + 32 * Math.cos((angle * Math.PI) / 180)}
              y={50 + 32 * Math.sin((angle * Math.PI) / 180)}
              fill={dir === 'N' ? colors.accent : colors.cardinal}
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {dir}
            </text>
          );
        })}

        {/* Rotating compass card pointer */}
        <g transform={`rotate(${-heading}, 50, 50)`}>
          <polygon points="50,12 46,24 54,24" fill={colors.accent} />
          <polygon points="50,88 46,76 54,76" fill={colors.text} opacity="0.5" />
        </g>

        {/* Heading readout */}
        <text
          x="50"
          y="52"
          fill={colors.cardinal}
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {Math.round(heading)}°
        </text>
      </svg>
    </div>
  );
}
