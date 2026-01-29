import React, { useState, useEffect } from 'react';

// Simulated telemetry data
const useTelemetry = () => {
  const [data, setData] = useState({
    altitude: 847,
    speed: 72,
    heading: 127,
    battery: 78,
    signalStrength: 92,
    gpsCount: 14,
    flightMode: 'AUTO',
    armed: true,
    latitude: 50.4501,
    longitude: 30.5234,
    verticalSpeed: 2.3,
    groundSpeed: 68,
    airSpeed: 72,
    throttle: 45,
    pitch: -3.2,
    roll: 1.8,
    yaw: 127,
    voltage: 24.8,
    current: 12.4,
    mah: 3420,
    distance: 12847,
    homeDistance: 4230,
    eta: '00:18:42',
    flightTime: '00:41:18',
    nextWaypoint: 7,
    totalWaypoints: 12,
    windSpeed: 8,
    windDir: 245,
    temperature: -12,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        altitude: prev.altitude + (Math.random() - 0.5) * 5,
        speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 3),
        heading: (prev.heading + (Math.random() - 0.5) * 2 + 360) % 360,
        battery: Math.max(0, prev.battery - 0.01),
        verticalSpeed: (Math.random() - 0.5) * 4,
        pitch: (Math.random() - 0.5) * 8,
        roll: (Math.random() - 0.5) * 5,
        current: 10 + Math.random() * 5,
        throttle: 40 + Math.random() * 20,
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return data;
};

// Compass/Heading Indicator
const CompassIndicator = ({ heading, theme }) => {
  const colors = theme === 'dark' 
    ? { bg: '#0a0f14', ring: '#1a2332', text: '#8899aa', accent: '#00d4ff', cardinal: '#ffffff' }
    : { bg: '#f0f4f8', ring: '#e2e8f0', text: '#64748b', accent: '#0066cc', cardinal: '#1e293b' };

  return (
    <div className="relative w-32 h-32" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill={colors.bg} stroke={colors.ring} strokeWidth="1"/>
        <circle cx="50" cy="50" r="42" fill="none" stroke={colors.ring} strokeWidth="0.5"/>
        
        {[...Array(36)].map((_, i) => {
          const angle = i * 10 - 90;
          const isMajor = i % 9 === 0;
          const r1 = isMajor ? 38 : 40;
          const r2 = 44;
          return (
            <line
              key={i}
              x1={50 + r1 * Math.cos(angle * Math.PI / 180)}
              y1={50 + r1 * Math.sin(angle * Math.PI / 180)}
              x2={50 + r2 * Math.cos(angle * Math.PI / 180)}
              y2={50 + r2 * Math.sin(angle * Math.PI / 180)}
              stroke={isMajor ? colors.cardinal : colors.text}
              strokeWidth={isMajor ? 2 : 0.5}
              opacity={isMajor ? 1 : 0.5}
            />
          );
        })}
        
        {['N', 'E', 'S', 'W'].map((dir, i) => {
          const angle = i * 90 - 90;
          return (
            <text
              key={dir}
              x={50 + 32 * Math.cos(angle * Math.PI / 180)}
              y={50 + 32 * Math.sin(angle * Math.PI / 180)}
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
        
        <g transform={`rotate(${-heading}, 50, 50)`}>
          <polygon points="50,12 46,24 54,24" fill={colors.accent}/>
          <polygon points="50,88 46,76 54,76" fill={colors.text} opacity="0.5"/>
        </g>
        
        <text x="50" y="52" fill={colors.cardinal} fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
          {Math.round(heading)}°
        </text>
      </svg>
    </div>
  );
};

// Attitude Indicator (Artificial Horizon)
const AttitudeIndicator = ({ pitch, roll, theme }) => {
  const colors = theme === 'dark'
    ? { sky: '#1a4d7c', ground: '#4a3728', line: '#ffffff', accent: '#00d4ff' }
    : { sky: '#4a90d9', ground: '#8b6914', line: '#ffffff', accent: '#ff6600' };

  return (
    <div className="relative w-40 h-40 overflow-hidden rounded-full" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <clipPath id="horizon-clip">
            <circle cx="50" cy="50" r="48"/>
          </clipPath>
          <linearGradient id={`sky-${theme}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme === 'dark' ? '#0a2d4d' : '#2563eb'}/>
            <stop offset="100%" stopColor={colors.sky}/>
          </linearGradient>
          <linearGradient id={`ground-${theme}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.ground}/>
            <stop offset="100%" stopColor={theme === 'dark' ? '#2a1f18' : '#5c4510'}/>
          </linearGradient>
        </defs>
        
        <circle cx="50" cy="50" r="48" fill={theme === 'dark' ? '#0a0f14' : '#e2e8f0'} stroke={theme === 'dark' ? '#1a2332' : '#cbd5e1'} strokeWidth="2"/>
        
        <g clipPath="url(#horizon-clip)" transform={`rotate(${-roll}, 50, 50)`}>
          <rect x="-50" y={-100 + pitch} width="200" height="150" fill={`url(#sky-${theme})`}/>
          <rect x="-50" y={50 + pitch} width="200" height="150" fill={`url(#ground-${theme})`}/>
          <line x1="-50" y1={50 + pitch} x2="150" y2={50 + pitch} stroke={colors.line} strokeWidth="2"/>
          
          {[-30, -20, -10, 10, 20, 30].map(p => (
            <g key={p}>
              <line x1="35" y1={50 + pitch + p} x2="65" y2={50 + pitch + p} stroke={colors.line} strokeWidth="1" opacity="0.7"/>
              <text x="68" y={50 + pitch + p} fill={colors.line} fontSize="5" dominantBaseline="middle" opacity="0.7">{-p}</text>
            </g>
          ))}
        </g>
        
        <g>
          <line x1="20" y1="50" x2="40" y2="50" stroke={colors.accent} strokeWidth="3"/>
          <line x1="60" y1="50" x2="80" y2="50" stroke={colors.accent} strokeWidth="3"/>
          <polygon points="50,46 46,54 54,54" fill={colors.accent}/>
          <circle cx="50" cy="50" r="4" fill="none" stroke={colors.accent} strokeWidth="2"/>
        </g>
        
        <g>
          {[-60, -45, -30, -20, -10, 10, 20, 30, 45, 60].map(angle => (
            <line
              key={angle}
              x1={50 + 42 * Math.sin(angle * Math.PI / 180)}
              y1={50 - 42 * Math.cos(angle * Math.PI / 180)}
              x2={50 + 46 * Math.sin(angle * Math.PI / 180)}
              y2={50 - 46 * Math.cos(angle * Math.PI / 180)}
              stroke={colors.line}
              strokeWidth={Math.abs(angle) % 30 === 0 ? 2 : 1}
              opacity="0.6"
            />
          ))}
          <polygon
            points={`50,4 48,10 52,10`}
            fill={colors.accent}
            transform={`rotate(${roll}, 50, 50)`}
          />
        </g>
      </svg>
    </div>
  );
};

// Vertical Speed Indicator
const VerticalSpeedIndicator = ({ vsi, theme }) => {
  const colors = theme === 'dark'
    ? { bg: '#0a0f14', bar: '#1a2332', positive: '#00d4ff', negative: '#ff4466', text: '#8899aa' }
    : { bg: '#f8fafc', bar: '#e2e8f0', positive: '#0066cc', negative: '#dc2626', text: '#64748b' };

  const maxVsi = 10;
  const clampedVsi = Math.max(-maxVsi, Math.min(maxVsi, vsi));
  const height = (Math.abs(clampedVsi) / maxVsi) * 60;

  return (
    <div className="flex flex-col items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <span style={{ color: colors.text, fontSize: '10px' }}>VS m/s</span>
      <div className="relative w-8 h-32 rounded" style={{ backgroundColor: colors.bar }}>
        <div className="absolute left-0 right-0 top-1/2 h-px" style={{ backgroundColor: colors.text, opacity: 0.3 }}/>
        <div
          className="absolute left-1 right-1 rounded-sm transition-all duration-100"
          style={{
            backgroundColor: vsi >= 0 ? colors.positive : colors.negative,
            height: `${height}px`,
            bottom: vsi >= 0 ? '50%' : 'auto',
            top: vsi < 0 ? '50%' : 'auto',
          }}
        />
      </div>
      <span style={{ 
        color: vsi >= 0 ? colors.positive : colors.negative, 
        fontSize: '12px', 
        fontWeight: 'bold' 
      }}>
        {vsi >= 0 ? '+' : ''}{vsi.toFixed(1)}
      </span>
    </div>
  );
};

// Telemetry Card
const TelemetryCard = ({ label, value, unit, icon, status, theme }) => {
  const colors = theme === 'dark'
    ? { bg: 'rgba(10, 15, 20, 0.9)', border: '#1a2332', label: '#667788', value: '#ffffff', unit: '#8899aa' }
    : { bg: 'rgba(255, 255, 255, 0.95)', border: '#e2e8f0', label: '#64748b', value: '#1e293b', unit: '#94a3b8' };

  const statusColors = {
    good: theme === 'dark' ? '#00d4ff' : '#0066cc',
    warning: '#ffaa00',
    critical: '#ff4466',
  };

  return (
    <div 
      className="px-3 py-2 rounded-lg backdrop-blur-sm border"
      style={{ 
        backgroundColor: colors.bg, 
        borderColor: status ? statusColors[status] : colors.border,
        boxShadow: status === 'critical' ? `0 0 12px ${statusColors.critical}40` : 'none',
      }}
    >
      <div className="flex items-center gap-2">
        {icon && <span style={{ color: status ? statusColors[status] : colors.label }}>{icon}</span>}
        <div>
          <div style={{ color: colors.label, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </div>
          <div className="flex items-baseline gap-1">
            <span style={{ color: colors.value, fontSize: '18px', fontWeight: '600' }}>{value}</span>
            <span style={{ color: colors.unit, fontSize: '11px' }}>{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Battery Indicator
const BatteryIndicator = ({ percentage, voltage, current, theme }) => {
  const colors = theme === 'dark'
    ? { bg: '#0a0f14', border: '#1a2332', text: '#8899aa', value: '#ffffff' }
    : { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b', value: '#1e293b' };

  const getBatteryColor = (pct) => {
    if (pct > 50) return theme === 'dark' ? '#00d4ff' : '#0066cc';
    if (pct > 25) return '#ffaa00';
    return '#ff4466';
  };

  return (
    <div 
      className="p-3 rounded-lg border backdrop-blur-sm"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div 
            className="w-12 h-6 rounded border-2 relative"
            style={{ borderColor: getBatteryColor(percentage) }}
          >
            <div 
              className="absolute inset-0.5 rounded-sm transition-all duration-300"
              style={{ 
                width: `${percentage}%`, 
                backgroundColor: getBatteryColor(percentage),
                opacity: 0.8,
              }}
            />
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-r" style={{ backgroundColor: getBatteryColor(percentage) }}/>
          </div>
        </div>
        <div>
          <div style={{ color: getBatteryColor(percentage), fontSize: '18px', fontWeight: 'bold' }}>
            {percentage.toFixed(0)}%
          </div>
          <div style={{ color: colors.text, fontSize: '10px' }}>
            {voltage.toFixed(1)}V • {current.toFixed(1)}A
          </div>
        </div>
      </div>
    </div>
  );
};

// Flight Mode Badge
const FlightModeBadge = ({ mode, armed, theme }) => {
  const modeColors = {
    AUTO: { bg: '#00d4ff20', text: '#00d4ff', border: '#00d4ff' },
    LOITER: { bg: '#8855ff20', text: '#8855ff', border: '#8855ff' },
    RTL: { bg: '#ffaa0020', text: '#ffaa00', border: '#ffaa00' },
    MANUAL: { bg: '#ff446620', text: '#ff4466', border: '#ff4466' },
    GUIDED: { bg: '#00ff8820', text: '#00ff88', border: '#00ff88' },
  };

  const colors = modeColors[mode] || modeColors.AUTO;

  return (
    <div className="flex items-center gap-2">
      <div 
        className="px-4 py-2 rounded-lg border font-bold tracking-wider"
        style={{ 
          backgroundColor: colors.bg, 
          color: colors.text, 
          borderColor: colors.border,
          fontSize: '14px',
        }}
      >
        {mode}
      </div>
      <div 
        className="px-3 py-2 rounded-lg font-bold tracking-wider animate-pulse"
        style={{ 
          backgroundColor: armed ? '#00ff8820' : '#ff446620',
          color: armed ? '#00ff88' : '#ff4466',
          borderWidth: '1px',
          borderColor: armed ? '#00ff88' : '#ff4466',
          fontSize: '12px',
        }}
      >
        {armed ? 'ARMED' : 'DISARMED'}
      </div>
    </div>
  );
};

// Waypoint Progress
const WaypointProgress = ({ current, total, distance, eta, theme }) => {
  const colors = theme === 'dark'
    ? { bg: '#0a0f14', border: '#1a2332', text: '#8899aa', value: '#ffffff', accent: '#00d4ff', track: '#1a2332' }
    : { bg: '#ffffff', border: '#e2e8f0', text: '#64748b', value: '#1e293b', accent: '#0066cc', track: '#e2e8f0' };

  return (
    <div 
      className="p-3 rounded-lg border backdrop-blur-sm"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: colors.text, fontSize: '10px', textTransform: 'uppercase' }}>Mission Progress</span>
        <span style={{ color: colors.value, fontSize: '12px', fontWeight: 'bold' }}>WP {current}/{total}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: colors.track }}>
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%`, backgroundColor: colors.accent }}
        />
      </div>
      <div className="flex justify-between">
        <span style={{ color: colors.text, fontSize: '10px' }}>
          <span style={{ color: colors.value }}>{(distance / 1000).toFixed(1)}</span> km залишилось
        </span>
        <span style={{ color: colors.text, fontSize: '10px' }}>
          ETA <span style={{ color: colors.accent }}>{eta}</span>
        </span>
      </div>
    </div>
  );
};

// Signal Indicators
const SignalIndicator = ({ label, strength, theme }) => {
  const colors = theme === 'dark'
    ? { bg: '#1a2332', text: '#8899aa', good: '#00d4ff', warning: '#ffaa00', critical: '#ff4466' }
    : { bg: '#e2e8f0', text: '#64748b', good: '#0066cc', warning: '#d97706', critical: '#dc2626' };

  const getColor = (s) => s > 70 ? colors.good : s > 40 ? colors.warning : colors.critical;
  const bars = 5;

  return (
    <div className="flex items-center gap-2">
      <span style={{ color: colors.text, fontSize: '10px', width: '32px' }}>{label}</span>
      <div className="flex items-end gap-0.5 h-4">
        {[...Array(bars)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 rounded-sm transition-all"
            style={{
              height: `${((i + 1) / bars) * 100}%`,
              backgroundColor: strength > (i / bars) * 100 ? getColor(strength) : colors.bg,
            }}
          />
        ))}
      </div>
      <span style={{ color: getColor(strength), fontSize: '11px', fontWeight: '600' }}>{strength}%</span>
    </div>
  );
};

// Map Placeholder with waypoints
const MapView = ({ theme, waypoints = 12, currentWp = 7 }) => {
  const colors = theme === 'dark'
    ? { bg: '#0d1117', grid: '#1a2332', path: '#00d4ff', wpActive: '#00ff88', wpPassed: '#667788', wpFuture: '#00d4ff', aircraft: '#ffaa00' }
    : { bg: '#e8f4f8', grid: '#cbd5e1', path: '#0066cc', wpActive: '#22c55e', wpPassed: '#94a3b8', wpFuture: '#0066cc', aircraft: '#f97316' };

  // Generate path points
  const points = [];
  for (let i = 0; i < waypoints; i++) {
    points.push({
      x: 10 + (i % 4) * 25 + Math.sin(i) * 8,
      y: 15 + Math.floor(i / 4) * 25 + Math.cos(i) * 5,
    });
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ backgroundColor: colors.bg }}>
      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id={`grid-${theme}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={colors.grid} strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${theme})`}/>
      </svg>

      {/* Flight Path */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`}
          fill="none"
          stroke={colors.path}
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.5"
        />
        <path
          d={`M ${points.slice(0, currentWp).map(p => `${p.x},${p.y}`).join(' L ')}`}
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
              fill={i < currentWp - 1 ? colors.wpPassed : i === currentWp - 1 ? colors.wpActive : colors.wpFuture}
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
        <g transform={`translate(${points[currentWp - 1]?.x || 50}, ${points[currentWp - 1]?.y || 50})`}>
          <polygon
            points="0,-4 -3,4 0,2 3,4"
            fill={colors.aircraft}
            transform="rotate(45)"
          />
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
        <div className="w-12 h-0.5" style={{ backgroundColor: theme === 'dark' ? '#667788' : '#94a3b8' }}/>
        <span>1 km</span>
      </div>
    </div>
  );
};

// Mini HUD overlay
const MiniHUD = ({ telemetry, theme }) => {
  const colors = theme === 'dark'
    ? { bg: 'rgba(0,0,0,0.6)', text: '#00d4ff', label: '#667788' }
    : { bg: 'rgba(255,255,255,0.85)', text: '#0066cc', label: '#64748b' };

  return (
    <div 
      className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full backdrop-blur-md flex items-center gap-6"
      style={{ backgroundColor: colors.bg, fontFamily: "'JetBrains Mono', monospace" }}
    >
      <div className="text-center">
        <div style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold' }}>{Math.round(telemetry.altitude)}</div>
        <div style={{ color: colors.label, fontSize: '9px' }}>ALT m</div>
      </div>
      <div className="w-px h-8" style={{ backgroundColor: colors.label, opacity: 0.3 }}/>
      <div className="text-center">
        <div style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold' }}>{Math.round(telemetry.speed)}</div>
        <div style={{ color: colors.label, fontSize: '9px' }}>SPD km/h</div>
      </div>
      <div className="w-px h-8" style={{ backgroundColor: colors.label, opacity: 0.3 }}/>
      <div className="text-center">
        <div style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold' }}>{Math.round(telemetry.heading)}°</div>
        <div style={{ color: colors.label, fontSize: '9px' }}>HDG</div>
      </div>
    </div>
  );
};

// Quick Actions Bar
const QuickActions = ({ theme }) => {
  const colors = theme === 'dark'
    ? { bg: '#0a0f14', border: '#1a2332', text: '#8899aa', hover: '#1a2332' }
    : { bg: '#ffffff', border: '#e2e8f0', text: '#64748b', hover: '#f1f5f9' };

  const actions = [
    { icon: '⏸', label: 'Pause', color: '#ffaa00' },
    { icon: '🏠', label: 'RTL', color: '#ff4466' },
    { icon: '🎯', label: 'Loiter', color: '#8855ff' },
    { icon: '📍', label: 'Go To', color: '#00d4ff' },
    { icon: '📷', label: 'Camera', color: '#00ff88' },
  ];

  return (
    <div 
      className="flex items-center gap-1 p-1 rounded-lg border"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      {actions.map((action, i) => (
        <button
          key={i}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-md transition-colors cursor-pointer"
          style={{ color: colors.text }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{ fontSize: '18px' }}>{action.icon}</span>
          <span style={{ fontSize: '9px', color: action.color }}>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

// Main GCS Component
const GCSFlightScreen = () => {
  const [theme, setTheme] = useState('dark');
  const telemetry = useTelemetry();

  const colors = theme === 'dark'
    ? { 
        bg: '#030508', 
        panel: '#0a0f14', 
        border: '#1a2332', 
        text: '#8899aa',
        accent: '#00d4ff',
      }
    : { 
        bg: '#f0f4f8', 
        panel: '#ffffff', 
        border: '#e2e8f0', 
        text: '#64748b',
        accent: '#0066cc',
      };

  return (
    <div 
      className="w-full h-screen flex flex-col overflow-hidden"
      style={{ 
        backgroundColor: colors.bg, 
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        color: colors.text,
      }}
    >
      {/* Top Bar */}
      <div 
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.accent + '20' }}>
              <span style={{ color: colors.accent, fontWeight: 'bold', fontSize: '14px' }}>G</span>
            </div>
            <div>
              <div style={{ color: theme === 'dark' ? '#ffffff' : '#1e293b', fontWeight: '600', fontSize: '14px' }}>GOR-01</div>
              <div style={{ fontSize: '10px' }}>Airlogix GCS v2.0</div>
            </div>
          </div>
          <FlightModeBadge mode={telemetry.flightMode} armed={telemetry.armed} theme={theme} />
        </div>

        <div className="flex items-center gap-4">
          <SignalIndicator label="RC" strength={telemetry.signalStrength} theme={theme} />
          <SignalIndicator label="VTX" strength={85} theme={theme} />
          <div className="flex items-center gap-1" style={{ color: colors.text, fontSize: '11px' }}>
            <span>🛰</span>
            <span style={{ color: theme === 'dark' ? '#00ff88' : '#16a34a', fontWeight: '600' }}>{telemetry.gpsCount}</span>
            <span>GPS</span>
          </div>
          <div style={{ color: colors.text, fontSize: '11px' }}>
            🕐 {telemetry.flightTime}
          </div>
          <button
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{ 
              backgroundColor: theme === 'dark' ? '#1a2332' : '#e2e8f0',
              color: theme === 'dark' ? '#ffffff' : '#1e293b',
            }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Instruments */}
        <div 
          className="w-56 p-3 border-r flex flex-col gap-3 overflow-y-auto"
          style={{ backgroundColor: colors.panel, borderColor: colors.border }}
        >
          <div className="flex flex-col items-center gap-2">
            <AttitudeIndicator pitch={telemetry.pitch} roll={telemetry.roll} theme={theme} />
            <div className="flex items-center gap-3">
              <CompassIndicator heading={telemetry.heading} theme={theme} />
              <VerticalSpeedIndicator vsi={telemetry.verticalSpeed} theme={theme} />
            </div>
          </div>

          <div className="h-px" style={{ backgroundColor: colors.border }}/>

          <BatteryIndicator 
            percentage={telemetry.battery} 
            voltage={telemetry.voltage} 
            current={telemetry.current} 
            theme={theme} 
          />

          <WaypointProgress 
            current={telemetry.nextWaypoint} 
            total={telemetry.totalWaypoints} 
            distance={telemetry.distance}
            eta={telemetry.eta}
            theme={theme} 
          />

          <div className="h-px" style={{ backgroundColor: colors.border }}/>

          <div className="grid grid-cols-2 gap-2">
            <TelemetryCard label="GND SPD" value={Math.round(telemetry.groundSpeed)} unit="km/h" theme={theme} />
            <TelemetryCard label="AIR SPD" value={Math.round(telemetry.airSpeed)} unit="km/h" theme={theme} />
            <TelemetryCard label="Throttle" value={Math.round(telemetry.throttle)} unit="%" theme={theme} />
            <TelemetryCard label="Home" value={(telemetry.homeDistance / 1000).toFixed(1)} unit="km" theme={theme} />
          </div>

          <div className="h-px" style={{ backgroundColor: colors.border }}/>

          <div 
            className="p-2 rounded-lg text-xs"
            style={{ backgroundColor: theme === 'dark' ? '#0d1117' : '#f8fafc' }}
          >
            <div className="flex justify-between mb-1">
              <span>Wind</span>
              <span style={{ color: theme === 'dark' ? '#ffffff' : '#1e293b' }}>
                {telemetry.windSpeed} m/s @ {telemetry.windDir}°
              </span>
            </div>
            <div className="flex justify-between">
              <span>Temp</span>
              <span style={{ color: telemetry.temperature < 0 ? '#00d4ff' : '#ff4466' }}>
                {telemetry.temperature}°C
              </span>
            </div>
          </div>
        </div>

        {/* Center - Map */}
        <div className="flex-1 relative">
          <MapView theme={theme} waypoints={telemetry.totalWaypoints} currentWp={telemetry.nextWaypoint} />
          <MiniHUD telemetry={telemetry} theme={theme} />
          
          {/* Quick Actions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <QuickActions theme={theme} />
          </div>
        </div>

        {/* Right Panel - Video & Stats */}
        <div 
          className="w-72 p-3 border-l flex flex-col gap-3"
          style={{ backgroundColor: colors.panel, borderColor: colors.border }}
        >
          {/* Video Feed Placeholder */}
          <div 
            className="relative rounded-lg overflow-hidden"
            style={{ backgroundColor: theme === 'dark' ? '#0d1117' : '#e2e8f0', aspectRatio: '16/9' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div style={{ fontSize: '32px', opacity: 0.3 }}>📹</div>
                <div style={{ fontSize: '11px', opacity: 0.5 }}>Video Feed</div>
              </div>
            </div>
            <div 
              className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: '#ff4466', color: '#ffffff' }}
            >
              ● REC
            </div>
            <div 
              className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff' }}
            >
              1080p 30fps
            </div>
          </div>

          {/* Additional Telemetry */}
          <div className="grid grid-cols-2 gap-2">
            <TelemetryCard 
              label="Altitude" 
              value={Math.round(telemetry.altitude)} 
              unit="m AGL" 
              status="good"
              theme={theme} 
            />
            <TelemetryCard 
              label="Distance" 
              value={(telemetry.distance / 1000).toFixed(1)} 
              unit="km" 
              theme={theme} 
            />
            <TelemetryCard 
              label="mAh Used" 
              value={telemetry.mah} 
              unit="mAh" 
              status={telemetry.mah > 4000 ? 'warning' : undefined}
              theme={theme} 
            />
            <TelemetryCard 
              label="Voltage" 
              value={telemetry.voltage.toFixed(1)} 
              unit="V" 
              status={telemetry.voltage < 22 ? 'critical' : telemetry.voltage < 23 ? 'warning' : undefined}
              theme={theme} 
            />
          </div>

          {/* System Status */}
          <div 
            className="p-3 rounded-lg border"
            style={{ backgroundColor: theme === 'dark' ? '#0d1117' : '#f8fafc', borderColor: colors.border }}
          >
            <div style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
              System Status
            </div>
            {[
              { name: 'Autopilot', status: 'ok' },
              { name: 'GPS', status: 'ok' },
              { name: 'Compass', status: 'ok' },
              { name: 'Baro', status: 'ok' },
              { name: 'EKF', status: 'ok' },
            ].map((sys, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span style={{ fontSize: '11px' }}>{sys.name}</span>
                <span style={{ 
                  fontSize: '10px', 
                  color: sys.status === 'ok' ? (theme === 'dark' ? '#00ff88' : '#16a34a') : '#ff4466',
                  fontWeight: '600',
                }}>
                  {sys.status === 'ok' ? '● OK' : '● FAIL'}
                </span>
              </div>
            ))}
          </div>

          {/* Warnings */}
          <div 
            className="p-3 rounded-lg border flex items-center gap-2"
            style={{ 
              backgroundColor: theme === 'dark' ? '#ffaa0010' : '#fef3c7', 
              borderColor: '#ffaa00',
            }}
          >
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <div>
              <div style={{ color: '#ffaa00', fontSize: '11px', fontWeight: '600' }}>High Wind Warning</div>
              <div style={{ fontSize: '10px' }}>Wind gusts up to 12 m/s detected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GCSFlightScreen;
