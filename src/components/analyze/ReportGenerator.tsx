import { useState, useMemo } from 'react';
import type { Theme } from '@/types';

interface FlightData {
  id: string;
  date: string;
  duration: number;
  distance: number;
  maxAltitude: number;
  maxSpeed: number;
  avgSpeed: number;
  batteryUsed: number;
  startBattery: number;
  endBattery: number;
  vehicle: string;
  pilot: string;
  status: 'completed' | 'aborted' | 'crashed';
  homePosition: { lat: number; lng: number };
  waypoints: Array<{ lat: number; lng: number; altitude: number }>;
  events: Array<{ time: number; type: string; message: string; severity: 'info' | 'warning' | 'error' }>;
  telemetryStats: {
    avgAltitude: number;
    minAltitude: number;
    avgVerticalSpeed: number;
    maxVerticalSpeed: number;
    avgCurrent: number;
    maxCurrent: number;
  };
}

interface ReportSection {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

interface ReportGeneratorProps {
  theme: Theme;
  flightData?: FlightData;
}

export function ReportGenerator({ theme, flightData }: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportTitle, setReportTitle] = useState('Flight Report');
  const [includeMap, setIncludeMap] = useState(true);
  const [includeGraphs, setIncludeGraphs] = useState(true);
  const [brandingLogo, setBrandingLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');

  const [sections, setSections] = useState<ReportSection[]>([
    { id: 'summary', name: 'Flight Summary', enabled: true, description: 'Overview of flight statistics' },
    { id: 'path', name: 'Flight Path Map', enabled: true, description: 'Visual map of the flight trajectory' },
    { id: 'telemetry', name: 'Telemetry Data', enabled: true, description: 'Altitude, speed, and battery graphs' },
    { id: 'events', name: 'Event Log', enabled: true, description: 'Timeline of flight events and alerts' },
    { id: 'waypoints', name: 'Waypoint Details', enabled: true, description: 'List of waypoints visited' },
    { id: 'weather', name: 'Weather Conditions', enabled: false, description: 'Wind and weather data during flight' },
    { id: 'hardware', name: 'Hardware Status', enabled: false, description: 'Vehicle and sensor status' },
  ]);

  // Mock flight data if not provided
  const flight: FlightData = flightData || {
    id: 'FLT-2026-001',
    date: '2026-01-29T10:30:00Z',
    duration: 2478,
    distance: 12.8,
    maxAltitude: 150,
    maxSpeed: 18.5,
    avgSpeed: 12.3,
    batteryUsed: 42,
    startBattery: 98,
    endBattery: 56,
    vehicle: 'Airlogix Scout Pro',
    pilot: 'Operator 1',
    status: 'completed',
    homePosition: { lat: 50.4501, lng: 30.5234 },
    waypoints: [
      { lat: 50.455, lng: 30.520, altitude: 100 },
      { lat: 50.460, lng: 30.530, altitude: 120 },
      { lat: 50.458, lng: 30.540, altitude: 150 },
      { lat: 50.452, lng: 30.535, altitude: 100 },
    ],
    events: [
      { time: 0, type: 'system', message: 'Flight started', severity: 'info' },
      { time: 120, type: 'navigation', message: 'Waypoint 1 reached', severity: 'info' },
      { time: 450, type: 'battery', message: 'Battery at 80%', severity: 'info' },
      { time: 890, type: 'navigation', message: 'Waypoint 2 reached', severity: 'info' },
      { time: 1200, type: 'warning', message: 'High wind detected', severity: 'warning' },
      { time: 1650, type: 'navigation', message: 'Waypoint 3 reached', severity: 'info' },
      { time: 2100, type: 'navigation', message: 'Returning to launch', severity: 'info' },
      { time: 2478, type: 'system', message: 'Flight completed', severity: 'info' },
    ],
    telemetryStats: {
      avgAltitude: 115,
      minAltitude: 45,
      avgVerticalSpeed: 0.8,
      maxVerticalSpeed: 3.2,
      avgCurrent: 12.5,
      maxCurrent: 28.4,
    },
  };

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
          },
    [theme]
  );

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const toggleSection = (id: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBrandingLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDFContent = (): string => {
    const enabledSections = sections.filter((s) => s.enabled);

    // Generate HTML content for PDF
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 40px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #00d4ff;
    }
    .logo { max-height: 60px; }
    .title { font-size: 28px; font-weight: 700; margin: 0; }
    .subtitle { color: #666; margin-top: 5px; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #00d4ff;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .stat-box {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a1a1a; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .event-row {
      display: flex;
      gap: 15px;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .event-time { font-family: monospace; color: #666; min-width: 80px; }
    .event-type {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .event-info { background: #e3f2fd; color: #1565c0; }
    .event-warning { background: #fff3e0; color: #ef6c00; }
    .event-error { background: #ffebee; color: #c62828; }
    .waypoint-table {
      width: 100%;
      border-collapse: collapse;
    }
    .waypoint-table th, .waypoint-table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .waypoint-table th {
      background: #f8f9fa;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      color: #666;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .status-aborted { background: #fff3e0; color: #ef6c00; }
    .status-crashed { background: #ffebee; color: #c62828; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${brandingLogo ? `<img src="${brandingLogo}" class="logo" alt="Logo">` : ''}
      ${companyName ? `<div style="font-weight: 600; margin-top: 5px;">${companyName}</div>` : ''}
    </div>
    <div style="text-align: right;">
      <h1 class="title">${reportTitle}</h1>
      <div class="subtitle">Flight ID: ${flight.id} | ${formatDate(flight.date)}</div>
    </div>
  </div>
`;

    // Summary section
    if (enabledSections.some((s) => s.id === 'summary')) {
      const statusClass = `status-${flight.status}`;
      html += `
  <div class="section">
    <h2 class="section-title">Flight Summary</h2>
    <div style="margin-bottom: 15px;">
      <span class="status-badge ${statusClass}">${flight.status.toUpperCase()}</span>
      <span style="margin-left: 15px; color: #666;">Vehicle: ${flight.vehicle}</span>
      <span style="margin-left: 15px; color: #666;">Pilot: ${flight.pilot}</span>
    </div>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">${formatDuration(flight.duration)}</div>
        <div class="stat-label">Flight Duration</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${flight.distance.toFixed(1)} km</div>
        <div class="stat-label">Distance Covered</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${flight.maxAltitude} m</div>
        <div class="stat-label">Max Altitude</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${flight.maxSpeed.toFixed(1)} m/s</div>
        <div class="stat-label">Max Speed</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${flight.avgSpeed.toFixed(1)} m/s</div>
        <div class="stat-label">Avg Speed</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${flight.batteryUsed}%</div>
        <div class="stat-label">Battery Used</div>
      </div>
    </div>
  </div>
`;
    }

    // Telemetry section
    if (enabledSections.some((s) => s.id === 'telemetry')) {
      html += `
  <div class="section">
    <h2 class="section-title">Telemetry Statistics</h2>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">${flight.telemetryStats.avgAltitude} m</div>
        <div class="stat-label">Avg Altitude</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${flight.telemetryStats.minAltitude} m</div>
        <div class="stat-label">Min Altitude</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${flight.telemetryStats.maxVerticalSpeed.toFixed(1)} m/s</div>
        <div class="stat-label">Max Climb Rate</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${flight.startBattery}%</div>
        <div class="stat-label">Start Battery</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${flight.endBattery}%</div>
        <div class="stat-label">End Battery</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${flight.telemetryStats.maxCurrent.toFixed(1)} A</div>
        <div class="stat-label">Max Current</div>
      </div>
    </div>
  </div>
`;
    }

    // Events section
    if (enabledSections.some((s) => s.id === 'events')) {
      const eventsHtml = flight.events
        .map(
          (event) => `
      <div class="event-row">
        <span class="event-time">${formatDuration(event.time)}</span>
        <span class="event-type event-${event.severity}">${event.type}</span>
        <span>${event.message}</span>
      </div>
    `
        )
        .join('');

      html += `
  <div class="section">
    <h2 class="section-title">Event Log</h2>
    ${eventsHtml}
  </div>
`;
    }

    // Waypoints section
    if (enabledSections.some((s) => s.id === 'waypoints')) {
      const waypointsHtml = flight.waypoints
        .map(
          (wp, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${wp.lat.toFixed(6)}</td>
        <td>${wp.lng.toFixed(6)}</td>
        <td>${wp.altitude} m</td>
      </tr>
    `
        )
        .join('');

      html += `
  <div class="section">
    <h2 class="section-title">Waypoints</h2>
    <table class="waypoint-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Latitude</th>
          <th>Longitude</th>
          <th>Altitude</th>
        </tr>
      </thead>
      <tbody>
        ${waypointsHtml}
      </tbody>
    </table>
  </div>
`;
    }

    html += `
  <div class="footer">
    Generated by Airlogix GCS | ${new Date().toLocaleString()}
  </div>
</body>
</html>
`;

    return html;
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    try {
      // Generate HTML content
      const htmlContent = generatePDFContent();

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportHTML = () => {
    const htmlContent = generatePDFContent();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/\s+/g, '_')}_${flight.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
        style={{ backgroundColor: colors.accent, color: '#000' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Generate Report
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
            style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b" style={{ borderColor: colors.border, backgroundColor: colors.panel }}>
              <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                Generate Flight Report
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:opacity-80"
                style={{ color: colors.text }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Report Settings */}
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: colors.textPrimary }}>
                  Report Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: colors.text }}>
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: colors.hover,
                        color: colors.textPrimary,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: colors.text }}>
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.textPrimary,
                          border: `1px solid ${colors.border}`,
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: colors.text }}>
                        Logo
                      </label>
                      <label
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        {brandingLogo ? (
                          <span style={{ color: colors.success }}>Logo uploaded</span>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Upload logo
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Sections */}
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: colors.textPrimary }}>
                  Include Sections
                </h3>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <label
                      key={section.id}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                      style={{
                        backgroundColor: section.enabled ? colors.accent + '15' : colors.hover,
                        border: `1px solid ${section.enabled ? colors.accent : colors.border}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={() => toggleSection(section.id)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm" style={{ color: colors.textPrimary }}>
                          {section.name}
                        </div>
                        <div className="text-xs" style={{ color: colors.text }}>
                          {section.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: colors.textPrimary }}>
                  Options
                </h3>
                <div className="space-y-2">
                  <label
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                    style={{ backgroundColor: colors.hover }}
                  >
                    <input
                      type="checkbox"
                      checked={includeMap}
                      onChange={(e) => setIncludeMap(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm" style={{ color: colors.textPrimary }}>
                      Include flight path map screenshot
                    </span>
                  </label>
                  <label
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                    style={{ backgroundColor: colors.hover }}
                  >
                    <input
                      type="checkbox"
                      checked={includeGraphs}
                      onChange={(e) => setIncludeGraphs(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm" style={{ color: colors.textPrimary }}>
                      Include telemetry graphs
                    </span>
                  </label>
                </div>
              </div>

              {/* Flight Preview */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.hover, border: `1px solid ${colors.border}` }}
              >
                <h4 className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Flight Preview
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span style={{ color: colors.text }}>ID:</span>{' '}
                    <span style={{ color: colors.textPrimary }}>{flight.id}</span>
                  </div>
                  <div>
                    <span style={{ color: colors.text }}>Date:</span>{' '}
                    <span style={{ color: colors.textPrimary }}>{formatDate(flight.date)}</span>
                  </div>
                  <div>
                    <span style={{ color: colors.text }}>Duration:</span>{' '}
                    <span style={{ color: colors.textPrimary }}>{formatDuration(flight.duration)}</span>
                  </div>
                  <div>
                    <span style={{ color: colors.text }}>Vehicle:</span>{' '}
                    <span style={{ color: colors.textPrimary }}>{flight.vehicle}</span>
                  </div>
                  <div>
                    <span style={{ color: colors.text }}>Distance:</span>{' '}
                    <span style={{ color: colors.textPrimary }}>{flight.distance} km</span>
                  </div>
                  <div>
                    <span style={{ color: colors.text }}>Status:</span>{' '}
                    <span
                      style={{
                        color:
                          flight.status === 'completed'
                            ? colors.success
                            : flight.status === 'aborted'
                            ? colors.warning
                            : colors.error,
                      }}
                    >
                      {flight.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="sticky bottom-0 flex gap-3 p-4 border-t"
              style={{ borderColor: colors.border, backgroundColor: colors.panel }}
            >
              <button
                onClick={handleExportHTML}
                className="flex-1 px-4 py-3 rounded-lg font-medium text-sm"
                style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
              >
                Export as HTML
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex-1 px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.accent, color: '#000' }}
              >
                {isGenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print / Save as PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
