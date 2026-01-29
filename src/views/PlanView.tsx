import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, useMapEvents, ZoomControl, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Theme } from '@/types';
import { GeofenceEditor, SurveyPatternEditor, RallyPointsEditor, TerrainProfile, type RallyPoint } from '@/components/mission';

// Geofence types
interface GeofenceZone {
  id: string;
  type: 'inclusion' | 'exclusion';
  points: [number, number][];
}

interface GeofenceSettings {
  enabled: boolean;
  action: 'report' | 'rtl' | 'land' | 'brake';
  maxAltitude: number;
  minAltitude: number;
  zones: GeofenceZone[];
}

// Survey types
interface SurveyPattern {
  id: string;
  type: 'grid' | 'corridor' | 'spiral';
  polygon: [number, number][];
  altitude: number;
  speed: number;
  gridSpacing: number;
  gridAngle: number;
  overlap: number;
  sidelap: number;
  terrainFollow: boolean;
  cameraType: 'mapping' | 'oblique' | 'video';
  turnaroundDistance: number;
}

interface PlanViewProps {
  theme: Theme;
}

interface MissionItem {
  id: number;
  type: 'takeoff' | 'waypoint' | 'loiter' | 'rtl' | 'land' | 'survey';
  lat?: number;
  lng?: number;
  altitude: number;
  param1?: number;
  param2?: number;
}

