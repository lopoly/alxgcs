import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Theme } from '@/types';

interface MapViewProps {
  theme: Theme;
  waypoints?: number;
  currentWp?: number;
  latitude?: number;
  longitude?: number;
  heading?: number;
}

// Custom aircraft icon
function createAircraftIcon(heading: number, theme: Theme) {
  const color = theme === 'dark' ? '#ffaa00' : '#f97316';
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${heading}, 16, 16)">
        <path d="M16 4 L12 24 L16 20 L20 24 Z" fill="${color}" stroke="#000" stroke-width="1"/>
        <path d="M8 18 L16 14 L24 18 L16 16 Z" fill="${color}" stroke="#000" stroke-width="0.5"/>
      </g>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'aircraft-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// Waypoint icon
function createWaypointIcon(number: number, status: 'passed' | 'current' | 'future', theme: Theme) {
  const colors = {
    passed: theme === 'dark' ? '#667788' : '#94a3b8',
    current: '#00ff88',
    future: theme === 'dark' ? '#00d4ff' : '#0066cc',
  };
  const color = colors[status];
  const size = status === 'current' ? 28 : 22;
  const fontSize = status === 'current' ? 12 : 10;

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="#fff" stroke-width="2"/>
      <text x="${size / 2}" y="${size / 2 + fontSize / 3}" font-size="${fontSize}" font-weight="bold" fill="#000" text-anchor="middle" font-family="Inter, sans-serif">${number}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'waypoint-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Map updater component to follow aircraft
function MapFollower({ position, shouldFollow }: { position: [number, number]; shouldFollow: boolean }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      map.setView(position, 14);
      isFirstRender.current = false;
    } else if (shouldFollow) {
      map.panTo(position, { animate: true, duration: 0.5 });
    }
  }, [map, position, shouldFollow]);

  return null;
}

// Generate realistic waypoints around a center point
function generateMissionWaypoints(
  centerLat: number,
  centerLng: number,
  count: number
): [number, number][] {
  const waypoints: [number, number][] = [];

  // Create a logical survey pattern (grid-like flight path)
  const gridSize = 0.008; // ~800m spacing
  const rows = Math.ceil(count / 4);

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const isReversed = row % 2 === 1;
    const actualCol = isReversed ? 3 - col : col;

    const lat = centerLat + (row - rows / 2) * gridSize * 0.6;
    const lng = centerLng + (actualCol - 1.5) * gridSize;

    waypoints.push([lat, lng]);
  }

  return waypoints;
}

export function MapView({
  theme,
  waypoints = 12,
  currentWp = 7,
  latitude = 50.4501,
  longitude = 30.5234,
  heading = 45,
}: MapViewProps) {
  const colors = useMemo(
    () =>
      theme === 'dark'
        ? {
            pathCompleted: '#00d4ff',
            pathPlanned: '#00d4ff',
          }
        : {
            pathCompleted: '#0066cc',
            pathPlanned: '#0066cc',
          },
    [theme]
  );

  // Generate mission waypoints
  const missionWaypoints = useMemo(
    () => generateMissionWaypoints(latitude, longitude, waypoints),
    [latitude, longitude, waypoints]
  );

  // Current aircraft position (at current waypoint)
  const aircraftPosition: [number, number] = useMemo(() => {
    if (currentWp > 0 && currentWp <= missionWaypoints.length) {
      return missionWaypoints[currentWp - 1];
    }
    return [latitude, longitude];
  }, [currentWp, missionWaypoints, latitude, longitude]);

  // Split path into completed and planned
  const completedPath = missionWaypoints.slice(0, currentWp);
  const plannedPath = missionWaypoints.slice(currentWp - 1);

  // Dark mode map tiles
  const tileUrl =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={aircraftPosition}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        style={{ background: theme === 'dark' ? '#0d1117' : '#e8f4f8' }}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ZoomControl position="bottomright" />

        {/* Map follower */}
        <MapFollower position={aircraftPosition} shouldFollow={false} />

        {/* Planned path (dashed) */}
        {plannedPath.length > 1 && (
          <Polyline
            positions={plannedPath}
            pathOptions={{
              color: colors.pathPlanned,
              weight: 3,
              opacity: 0.4,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Completed path (solid) */}
        {completedPath.length > 1 && (
          <Polyline
            positions={completedPath}
            pathOptions={{
              color: colors.pathCompleted,
              weight: 4,
              opacity: 1,
            }}
          />
        )}

        {/* Waypoint markers */}
        {missionWaypoints.map((position, index) => {
          const wpNumber = index + 1;
          let status: 'passed' | 'current' | 'future';
          if (wpNumber < currentWp) {
            status = 'passed';
          } else if (wpNumber === currentWp) {
            status = 'current';
          } else {
            status = 'future';
          }

          return (
            <Marker
              key={index}
              position={position}
              icon={createWaypointIcon(wpNumber, status, theme)}
            />
          );
        })}

        {/* Aircraft marker */}
        <Marker position={aircraftPosition} icon={createAircraftIcon(heading, theme)} />
      </MapContainer>

      {/* Coordinates overlay */}
      <div
        className="absolute bottom-16 left-3 px-3 py-2 rounded-lg backdrop-blur-sm z-[1000]"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(10, 15, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${theme === 'dark' ? '#1a2332' : '#e2e8f0'}`,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div
          style={{
            color: theme === 'dark' ? '#667788' : '#64748b',
            fontSize: '10px',
            marginBottom: '2px',
          }}
        >
          POSITION
        </div>
        <div
          style={{
            color: theme === 'dark' ? '#ffffff' : '#1e293b',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {aircraftPosition[0].toFixed(6)}°N
        </div>
        <div
          style={{
            color: theme === 'dark' ? '#ffffff' : '#1e293b',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {aircraftPosition[1].toFixed(6)}°E
        </div>
      </div>

      {/* Map type selector */}
      <div
        className="absolute top-3 right-3 flex gap-1 z-[1000]"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(10, 15, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          padding: '4px',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#1a2332' : '#e2e8f0'}`,
        }}
      >
        <button
          className="px-3 py-1.5 rounded text-xs font-medium"
          style={{
            backgroundColor: theme === 'dark' ? '#00d4ff20' : '#0066cc20',
            color: theme === 'dark' ? '#00d4ff' : '#0066cc',
          }}
        >
          Map
        </button>
        <button
          className="px-3 py-1.5 rounded text-xs font-medium"
          style={{
            color: theme === 'dark' ? '#667788' : '#64748b',
          }}
        >
          Satellite
        </button>
        <button
          className="px-3 py-1.5 rounded text-xs font-medium"
          style={{
            color: theme === 'dark' ? '#667788' : '#64748b',
          }}
        >
          Terrain
        </button>
      </div>
    </div>
  );
}
