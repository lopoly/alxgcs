import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Theme } from '@/types';

interface DataPoint {
  timestamp: number;
  value: number;
}

interface DataTrace {
  id: string;
  name: string;
  data: DataPoint[];
  color: string;
  visible: boolean;
  yAxis: 'left' | 'right';
}

interface GraphBuilderProps {
  theme: Theme;
  flightDuration?: number;
  onExport?: (format: 'png' | 'csv') => void;
}

// Generate sample telemetry data
const generateSampleData = (_name: string, baseValue: number, variance: number, points: number): DataPoint[] => {
  const data: DataPoint[] = [];
  let value = baseValue;
  for (let i = 0; i < points; i++) {
    value = baseValue + (Math.random() - 0.5) * variance + Math.sin(i / 20) * (variance / 3);
    data.push({
      timestamp: i * 100, // 100ms intervals
      value: Math.round(value * 100) / 100,
    });
  }
  return data;
};

const traceColors = ['#00d4ff', '#00ff88', '#ffaa00', '#ff4466', '#8855ff', '#ff88aa', '#88ff88', '#ffff00'];

const availableParameters = [
  { id: 'altitude', name: 'Altitude (m)', group: 'Position' },
  { id: 'altitude_agl', name: 'Altitude AGL (m)', group: 'Position' },
  { id: 'groundspeed', name: 'Ground Speed (m/s)', group: 'Velocity' },
  { id: 'airspeed', name: 'Air Speed (m/s)', group: 'Velocity' },
  { id: 'vspeed', name: 'Vertical Speed (m/s)', group: 'Velocity' },
  { id: 'roll', name: 'Roll (°)', group: 'Attitude' },
  { id: 'pitch', name: 'Pitch (°)', group: 'Attitude' },
  { id: 'yaw', name: 'Yaw (°)', group: 'Attitude' },
  { id: 'heading', name: 'Heading (°)', group: 'Navigation' },
  { id: 'battery_voltage', name: 'Battery Voltage (V)', group: 'Power' },
  { id: 'battery_current', name: 'Battery Current (A)', group: 'Power' },
  { id: 'battery_remaining', name: 'Battery Remaining (%)', group: 'Power' },
  { id: 'throttle', name: 'Throttle (%)', group: 'Control' },
  { id: 'rc_roll', name: 'RC Roll', group: 'RC Input' },
  { id: 'rc_pitch', name: 'RC Pitch', group: 'RC Input' },
  { id: 'rc_throttle', name: 'RC Throttle', group: 'RC Input' },
  { id: 'gps_hdop', name: 'GPS HDOP', group: 'GPS' },
  { id: 'gps_satellites', name: 'GPS Satellites', group: 'GPS' },
  { id: 'vibration_x', name: 'Vibration X', group: 'Sensors' },
  { id: 'vibration_y', name: 'Vibration Y', group: 'Sensors' },
  { id: 'vibration_z', name: 'Vibration Z', group: 'Sensors' },
];