// Create waypoint marker icon
function createWaypointIcon(number: number, type: string, theme: Theme) {
  const colors: Record<string, string> = {
    takeoff: '#00ff88',
    waypoint: theme === 'dark' ? '#00d4ff' : '#0066cc',
    loiter: '#8855ff',
    rtl: '#ffaa00',
    land: '#ff4466',
    survey: '#00d4ff',
  };
  const color = colors[type] || colors.waypoint;
  const size = 28;

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="#fff" stroke-width="2"/>
      <text x="${size / 2}" y="${size / 2 + 4}" font-size="11" font-weight="bold" fill="#000" text-anchor="middle" font-family="Inter, sans-serif">${number}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'mission-waypoint-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Map click handler component
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function PlanView({ theme }: PlanViewProps) {
  const [missionItems, setMissionItems] = useState<MissionItem[]>([
    { id: 1, type: 'takeoff', altitude: 50 },
    { id: 2, type: 'waypoint', lat: 50.455, lng: 30.520, altitude: 100 },
    { id: 3, type: 'waypoint', lat: 50.460, lng: 30.530, altitude: 100 },
    { id: 4, type: 'waypoint', lat: 50.458, lng: 30.540, altitude: 100 },
    { id: 5, type: 'loiter', lat: 50.452, lng: 30.535, altitude: 100, param1: 60 },
    { id: 6, type: 'rtl', altitude: 0 },
  ]);
  const [selectedItem, setSelectedItem] = useState<number | null>(2);
  const [editMode, setEditMode] = useState<'waypoint' | 'survey' | 'geofence' | 'rally'>('waypoint');

  // Rally points state
  const [rallyPoints, setRallyPoints] = useState<RallyPoint[]>([
    { id: 'rally-1', lat: 50.448, lng: 30.525, altitude: 80, isLanding: true },
  ]);
  const [selectedRallyPoint, setSelectedRallyPoint] = useState<string | null>(null);
  const homePosition = { lat: 50.4501, lng: 30.5234 };

  // Geofence state
  const [geofenceSettings, setGeofenceSettings] = useState<GeofenceSettings>({
    enabled: true,
    action: 'rtl',
    maxAltitude: 120,
    minAltitude: 0,
    zones: [
      {
        id: 'zone-1',
        type: 'inclusion',
        points: [
          [50.445, 30.510],
          [50.465, 30.510],
          [50.465, 30.550],
          [50.445, 30.550],
        ],
      },
    ],
  });
  const [selectedGeofenceZone, setSelectedGeofenceZone] = useState<string | null>(null);

  // Survey pattern state
  const [surveyPattern, setSurveyPattern] = useState<SurveyPattern | null>(null);
  const [isSurveyDrawing, setIsSurveyDrawing] = useState(false);

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
          }
        : {
            bg: '#f0f4f8',
            panel: '#ffffff',
            border: '#e2e8f0',
            text: '#64748b',
            textPrimary: '#1e293b',
            accent: '#0066cc',
            hover: '#f1f5f9',
          },
    [theme]
  );

  const tileUrl =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  // Get waypoints with coordinates for map
  const waypointsWithCoords = missionItems.filter((item) => item.lat && item.lng);
  const pathCoordinates: [number, number][] = waypointsWithCoords.map((wp) => [wp.lat!, wp.lng!]);

  // Calculate mission statistics
  const missionStats = useMemo(() => {
    // Haversine distance calculation
    const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let totalDistance = 0;
    for (let i = 1; i < waypointsWithCoords.length; i++) {
      const prev = waypointsWithCoords[i - 1];
      const curr = waypointsWithCoords[i];
      totalDistance += haversineDistance(prev.lat!, prev.lng!, curr.lat!, curr.lng!);
    }

    const maxAltitude = Math.max(...missionItems.map(item => item.altitude));
    const avgSpeed = 12; // m/s assumption for fixed-wing
    const estTimeSeconds = (totalDistance * 1000) / avgSpeed;
    const estMinutes = Math.floor(estTimeSeconds / 60);
    const estSeconds = Math.floor(estTimeSeconds % 60);

    return {
      distance: totalDistance.toFixed(1),
      time: `${estMinutes}:${estSeconds.toString().padStart(2, '0')}`,
      maxAlt: maxAltitude,
    };
  }, [missionItems, waypointsWithCoords]);

  const handleMapClick = (lat: number, lng: number) => {
    if (editMode === 'waypoint') {
      const newId = Math.max(...missionItems.map((m) => m.id)) + 1;
      const insertIndex = missionItems.findIndex((m) => m.type === 'rtl' || m.type === 'land');
      const newItem: MissionItem = {
        id: newId,
        type: 'waypoint',
        lat,
        lng,
        altitude: 100,
      };

      if (insertIndex >= 0) {
        const newItems = [...missionItems];
        newItems.splice(insertIndex, 0, newItem);
        setMissionItems(newItems);
      } else {
        setMissionItems([...missionItems, newItem]);
      }
      setSelectedItem(newId);
    } else if (editMode === 'geofence' && selectedGeofenceZone) {
      // Add point to selected geofence zone
      setGeofenceSettings((prev) => ({
        ...prev,
        zones: prev.zones.map((zone) =>
          zone.id === selectedGeofenceZone
            ? { ...zone, points: [...zone.points, [lat, lng] as [number, number]] }
            : zone
        ),
      }));
    } else if (editMode === 'survey' && isSurveyDrawing && surveyPattern) {
      // Add point to survey polygon
      setSurveyPattern({
        ...surveyPattern,
        polygon: [...surveyPattern.polygon, [lat, lng]],
      });
    } else if (editMode === 'rally') {
      // Add new rally point
      const newRallyPoint: RallyPoint = {
        id: `rally-${Date.now()}`,
        lat,
        lng,
        altitude: 80,
        isLanding: false,
      };
      setRallyPoints([...rallyPoints, newRallyPoint]);
      setSelectedRallyPoint(newRallyPoint.id);
    }
  };

  const handleDeleteItem = (id: number) => {
    setMissionItems(missionItems.filter((m) => m.id !== id));
    if (selectedItem === id) setSelectedItem(null);
  };

  const handleUpdateItem = (id: number, updates: Partial<MissionItem>) => {
    setMissionItems(missionItems.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const getMissionTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      takeoff: '🛫',
      waypoint: '📍',
      loiter: '🔄',
      rtl: '🏠',
      land: '🛬',
      survey: '📐',
    };
    return icons[type] || '📍';
  };

  const getMissionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      takeoff: 'Takeoff',
      waypoint: 'Waypoint',
      loiter: 'Loiter',
      rtl: 'Return to Launch',
      land: 'Land',
      survey: 'Survey',
    };
    return labels[type] || type;
  };

  const selectedMission = missionItems.find((m) => m.id === selectedItem);

  return (
    <div className="w-full h-full flex" style={{ backgroundColor: colors.bg }}>
      {/* Left Panel - Mission Items */}
      <div
        className="w-72 flex flex-col border-r"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        {/* Tools Header */}
        <div className="p-3 border-b" style={{ borderColor: colors.border }}>
          <div className="grid grid-cols-4 gap-1 mb-3">
            {(['waypoint', 'survey', 'geofence', 'rally'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setEditMode(mode)}
                className="px-2 py-2 rounded-lg text-xs font-medium capitalize"
                style={{
                  backgroundColor: editMode === mode ? colors.accent + '20' : 'transparent',
                  color: editMode === mode ? colors.accent : colors.text,
                  border: `1px solid ${editMode === mode ? colors.accent : colors.border}`,
                }}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
            >
              📤 Upload
            </button>
            <button
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ backgroundColor: colors.hover, color: colors.textPrimary }}
            >
              📥 Download
            </button>
          </div>
        </div>

        {/* Content based on edit mode */}
        {editMode === 'waypoint' && (
          <>
            {/* Mission List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="text-xs uppercase tracking-wider mb-2 px-2" style={{ color: colors.text }}>
                Mission Items ({missionItems.length})
              </div>
              {missionItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className="flex items-center gap-2 p-2 rounded-lg mb-1 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: selectedItem === item.id ? colors.accent + '20' : 'transparent',
                    border: `1px solid ${selectedItem === item.id ? colors.accent : 'transparent'}`,
                  }}
                >
                  <span className="text-lg">{getMissionTypeIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: colors.textPrimary }}>
                      {index + 1}. {getMissionTypeLabel(item.type)}
                    </div>
                    <div className="text-xs" style={{ color: colors.text }}>
                      {item.lat ? `${item.lat.toFixed(4)}, ${item.lng?.toFixed(4)}` : '—'}
                      {item.altitude > 0 && ` • ${item.altitude}m`}
                    </div>
                  </div>
                  {item.type !== 'takeoff' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1 rounded hover:bg-red-500/20"
                      style={{ color: '#ff4466' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Validation Status */}
            <div
              className="p-3 border-t flex items-center gap-2"
              style={{ borderColor: colors.border }}
            >
              <span style={{ color: '#00ff88' }}>✓</span>
              <span className="text-sm" style={{ color: colors.text }}>
                Mission valid • {waypointsWithCoords.length} waypoints
              </span>
            </div>
          </>
        )}

        {editMode === 'geofence' && (
          <GeofenceEditor
            theme={theme}
            settings={geofenceSettings}
            onSettingsChange={setGeofenceSettings}
            selectedZoneId={selectedGeofenceZone}
            onSelectZone={setSelectedGeofenceZone}
          />
        )}

        {editMode === 'survey' && (
          <SurveyPatternEditor
            theme={theme}
            pattern={surveyPattern}
            onPatternChange={setSurveyPattern}
            onStartDrawing={() => setIsSurveyDrawing(true)}
            isDrawing={isSurveyDrawing}
          />
        )}

        {editMode === 'rally' && (
          <RallyPointsEditor
            theme={theme}
            rallyPoints={rallyPoints}
            onRallyPointsChange={setRallyPoints}
            selectedPointId={selectedRallyPoint}
            onSelectPoint={setSelectedRallyPoint}
            homePosition={homePosition}
          />
        )}
      </div>

      {/* Center - Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[50.4501, 30.5234]}
          zoom={13}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={tileUrl} />
          <ZoomControl position="bottomright" />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Mission path */}
          {pathCoordinates.length > 1 && (
            <Polyline
              positions={pathCoordinates}
              pathOptions={{
                color: colors.accent,
                weight: 3,
                opacity: 0.8,
              }}
            />
          )}

          {/* Waypoint markers */}
          {waypointsWithCoords.map((wp) => (
            <Marker
              key={wp.id}
              position={[wp.lat!, wp.lng!]}
              icon={createWaypointIcon(
                missionItems.findIndex((m) => m.id === wp.id) + 1,
                wp.type,
                theme
              )}
              eventHandlers={{
                click: () => setSelectedItem(wp.id),
              }}
            />
          ))}

          {/* Geofence zones */}
          {geofenceSettings.enabled &&
            geofenceSettings.zones.map((zone) => (
              <Polygon
                key={zone.id}
                positions={zone.points}
                pathOptions={{
                  color: zone.type === 'inclusion' ? '#00ff88' : '#ff4466',
                  fillColor: zone.type === 'inclusion' ? '#00ff88' : '#ff4466',
                  fillOpacity: 0.15,
                  weight: selectedGeofenceZone === zone.id ? 3 : 2,
                  dashArray: zone.type === 'exclusion' ? '10, 10' : undefined,
                }}
                eventHandlers={{
                  click: () => {
                    if (editMode === 'geofence') {
                      setSelectedGeofenceZone(zone.id);
                    }
                  },
                }}
              />
            ))}

          {/* Survey pattern polygon */}
          {surveyPattern && surveyPattern.polygon.length >= 3 && (
            <Polygon
              positions={surveyPattern.polygon}
              pathOptions={{
                color: '#8855ff',
                fillColor: '#8855ff',
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
          )}

          {/* Rally point markers */}
          {rallyPoints.map((point) => (
            <CircleMarker
              key={point.id}
              center={[point.lat, point.lng]}
              radius={selectedRallyPoint === point.id ? 12 : 10}
              pathOptions={{
                color: '#ffaa00',
                fillColor: point.isLanding ? '#00ff88' : '#ffaa00',
                fillOpacity: 0.8,
                weight: selectedRallyPoint === point.id ? 3 : 2,
              }}
              eventHandlers={{
                click: () => {
                  if (editMode === 'rally') {
                    setSelectedRallyPoint(point.id);
                  }
                },
              }}
            >
            </CircleMarker>
          ))}

          {/* Home position marker */}
          <CircleMarker
            center={[homePosition.lat, homePosition.lng]}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#00ff88',
              fillOpacity: 1,
              weight: 2,
            }}
          />
        </MapContainer>

        {/* Edit Mode Hint */}
        <div
          className="absolute top-3 left-3 px-4 py-2 rounded-lg backdrop-blur-sm z-[1000]"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(10, 15, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${colors.border}`,
          }}
        >
          <span style={{ color: colors.text, fontSize: '12px' }}>
            {editMode === 'waypoint' && '📍 Click map to add waypoint'}
            {editMode === 'survey' && '📐 Draw survey polygon'}
            {editMode === 'geofence' && '🚧 Draw geofence boundary'}
            {editMode === 'rally' && '🚩 Click map to add rally point'}
          </span>
        </div>

        {/* Stats Bar */}
        <div
          className="absolute bottom-4 left-3 flex gap-4 px-4 py-2 rounded-lg backdrop-blur-sm z-[1000]"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(10, 15, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div>
            <div style={{ color: colors.text, fontSize: '10px' }}>DISTANCE</div>
            <div style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: 600 }}>{missionStats.distance} km</div>
          </div>
          <div>
            <div style={{ color: colors.text, fontSize: '10px' }}>EST. TIME</div>
            <div style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: 600 }}>{missionStats.time}</div>
          </div>
          <div>
            <div style={{ color: colors.text, fontSize: '10px' }}>MAX ALT</div>
            <div style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: 600 }}>{missionStats.maxAlt} m</div>
          </div>
        </div>

        {/* Terrain Profile */}
        <div
          className="absolute bottom-4 right-3 z-[1000]"
          style={{ width: '400px' }}
        >
          <TerrainProfile
            waypoints={waypointsWithCoords.map(wp => ({
              lat: wp.lat!,
              lng: wp.lng!,
              altitude: wp.altitude,
            }))}
            theme={theme}
            height={100}
          />
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div
        className="w-72 flex flex-col border-l"
        style={{ backgroundColor: colors.panel, borderColor: colors.border }}
      >
        <div className="p-3 border-b" style={{ borderColor: colors.border }}>
          <h3 className="font-semibold" style={{ color: colors.textPrimary }}>
            Properties
          </h3>
        </div>

        {selectedMission ? (
          <div className="p-3 space-y-4">
            {/* Type */}
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: colors.text }}>
                Type
              </label>
              <div
                className="px-3 py-2 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: colors.hover }}
              >
                <span>{getMissionTypeIcon(selectedMission.type)}</span>
                <span style={{ color: colors.textPrimary }}>{getMissionTypeLabel(selectedMission.type)}</span>
              </div>
            </div>

            {/* Coordinates */}
            {selectedMission.lat && (
              <>
                <div>
                  <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: colors.text }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    value={selectedMission.lat}
                    onChange={(e) => handleUpdateItem(selectedMission.id, { lat: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: colors.hover,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`,
                    }}
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: colors.text }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    value={selectedMission.lng}
                    onChange={(e) => handleUpdateItem(selectedMission.id, { lng: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: colors.hover,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`,
                    }}
                    step="0.0001"
                  />
                </div>
              </>
            )}

            {/* Altitude */}
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: colors.text }}>
                Altitude (m)
              </label>
              <input
                type="number"
                value={selectedMission.altitude}
                onChange={(e) => handleUpdateItem(selectedMission.id, { altitude: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: colors.hover,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                }}
              />
            </div>

            {/* Loiter Time */}
            {selectedMission.type === 'loiter' && (
              <div>
                <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: colors.text }}>
                  Loiter Time (s)
                </label>
                <input
                  type="number"
                  value={selectedMission.param1 || 0}
                  onChange={(e) => handleUpdateItem(selectedMission.id, { param1: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.hover,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-center text-sm" style={{ color: colors.text }}>
              Select a mission item to edit its properties
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="p-3 border-t mt-auto" style={{ borderColor: colors.border }}>
          <button
            className="w-full px-4 py-3 rounded-lg font-medium text-sm"
            style={{ backgroundColor: colors.accent, color: '#000' }}
          >
            Save Mission
          </button>
        </div>
      </div>
    </div>
  );
}
