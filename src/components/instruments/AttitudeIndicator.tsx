import type { Theme } from '@/types';

interface AttitudeIndicatorProps {
  pitch: number;
  roll: number;
  theme: Theme;
}

export function AttitudeIndicator({ pitch, roll, theme }: AttitudeIndicatorProps) {
  const colors =
    theme === 'dark'
      ? { sky: '#1a4d7c', ground: '#4a3728', line: '#ffffff', accent: '#00d4ff' }
      : { sky: '#4a90d9', ground: '#8b6914', line: '#ffffff', accent: '#ff6600' };

  return (
    <div
      className="relative w-40 h-40 overflow-hidden rounded-full"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <clipPath id="horizon-clip">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
          <linearGradient id={`sky-${theme}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme === 'dark' ? '#0a2d4d' : '#2563eb'} />
            <stop offset="100%" stopColor={colors.sky} />
          </linearGradient>
          <linearGradient id={`ground-${theme}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.ground} />
            <stop offset="100%" stopColor={theme === 'dark' ? '#2a1f18' : '#5c4510'} />
          </linearGradient>
        </defs>

        <circle
          cx="50"
          cy="50"
          r="48"
          fill={theme === 'dark' ? '#0a0f14' : '#e2e8f0'}
          stroke={theme === 'dark' ? '#1a2332' : '#cbd5e1'}
          strokeWidth="2"
        />

        <g clipPath="url(#horizon-clip)" transform={`rotate(${-roll}, 50, 50)`}>
          <rect x="-50" y={-100 + pitch} width="200" height="150" fill={`url(#sky-${theme})`} />
          <rect x="-50" y={50 + pitch} width="200" height="150" fill={`url(#ground-${theme})`} />
          <line
            x1="-50"
            y1={50 + pitch}
            x2="150"
            y2={50 + pitch}
            stroke={colors.line}
            strokeWidth="2"
          />

          {[-30, -20, -10, 10, 20, 30].map((p) => (
            <g key={p}>
              <line
                x1="35"
                y1={50 + pitch + p}
                x2="65"
                y2={50 + pitch + p}
                stroke={colors.line}
                strokeWidth="1"
                opacity="0.7"
              />
              <text
                x="68"
                y={50 + pitch + p}
                fill={colors.line}
                fontSize="5"
                dominantBaseline="middle"
                opacity="0.7"
              >
                {-p}
              </text>
            </g>
          ))}
        </g>

        {/* Aircraft symbol */}
        <g>
          <line x1="20" y1="50" x2="40" y2="50" stroke={colors.accent} strokeWidth="3" />
          <line x1="60" y1="50" x2="80" y2="50" stroke={colors.accent} strokeWidth="3" />
          <polygon points="50,46 46,54 54,54" fill={colors.accent} />
          <circle cx="50" cy="50" r="4" fill="none" stroke={colors.accent} strokeWidth="2" />
        </g>

        {/* Roll indicator marks */}
        <g>
          {[-60, -45, -30, -20, -10, 10, 20, 30, 45, 60].map((angle) => (
            <line
              key={angle}
              x1={50 + 42 * Math.sin((angle * Math.PI) / 180)}
              y1={50 - 42 * Math.cos((angle * Math.PI) / 180)}
              x2={50 + 46 * Math.sin((angle * Math.PI) / 180)}
              y2={50 - 46 * Math.cos((angle * Math.PI) / 180)}
              stroke={colors.line}
              strokeWidth={Math.abs(angle) % 30 === 0 ? 2 : 1}
              opacity="0.6"
            />
          ))}
          <polygon
            points="50,4 48,10 52,10"
            fill={colors.accent}
            transform={`rotate(${roll}, 50, 50)`}
          />
        </g>
      </svg>
    </div>
  );
}
