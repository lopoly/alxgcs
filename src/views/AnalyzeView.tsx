import { useState, useMemo } from 'react';
import type { Theme } from '@/types';

interface AnalyzeViewProps {
  theme: Theme;
}

interface FlightLog {
  id: string;
  date: string;
  duration: string;
  vehicle: string;
  maxAlt: number;
  maxSpeed: number;
  distance: number;
  status: 'complete' | 'crash' | 'aborted';
}

const mockFlightLogs: FlightLog[] = [
  { id: '1', date: '2026-01-29 14:32', duration: '00:41:18', vehicle: 'GOR-01', maxAlt: 847, maxSpeed: 72, distance: 12.8, status: 'complete' },
  { id: '2', date: '2026-01-28 10:15', duration: '00:28:45', vehicle: 'GOR-01', maxAlt: 650, maxSpeed: 68, distance: 8.4, status: 'complete' },
  { id: '3', date: '2026-01-27 16:00', duration: '00:15:22', vehicle: 'GOR-02', maxAlt: 450, maxSpeed: 55, distance: 4.2, status: 'aborted' },
  { id: '4', date: '2026-01-26 09:30', duration: '00:52:10', vehicle: 'GOR-01', maxAlt: 920, maxSpeed: 85, distance: 18.6, status: 'complete' },
  { id: '5', date: '2026-01-25 11:45', duration: '00:08:33', vehicle: 'GOR-03', maxAlt: 320, maxSpeed: 48, distance: 2.1, status: 'crash' },
];

const graphTypes = [
  { id: 'altitude', label: 'Altitude', unit: 'm' },
  { id: 'speed', label: 'Speed', unit: 'km/h' },
  { id: 'battery', label: 'Battery', unit: '%' },
  { id: 'current', label: 'Current', unit: 'A' },
  { id: 'attitude', label: 'Attitude', unit: '°' },
  { id: 'gps', label: 'GPS', unit: 'sats' },
];