export function GraphBuilder({ theme, flightDuration = 600, onExport }: GraphBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [traces, setTraces] = useState<DataTrace[]>([]);
  const [selectedParam, setSelectedParam] = useState<string>('');
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [zoomRange, setZoomRange] = useState<[number, number]>([0, flightDuration * 1000]);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const colors = useMemo(() => theme === 'dark'
    ? {
        bg: '#0a0f14',
        panel: '#0d1117',
        border: '#1a2332',
        text: '#8899aa',
        textPrimary: '#ffffff',
        accent: '#00d4ff',
        hover: '#1a2332',
        grid: '#1a2332',
        cursor: '#ffffff',
      }
    : {
        bg: '#f0f4f8',
        panel: '#ffffff',
        border: '#e2e8f0',
        text: '#64748b',
        textPrimary: '#1e293b',
        accent: '#0066cc',
        hover: '#f1f5f9',
        grid: '#e2e8f0',
        cursor: '#1e293b',
      }, [theme]);

  // Add a trace
  const addTrace = useCallback((paramId: string) => {
    const param = availableParameters.find(p => p.id === paramId);
    if (!param || traces.length >= 8) return;

    // Generate sample data based on parameter type
    let baseValue = 100;
    let variance = 20;

    switch (paramId) {
      case 'altitude': baseValue = 150; variance = 30; break;
      case 'groundspeed': baseValue = 15; variance = 5; break;
      case 'airspeed': baseValue = 18; variance = 5; break;
      case 'vspeed': baseValue = 0; variance = 3; break;
      case 'roll': baseValue = 0; variance = 15; break;
      case 'pitch': baseValue = 5; variance = 10; break;
      case 'battery_voltage': baseValue = 11.5; variance = 1; break;
      case 'battery_current': baseValue = 8; variance = 4; break;
      case 'throttle': baseValue = 50; variance = 30; break;
      default: baseValue = 50; variance = 20;
    }

    const newTrace: DataTrace = {
      id: paramId,
      name: param.name,
      data: generateSampleData(paramId, baseValue, variance, flightDuration * 10),
      color: traceColors[traces.length % traceColors.length],
      visible: true,
      yAxis: traces.length === 0 ? 'left' : 'right',
    };

    setTraces(prev => [...prev, newTrace]);
    setShowAddPanel(false);
  }, [traces, flightDuration]);

  // Remove a trace
  const removeTrace = useCallback((traceId: string) => {
    setTraces(prev => prev.filter(t => t.id !== traceId));
  }, []);

  // Toggle trace visibility
  const toggleTraceVisibility = useCallback((traceId: string) => {
    setTraces(prev => prev.map(t =>
      t.id === traceId ? { ...t, visible: !t.visible } : t
    ));
  }, []);

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 60, bottom: 40, left: 60 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.fillStyle = colors.panel;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;

    // Vertical grid lines (time)
    const timeSteps = 10;
    for (let i = 0; i <= timeSteps; i++) {
      const x = padding.left + (i / timeSteps) * graphWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();

      // Time labels
      const time = zoomRange[0] + (i / timeSteps) * (zoomRange[1] - zoomRange[0]);
      const timeStr = (time / 1000).toFixed(0) + 's';
      ctx.fillStyle = colors.text;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, height - padding.bottom + 15);
    }

    // Horizontal grid lines
    const valueSteps = 5;
    for (let i = 0; i <= valueSteps; i++) {
      const y = padding.top + (i / valueSteps) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw traces
    const visibleTraces = traces.filter(t => t.visible);

    visibleTraces.forEach((trace) => {
      // Calculate min/max for this trace
      const filteredData = trace.data.filter(
        d => d.timestamp >= zoomRange[0] && d.timestamp <= zoomRange[1]
      );
      if (filteredData.length === 0) return;

      const minValue = Math.min(...filteredData.map(d => d.value));
      const maxValue = Math.max(...filteredData.map(d => d.value));
      const valueRange = maxValue - minValue || 1;

      // Draw line
      ctx.strokeStyle = trace.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      filteredData.forEach((point, idx) => {
        const x = padding.left + ((point.timestamp - zoomRange[0]) / (zoomRange[1] - zoomRange[0])) * graphWidth;
        const y = padding.top + (1 - (point.value - minValue) / valueRange) * graphHeight;

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw Y-axis labels for this trace
      const yAxisX = trace.yAxis === 'left' ? padding.left - 5 : width - padding.right + 5;
      ctx.fillStyle = trace.color;
      ctx.font = '10px sans-serif';
      ctx.textAlign = trace.yAxis === 'left' ? 'right' : 'left';
      ctx.fillText(maxValue.toFixed(1), yAxisX, padding.top + 10);
      ctx.fillText(minValue.toFixed(1), yAxisX, height - padding.bottom - 5);
    });

    // Draw cursor
    if (cursorPosition !== null) {
      const x = padding.left + ((cursorPosition - zoomRange[0]) / (zoomRange[1] - zoomRange[0])) * graphWidth;
      if (x >= padding.left && x <= width - padding.right) {
        ctx.strokeStyle = colors.cursor;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [traces, zoomRange, cursorPosition, colors]);

  // Handle mouse move for cursor
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 60, right: 60 };
    const graphWidth = rect.width - padding.left - padding.right;

    if (x >= padding.left && x <= rect.width - padding.right) {
      const ratio = (x - padding.left) / graphWidth;
      const timestamp = zoomRange[0] + ratio * (zoomRange[1] - zoomRange[0]);
      setCursorPosition(timestamp);
    }
  }, [zoomRange]);

  // Get cursor values
  const cursorValues = useMemo(() => {
    if (cursorPosition === null) return [];

    return traces.filter(t => t.visible).map(trace => {
      const closest = trace.data.reduce((prev, curr) =>
        Math.abs(curr.timestamp - cursorPosition) < Math.abs(prev.timestamp - cursorPosition) ? curr : prev
      );
      return {
        name: trace.name,
        value: closest.value,
        color: trace.color,
      };
    });
  }, [traces, cursorPosition]);

  // Calculate statistics
  const statistics = useMemo(() => {
    return traces.filter(t => t.visible).map(trace => {
      const filteredData = trace.data.filter(
        d => d.timestamp >= zoomRange[0] && d.timestamp <= zoomRange[1]
      );
      if (filteredData.length === 0) return { name: trace.name, color: trace.color, min: 0, max: 0, avg: 0 };

      const values = filteredData.map(d => d.value);
      return {
        name: trace.name,
        color: trace.color,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
      };
    });
  }, [traces, zoomRange]);

  // Group parameters by group
  const groupedParams = useMemo(() => {
    const groups: Record<string, typeof availableParameters> = {};
    availableParameters.forEach(p => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, []);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
      {/* Toolbar */}
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPanel(!showAddPanel)}
            className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2"
            style={{ backgroundColor: colors.accent, color: '#000000' }}
          >
            <span>+</span> Add Trace
          </button>

          {traces.length > 0 && (
            <button
              onClick={() => setTraces([])}
              className="px-3 py-1.5 rounded text-sm"
              style={{ backgroundColor: colors.hover, color: colors.text }}
            >
              Clear All
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomRange([0, flightDuration * 1000])}
            className="px-3 py-1.5 rounded text-sm"
            style={{ backgroundColor: colors.hover, color: colors.text }}
          >
            Reset Zoom
          </button>
          <button
            onClick={() => onExport?.('png')}
            className="px-3 py-1.5 rounded text-sm"
            style={{ backgroundColor: colors.hover, color: colors.text }}
          >
            Export PNG
          </button>
          <button
            onClick={() => onExport?.('csv')}
            className="px-3 py-1.5 rounded text-sm"
            style={{ backgroundColor: colors.hover, color: colors.text }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Add trace panel */}
        {showAddPanel && (
          <div className="w-64 border-r overflow-y-auto p-3" style={{ borderColor: colors.border }}>
            <h4 className="font-medium mb-3" style={{ color: colors.textPrimary }}>Add Parameter</h4>
            <input
              type="text"
              placeholder="Search..."
              value={selectedParam}
              onChange={(e) => setSelectedParam(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm mb-3"
              style={{
                backgroundColor: colors.hover,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
              }}
            />
            <div className="space-y-3">
              {Object.entries(groupedParams).map(([group, params]) => (
                <div key={group}>
                  <div className="text-xs font-medium uppercase mb-1" style={{ color: colors.text }}>{group}</div>
                  <div className="space-y-1">
                    {params
                      .filter(p => p.name.toLowerCase().includes(selectedParam.toLowerCase()))
                      .map(param => (
                        <button
                          key={param.id}
                          onClick={() => addTrace(param.id)}
                          disabled={traces.some(t => t.id === param.id)}
                          className="w-full text-left px-2 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
                          style={{
                            backgroundColor: traces.some(t => t.id === param.id) ? colors.accent + '20' : 'transparent',
                            color: colors.textPrimary,
                          }}
                        >
                          {param.name}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Graph area */}
        <div className="flex-1 flex flex-col">
          {/* Trace legend */}
          {traces.length > 0 && (
            <div className="p-2 flex flex-wrap gap-2 border-b" style={{ borderColor: colors.border }}>
              {traces.map(trace => (
                <div
                  key={trace.id}
                  className="flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer"
                  style={{
                    backgroundColor: trace.visible ? trace.color + '20' : colors.hover,
                    opacity: trace.visible ? 1 : 0.5,
                  }}
                  onClick={() => toggleTraceVisibility(trace.id)}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: trace.color }}
                  />
                  <span style={{ color: colors.textPrimary }}>{trace.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeTrace(trace.id); }}
                    className="ml-1 hover:opacity-70"
                    style={{ color: colors.text }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 relative">
            {traces.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4 opacity-30">📈</div>
                  <p style={{ color: colors.text }}>Click "Add Trace" to start building your graph</p>
                </div>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setCursorPosition(null)}
              />
            )}

            {/* Cursor values tooltip */}
            {cursorPosition !== null && cursorValues.length > 0 && (
              <div
                className="absolute top-4 right-4 p-3 rounded-lg"
                style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
              >
                <div className="text-xs mb-2 font-mono" style={{ color: colors.text }}>
                  T: {(cursorPosition / 1000).toFixed(1)}s
                </div>
                {cursorValues.map((cv, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cv.color }} />
                    <span style={{ color: colors.textPrimary }}>{cv.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statistics */}
          {statistics.length > 0 && (
            <div className="p-3 border-t" style={{ borderColor: colors.border }}>
              <div className="flex gap-4 overflow-x-auto">
                {statistics.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                    <div>
                      <span style={{ color: colors.text }}>Min: </span>
                      <span style={{ color: colors.textPrimary }}>{stat.min.toFixed(2)}</span>
                    </div>
                    <div>
                      <span style={{ color: colors.text }}>Max: </span>
                      <span style={{ color: colors.textPrimary }}>{stat.max.toFixed(2)}</span>
                    </div>
                    <div>
                      <span style={{ color: colors.text }}>Avg: </span>
                      <span style={{ color: colors.textPrimary }}>{stat.avg.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
