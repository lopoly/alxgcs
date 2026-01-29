import { useState, useRef, useMemo } from 'react';
import type { Theme } from '@/types';

interface MissionItem {
  id: number;
  type: 'takeoff' | 'waypoint' | 'loiter' | 'rtl' | 'land' | 'survey';
  lat?: number;
  lng?: number;
  altitude: number;
  param1?: number;
  param2?: number;
}

interface MissionData {
  name: string;
  version: string;
  created: string;
  items: MissionItem[];
  homePosition?: { lat: number; lng: number; altitude: number };
}

interface MissionImportExportProps {
  theme: Theme;
  missionItems: MissionItem[];
  onImport: (items: MissionItem[]) => void;
  missionName?: string;
  homePosition?: { lat: number; lng: number; altitude: number };
}

type ExportFormat = 'alxmission' | 'plan' | 'waypoints' | 'kml' | 'gpx';

export function MissionImportExport({
  theme,
  missionItems,
  onImport,
  missionName = 'Untitled Mission',
  homePosition,
}: MissionImportExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('alxmission');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            error: '#dc2626',
          },
    [theme]
  );

  const formatOptions: { value: ExportFormat; label: string; extension: string; description: string }[] = [
    { value: 'alxmission', label: 'Airlogix', extension: '.alxmission', description: 'Native Airlogix format with full features' },
    { value: 'plan', label: 'QGroundControl', extension: '.plan', description: 'Compatible with QGC and PX4' },
    { value: 'waypoints', label: 'Mission Planner', extension: '.waypoints', description: 'ArduPilot waypoint format' },
    { value: 'kml', label: 'KML', extension: '.kml', description: 'Google Earth compatible' },
    { value: 'gpx', label: 'GPX', extension: '.gpx', description: 'GPS Exchange Format' },
  ];

  const generateALXMission = (): string => {
    const data: MissionData = {
      name: missionName,
      version: '1.0',
      created: new Date().toISOString(),
      items: missionItems,
      homePosition,
    };
    return JSON.stringify(data, null, 2);
  };

  const generateQGCPlan = (): string => {
    const items = missionItems.map((item, index) => {
      const command = {
        takeoff: 22, // MAV_CMD_NAV_TAKEOFF
        waypoint: 16, // MAV_CMD_NAV_WAYPOINT
        loiter: 17, // MAV_CMD_NAV_LOITER_UNLIM
        rtl: 20, // MAV_CMD_NAV_RETURN_TO_LAUNCH
        land: 21, // MAV_CMD_NAV_LAND
        survey: 16, // Treat as waypoint
      }[item.type] || 16;

      return {
        autoContinue: true,
        command,
        doJumpId: index + 1,
        frame: 3, // MAV_FRAME_GLOBAL_RELATIVE_ALT
        params: [item.param1 || 0, 0, 0, NaN, item.lat || 0, item.lng || 0, item.altitude],
        type: 'SimpleItem',
      };
    });

    const plan = {
      fileType: 'Plan',
      geoFence: { circles: [], polygons: [], version: 2 },
      groundStation: 'Airlogix GCS',
      mission: {
        cruiseSpeed: 15,
        firmwareType: 12, // PX4
        hoverSpeed: 5,
        items,
        plannedHomePosition: homePosition
          ? [homePosition.lat, homePosition.lng, homePosition.altitude]
          : [0, 0, 0],
        vehicleType: 2, // Copter
        version: 2,
      },
      rallyPoints: { points: [], version: 2 },
      version: 1,
    };
    return JSON.stringify(plan, null, 2);
  };

  const generateWaypoints = (): string => {
    const lines = ['QGC WPL 110'];

    // Home position
    if (homePosition) {
      lines.push(`0\t1\t0\t16\t0\t0\t0\t0\t${homePosition.lat}\t${homePosition.lng}\t${homePosition.altitude}\t1`);
    }

    missionItems.forEach((item, index) => {
      const command = {
        takeoff: 22,
        waypoint: 16,
        loiter: 17,
        rtl: 20,
        land: 21,
        survey: 16,
      }[item.type] || 16;

      const seq = homePosition ? index + 1 : index;
      const current = seq === 1 ? 1 : 0;
      lines.push(
        `${seq}\t${current}\t3\t${command}\t${item.param1 || 0}\t0\t0\t0\t${item.lat || 0}\t${item.lng || 0}\t${item.altitude}\t1`
      );
    });

    return lines.join('\n');
  };

  const generateKML = (): string => {
    const waypointsWithCoords = missionItems.filter((item) => item.lat && item.lng);
    const coordinates = waypointsWithCoords
      .map((item) => `${item.lng},${item.lat},${item.altitude}`)
      .join(' ');

    const placemarks = waypointsWithCoords.map(
      (item, index) => `
    <Placemark>
      <name>WP${index + 1} - ${item.type}</name>
      <description>Altitude: ${item.altitude}m</description>
      <Point>
        <coordinates>${item.lng},${item.lat},${item.altitude}</coordinates>
      </Point>
    </Placemark>`
    ).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${missionName}</name>
    <description>Exported from Airlogix GCS</description>
    <Style id="missionPath">
      <LineStyle>
        <color>ffff0000</color>
        <width>3</width>
      </LineStyle>
    </Style>
    <Placemark>
      <name>Mission Path</name>
      <styleUrl>#missionPath</styleUrl>
      <LineString>
        <altitudeMode>relativeToGround</altitudeMode>
        <coordinates>${coordinates}</coordinates>
      </LineString>
    </Placemark>
    ${placemarks}
  </Document>
</kml>`;
  };

  const generateGPX = (): string => {
    const waypointsWithCoords = missionItems.filter((item) => item.lat && item.lng);

    const waypoints = waypointsWithCoords.map(
      (item, index) => `
  <wpt lat="${item.lat}" lon="${item.lng}">
    <ele>${item.altitude}</ele>
    <name>WP${index + 1}</name>
    <desc>${item.type}</desc>
  </wpt>`
    ).join('');

    const trackpoints = waypointsWithCoords.map(
      (item) => `
      <trkpt lat="${item.lat}" lon="${item.lng}">
        <ele>${item.altitude}</ele>
      </trkpt>`
    ).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Airlogix GCS"
  xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${missionName}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  ${waypoints}
  <trk>
    <name>Mission Path</name>
    <trkseg>
      ${trackpoints}
    </trkseg>
  </trk>
</gpx>`;
  };

  const handleExport = () => {
    let content: string;
    let filename: string;
    let mimeType: string;

    const formatInfo = formatOptions.find((f) => f.value === exportFormat)!;
    filename = `${missionName.replace(/\s+/g, '_')}${formatInfo.extension}`;

    switch (exportFormat) {
      case 'alxmission':
        content = generateALXMission();
        mimeType = 'application/json';
        break;
      case 'plan':
        content = generateQGCPlan();
        mimeType = 'application/json';
        break;
      case 'waypoints':
        content = generateWaypoints();
        mimeType = 'text/plain';
        break;
      case 'kml':
        content = generateKML();
        mimeType = 'application/vnd.google-earth.kml+xml';
        break;
      case 'gpx':
        content = generateGPX();
        mimeType = 'application/gpx+xml';
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseALXMission = (content: string): MissionItem[] => {
    const data = JSON.parse(content) as MissionData;
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('Invalid Airlogix mission format');
    }
    return data.items;
  };

  const parseQGCPlan = (content: string): MissionItem[] => {
    const data = JSON.parse(content);
    if (!data.mission?.items) {
      throw new Error('Invalid QGroundControl plan format');
    }

    return data.mission.items.map((item: { command: number; params: number[] }, index: number) => {
      const typeMap: Record<number, MissionItem['type']> = {
        22: 'takeoff',
        16: 'waypoint',
        17: 'loiter',
        20: 'rtl',
        21: 'land',
      };

      return {
        id: index + 1,
        type: typeMap[item.command] || 'waypoint',
        lat: item.params[4] || undefined,
        lng: item.params[5] || undefined,
        altitude: item.params[6] || 0,
        param1: item.params[0] || undefined,
      };
    });
  };

  const parseWaypoints = (content: string): MissionItem[] => {
    const lines = content.trim().split('\n');
    if (!lines[0].startsWith('QGC WPL')) {
      throw new Error('Invalid Mission Planner waypoint format');
    }

    const items: MissionItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split('\t');
      if (parts.length < 12) continue;

      const command = parseInt(parts[3]);
      const typeMap: Record<number, MissionItem['type']> = {
        22: 'takeoff',
        16: 'waypoint',
        17: 'loiter',
        20: 'rtl',
        21: 'land',
      };

      const lat = parseFloat(parts[8]);
      const lng = parseFloat(parts[9]);

      items.push({
        id: i,
        type: typeMap[command] || 'waypoint',
        lat: lat !== 0 ? lat : undefined,
        lng: lng !== 0 ? lng : undefined,
        altitude: parseFloat(parts[10]) || 0,
        param1: parseFloat(parts[4]) || undefined,
      });
    }

    return items;
  };

  const parseKML = (content: string): MissionItem[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'application/xml');
    const items: MissionItem[] = [];

    // Try to parse LineString coordinates
    const lineString = doc.querySelector('LineString coordinates');
    if (lineString) {
      const coords = lineString.textContent?.trim().split(/\s+/) || [];
      coords.forEach((coord, index) => {
        const [lng, lat, alt] = coord.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          items.push({
            id: index + 1,
            type: index === 0 ? 'takeoff' : index === coords.length - 1 ? 'rtl' : 'waypoint',
            lat,
            lng,
            altitude: alt || 100,
          });
        }
      });
    }

    // If no LineString, try individual Placemarks
    if (items.length === 0) {
      const placemarks = doc.querySelectorAll('Placemark Point coordinates');
      placemarks.forEach((pm, index) => {
        const coord = pm.textContent?.trim();
        if (coord) {
          const [lng, lat, alt] = coord.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            items.push({
              id: index + 1,
              type: 'waypoint',
              lat,
              lng,
              altitude: alt || 100,
            });
          }
        }
      });
    }

    if (items.length === 0) {
      throw new Error('No valid coordinates found in KML');
    }

    return items;
  };

  const parseGPX = (content: string): MissionItem[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'application/xml');
    const items: MissionItem[] = [];

    // Parse waypoints first
    const waypoints = doc.querySelectorAll('wpt');
    waypoints.forEach((wpt, index) => {
      const lat = parseFloat(wpt.getAttribute('lat') || '0');
      const lng = parseFloat(wpt.getAttribute('lon') || '0');
      const ele = wpt.querySelector('ele');
      const altitude = ele ? parseFloat(ele.textContent || '100') : 100;

      if (!isNaN(lat) && !isNaN(lng)) {
        items.push({
          id: index + 1,
          type: 'waypoint',
          lat,
          lng,
          altitude,
        });
      }
    });

    // If no waypoints, try track points
    if (items.length === 0) {
      const trkpts = doc.querySelectorAll('trkpt');
      trkpts.forEach((trkpt, index) => {
        const lat = parseFloat(trkpt.getAttribute('lat') || '0');
        const lng = parseFloat(trkpt.getAttribute('lon') || '0');
        const ele = trkpt.querySelector('ele');
        const altitude = ele ? parseFloat(ele.textContent || '100') : 100;

        if (!isNaN(lat) && !isNaN(lng)) {
          items.push({
            id: index + 1,
            type: 'waypoint',
            lat,
            lng,
            altitude,
          });
        }
      });
    }

    if (items.length === 0) {
      throw new Error('No valid waypoints found in GPX');
    }

    return items;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let items: MissionItem[];

        const ext = file.name.toLowerCase();
        if (ext.endsWith('.alxmission')) {
          items = parseALXMission(content);
        } else if (ext.endsWith('.plan')) {
          items = parseQGCPlan(content);
        } else if (ext.endsWith('.waypoints')) {
          items = parseWaypoints(content);
        } else if (ext.endsWith('.kml') || ext.endsWith('.kmz')) {
          items = parseKML(content);
        } else if (ext.endsWith('.gpx')) {
          items = parseGPX(content);
        } else {
          // Try to auto-detect format
          if (content.startsWith('QGC WPL')) {
            items = parseWaypoints(content);
          } else if (content.includes('"fileType"') && content.includes('"Plan"')) {
            items = parseQGCPlan(content);
          } else if (content.includes('<kml')) {
            items = parseKML(content);
          } else if (content.includes('<gpx')) {
            items = parseGPX(content);
          } else {
            items = parseALXMission(content);
          }
        }

        onImport(items);
        setImportSuccess(`Successfully imported ${items.length} mission items`);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Failed to parse mission file');
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read file');
    };

    reader.readAsText(file);

    // Reset input so same file can be selected again
    event.target.value = '';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
        style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Import/Export
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="relative w-full max-w-lg rounded-xl shadow-2xl"
            style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: colors.border }}>
              <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                Mission Import/Export
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

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: colors.border }}>
              {(['export', 'import'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setImportError(null);
                    setImportSuccess(null);
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium capitalize"
                  style={{
                    color: activeTab === tab ? colors.accent : colors.text,
                    borderBottom: activeTab === tab ? `2px solid ${colors.accent}` : '2px solid transparent',
                    backgroundColor: activeTab === tab ? colors.accent + '10' : 'transparent',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4">
              {activeTab === 'export' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: colors.text }}>
                      Export Format
                    </label>
                    <div className="space-y-2">
                      {formatOptions.map((format) => (
                        <label
                          key={format.value}
                          className="flex items-start gap-3 p-3 rounded-lg cursor-pointer"
                          style={{
                            backgroundColor: exportFormat === format.value ? colors.accent + '15' : colors.hover,
                            border: `1px solid ${exportFormat === format.value ? colors.accent : colors.border}`,
                          }}
                        >
                          <input
                            type="radio"
                            name="exportFormat"
                            value={format.value}
                            checked={exportFormat === format.value}
                            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium" style={{ color: colors.textPrimary }}>
                                {format.label}
                              </span>
                              <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ backgroundColor: colors.border, color: colors.text }}
                              >
                                {format.extension}
                              </span>
                            </div>
                            <p className="text-xs mt-1" style={{ color: colors.text }}>
                              {format.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: colors.text }}>Mission items:</span>
                      <span style={{ color: colors.textPrimary }}>{missionItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span style={{ color: colors.text }}>Waypoints:</span>
                      <span style={{ color: colors.textPrimary }}>
                        {missionItems.filter((i) => i.lat && i.lng).length}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleExport}
                    className="w-full px-4 py-3 rounded-lg font-medium"
                    style={{ backgroundColor: colors.accent, color: '#000' }}
                  >
                    Export Mission
                  </button>
                </div>
              )}

              {activeTab === 'import' && (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".alxmission,.plan,.waypoints,.kml,.kmz,.gpx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: colors.border }}
                  >
                    <svg
                      className="w-12 h-12 mx-auto mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={colors.accent}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      Click to select a mission file
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.text }}>
                      or drag and drop
                    </p>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.hover }}>
                    <p className="text-xs font-medium mb-2" style={{ color: colors.textPrimary }}>
                      Supported formats:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formatOptions.map((format) => (
                        <span
                          key={format.value}
                          className="text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: colors.border, color: colors.text }}
                        >
                          {format.extension}
                        </span>
                      ))}
                    </div>
                  </div>

                  {importError && (
                    <div
                      className="p-3 rounded-lg flex items-center gap-2"
                      style={{ backgroundColor: colors.error + '20', color: colors.error }}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">{importError}</span>
                    </div>
                  )}

                  {importSuccess && (
                    <div
                      className="p-3 rounded-lg flex items-center gap-2"
                      style={{ backgroundColor: colors.success + '20', color: colors.success }}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">{importSuccess}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