export function AnalyzeView({ theme }: AnalyzeViewProps) {
  const [selectedLog, setSelectedLog] = useState<string | null>('1');
  const [activeGraphs, setActiveGraphs] = useState<string[]>(['altitude', 'speed']);
  const [playbackPosition, setPlaybackPosition] = useState(65);
  const [isPlaying, setIsPlaying] = useState(false);

  const colors = useMemo(
    () =>
      theme === 'dark'
        ? {
            bg: '#030508',
            panel: '#0a0f14',
            border: '#1a2332',
            text: '#8899aa',
            textPrimary: '#ffffff',
            accent: '#00d4ff',
            hover: '#1a2332',
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff4466',
            graphBg: '#0d1117',
          }
        : {
            bg: '#f0f4f8',
            panel: '#ffffff',
            border: '#e2e8f0',
            text: '#64748b',
            textPrimary: '#1e293b',
            accent: '#0066cc',
            hover: '#f1f5f9',
            success: '#16a34a',
            warning: '#d97706',
            error: '#dc2626',
            graphBg: '#f8fafc',
          },
    [theme]
  );

  const selectedFlight = mockFlightLogs.find((l) => l.id === selectedLog);

  const toggleGraph = (id: string) => {
    setActiveGraphs((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: FlightLog['status']) => {
    switch (status) {
      case 'complete': return colors.success;
      case 'aborted': return colors.warning;
      case 'crash': return colors.error;
    }
  };

  // Mock graph data visualization
  const renderGraph = (type: string) => {
    const graphInfo = graphTypes.find((g) => g.id === type);
    const points = Array.from({ length: 100 }, (_, i) => {
      const base = type === 'altitude' ? 500 : type === 'speed' ? 50 : type === 'battery' ? 100 : 50;
      const variance = type === 'altitude' ? 300 : type === 'speed' ? 20 : type === 'battery' ? 30 : 20;
      return base + Math.sin(i / 10) * variance + (Math.random() - 0.5) * (variance / 3);
    });

    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min;

    const pathD = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * 100;
        const y = 100 - ((p - min) / range) * 80 - 10;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return (
      <div
        key={type}
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: colors.graphBg, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: colors.border }}>
          <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
            {graphInfo?.label}
          </span>
          <span className="text-xs" style={{ color: colors.text }}>
            {graphInfo?.unit}
          </span>
        </div>
        <div className="h-32 relative p-2">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={colors.border} strokeWidth="0.5" />
            ))}
            {/* Data line */}
            <path d={pathD} fill="none" stroke={colors.accent} strokeWidth="1.5" />
            {/* Playback position */}
            <line
              x1={playbackPosition}
              y1="0"
              x2={playbackPosition}
              y2="100"
              stroke={colors.warning}
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          </svg>
          {/* Y-axis labels */}
          <div className="absolute left-2 top-2 text-xs" style={{ color: colors.text }}>
            {max.toFixed(0)}
          </div>
          <div className="absolute left-2 bottom-2 text-xs" style={{ color: colors.text }}>
            {min.toFixed(0)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex" style={{ backgroundColor: colors.bg }}>
      {/* Left Panel - Flight Logs */}
      <div
        className="w-72 flex flex-col border-r"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        <div className="p-4 border-b" style={{ borderColor: colors.border }}>
          <h2 className="font-semibold" style={{ color: colors.textPrimary }}>
            Flight Logs
          </h2>
          <p className="text-xs mt-1" style={{ color: colors.text }}>
            {mockFlightLogs.length} flights recorded
          </p>
        </div>

        <div className="p-2 border-b" style={{ borderColor: colors.border }}>
          <div className="flex gap-2">
            <button
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
            >
              📂 Import
            </button>
            <button
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
            >
              📁 Export
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {mockFlightLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log.id)}
              className="p-3 rounded-lg mb-2 cursor-pointer transition-colors"
              style={{
                backgroundColor: selectedLog === log.id ? colors.accent + '20' : 'transparent',
                border: `1px solid ${selectedLog === log.id ? colors.accent : 'transparent'}`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  {log.vehicle}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: getStatusColor(log.status) + '20',
                    color: getStatusColor(log.status),
                  }}
                >
                  {log.status}
                </span>
              </div>
              <div className="text-xs" style={{ color: colors.text }}>
                {log.date}
              </div>
              <div className="flex gap-3 mt-2 text-xs" style={{ color: colors.text }}>
                <span>⏱ {log.duration}</span>
                <span>📏 {log.distance} km</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedFlight ? (
          <>
            {/* Flight Summary */}
            <div className="p-4 border-b" style={{ borderColor: colors.border }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: colors.textPrimary }}>
                    {selectedFlight.vehicle} - {selectedFlight.date}
                  </h3>
                  <p className="text-sm" style={{ color: colors.text }}>
                    Duration: {selectedFlight.duration} • Distance: {selectedFlight.distance} km
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
                  >
                    📄 Report
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
                  >
                    🗺️ 3D View
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                {[
                  { label: 'Max Altitude', value: selectedFlight.maxAlt, unit: 'm' },
                  { label: 'Max Speed', value: selectedFlight.maxSpeed, unit: 'km/h' },
                  { label: 'Distance', value: selectedFlight.distance, unit: 'km' },
                  { label: 'Duration', value: selectedFlight.duration, unit: '' },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
                    <div className="text-xs uppercase" style={{ color: colors.text }}>
                      {stat.label}
                    </div>
                    <div className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                      {stat.value}
                      <span className="text-sm font-normal ml-1" style={{ color: colors.text }}>
                        {stat.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graph Controls */}
            <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: colors.border }}>
              <span className="text-sm" style={{ color: colors.text }}>
                Show:
              </span>
              {graphTypes.map((graph) => (
                <button
                  key={graph.id}
                  onClick={() => toggleGraph(graph.id)}
                  className="px-3 py-1.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: activeGraphs.includes(graph.id) ? colors.accent + '20' : 'transparent',
                    color: activeGraphs.includes(graph.id) ? colors.accent : colors.text,
                    border: `1px solid ${activeGraphs.includes(graph.id) ? colors.accent : colors.border}`,
                  }}
                >
                  {graph.label}
                </button>
              ))}
            </div>

            {/* Graphs */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                {activeGraphs.map((graphId) => renderGraph(graphId))}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="p-4 border-t" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.accent, color: '#000' }}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={playbackPosition}
                    onChange={(e) => setPlaybackPosition(parseInt(e.target.value))}
                    className="w-full"
                    style={{ accentColor: colors.accent }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: colors.text }}>
                    <span>00:00:00</span>
                    <span style={{ color: colors.accent }}>
                      {Math.floor((playbackPosition / 100) * 41)}:{String(Math.floor(((playbackPosition / 100) * 41 * 60) % 60)).padStart(2, '0')}
                    </span>
                    <span>{selectedFlight.duration}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: colors.hover, color: colors.text }}
                  >
                    0.5x
                  </button>
                  <button
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
                  >
                    1x
                  </button>
                  <button
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: colors.hover, color: colors.text }}
                  >
                    2x
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p style={{ color: colors.text }}>Select a flight log to analyze</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
