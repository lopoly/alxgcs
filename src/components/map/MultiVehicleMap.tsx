import { useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Theme } from '@/types';

export interface Vehicle {
  id: string;
  name: string;
  type: 'quadcopter' | 'hexacopter' | 'fixed-wing' | 'vtol' | 'rover';
  position: { lat: number; lng: number; altitude: number };
  heading: number;
  speed: number;
  batteryPercent: number;
  connectionStatus: 'connected' | 'disconnected' | 'warning';
  flightMode: string;
  trail?: Array<{ lat: number; lng: number }>;
  color?: string;
}

interface MultiVehicleMapProps {
  theme: Theme;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onVehicleSelect: (vehicleId: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  showTrails?: boolean;
  trailLength?: number;
  showLabels?: boolean;
  showTelemetry?: boolean;
}

// Vehicle icon colors
const vehicleColors: Record<string, string> = {
  default: '#00d4ff',
  selected: '#00ff88',
  warning: '#ffaa00',
  disconnected: '#ff4466',
};

// Create vehicle marker icon
function createVehicleIcon(
  vehicle: Vehicle,
  isSelected: boolean,
  showLabel: boolean
): L.DivIcon {
  const color = vehicle.connectionStatus === 'disconnected'
    ? vehicleColors.disconnected
    : vehicle.connectionStatus === 'warning'
    ? vehicleColors.warning
    : isSelected
    ? vehicleColors.selected
    : vehicle.color || vehicleColors.default;

  const size = isSelected ? 40 : 32;
  const rotation = vehicle.heading;

  // Vehicle type icons
  const vehicleShapes: Record<string, string> = {
    quadcopter: `
      <path d="M12 2L14 8H10L12 2Z" fill="${color}"/>
      <path d="M12 22L10 16H14L12 22Z" fill="${color}"/>
      <path d="M2 12L8 10V14L2 12Z" fill="${color}"/>
      <path d="M22 12L16 14V10L22 12Z" fill="${color}"/>
      <circle cx="12" cy="12" r="4" fill="${color}"/>
    `,
    hexacopter: `
      <circle cx="12" cy="4" r="2" fill="${color}"/>
      <circle cx="18" cy="8" r="2" fill="${color}"/>
      <circle cx="18" cy="16" r="2" fill="${color}"/>
      <circle cx="12" cy="20" r="2" fill="${color}"/>
      <circle cx="6" cy="16" r="2" fill="${color}"/>
      <circle cx="6" cy="8" r="2" fill="${color}"/>
      <circle cx="12" cy="12" r="4" fill="${color}"/>
    `,
    'fixed-wing': `
      <path d="M12 2L15 10H9L12 2Z" fill="${color}"/>
      <path d="M4 12H20L12 14L4 12Z" fill="${color}"/>
      <path d="M10 18H14L12 22L10 18Z" fill="${color}"/>
    `,
    vtol: `
      <path d="M12 2L14 7H10L12 2Z" fill="${color}"/>
      <path d="M4 10H20L12 13L4 10Z" fill="${color}"/>
      <circle cx="6" cy="16" r="2" fill="${color}"/>
      <circle cx="18" cy="16" r="2" fill="${color}"/>
    `,
    rover: `
      <rect x="6" y="8" width="12" height="8" rx="2" fill="${color}"/>
      <circle cx="8" cy="18" r="2" fill="${color}"/>
      <circle cx="16" cy="18" r="2" fill="${color}"/>
    `,
  };

  const shape = vehicleShapes[vehicle.type] || vehicleShapes.quadcopter;

  const labelHtml = showLabel ? `
    <div style="
      position: absolute;
      top: ${size + 4}px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: ${color};
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      white-space: nowrap;
      border: 1px solid ${color}40;
    ">
      ${vehicle.name}
    </div>
  ` : '';

  const svg = `
    <div style="position: relative; width: ${size}px; height: ${size}px;">
      <svg
        width="${size}"
        height="${size}"
        viewBox="0 0 24 24"
        style="transform: rotate(${rotation}deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"
      >
        ${shape}
        ${isSelected ? `<circle cx="12" cy="12" r="11" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="3,3"/>` : ''}
      </svg>
      ${labelHtml}
    </div>
  `;

  return L.divIcon({
    html: svg,
    className: 'vehicle-marker',
    iconSize: [size, size + (showLabel ? 20 : 0)],
    iconAnchor: [size / 2, size / 2],
  });
}

// Component to fit map bounds to all vehicles
function FitBoundsToVehicles({ vehicles, padding = 50 }: { vehicles: Vehicle[]; padding?: number }) {
  const map = useMap();

  useCallback(() => {
    if (vehicles.length === 0) return;

    const bounds = L.latLngBounds(
      vehicles.map((v) => [v.position.lat, v.position.lng] as [number, number])
    );

    map.fitBounds(bounds, { padding: [padding, padding] });
  }, [vehicles, map, padding]);

  return null;
}

// Telemetry overlay for a vehicle
function VehicleTelemetryOverlay({
  vehicle,
  theme,
}: {
  vehicle: Vehicle;
  theme: Theme;
}) {
  const colors = theme === 'dark'
    ? { bg: 'rgba(10, 15, 20, 0.95)', text: '#ffffff', accent: '#00d4ff' }
    : { bg: 'rgba(255, 255, 255, 0.95)', text: '#1e293b', accent: '#0066cc' };

  return (
    <div
      className="absolute top-3 right-3 p-3 rounded-lg z-[1000]"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.accent}40`,
        minWidth: '200px',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm" style={{ color: colors.text }}>
          {vehicle.name}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            backgroundColor: vehicle.connectionStatus === 'connected' ? '#00ff8820' : '#ff446620',
            color: vehicle.connectionStatus === 'connected' ? '#00ff88' : '#ff4466',
          }}
        >
          {vehicle.connectionStatus}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span style={{ color: colors.accent }}>ALT</span>
          <span className="ml-2" style={{ color: colors.text }}>{vehicle.position.altitude.toFixed(0)}m</span>
        </div>
        <div>
          <span style={{ color: colors.accent }}>SPD</span>
          <span className="ml-2" style={{ color: colors.text }}>{vehicle.speed.toFixed(1)}m/s</span>
        </div>
        <div>
          <span style={{ color: colors.accent }}>BAT</span>
          <span className="ml-2" style={{ color: colors.text }}>{vehicle.batteryPercent}%</span>
        </div>
        <div>
          <span style={{ color: colors.accent }}>HDG</span>
          <span className="ml-2" style={{ color: colors.text }}>{vehicle.heading.toFixed(0)}</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t" style={{ borderColor: colors.accent + '30' }}>
        <span className="text-xs" style={{ color: colors.text }}>
          Mode: <span style={{ color: colors.accent }}>{vehicle.flightMode}</span>
        </span>
      </div>
    </div>
  );
}

export function MultiVehicleMap({
  theme,
  vehicles,
  selectedVehicleId,
  onVehicleSelect,
  onMapClick: _onMapClick,
  showTrails = true,
  trailLength = 100,
  showLabels = true,
  showTelemetry = true,
}: MultiVehicleMapProps) {
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);

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
          }
        : {
            bg: '#f0f4f8',
            panel: '#ffffff',
            border: '#e2e8f0',
            text: '#64748b',
            textPrimary: '#1e293b',
            accent: '#0066cc',
          },
    [theme]
  );

  const tileUrl =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  // Calculate center from vehicles or use default
  const center = useMemo(() => {
    if (vehicles.length === 0) return { lat: 50.4501, lng: 30.5234 };

    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (selectedVehicle) {
      return { lat: selectedVehicle.position.lat, lng: selectedVehicle.position.lng };
    }

    const sumLat = vehicles.reduce((sum, v) => sum + v.position.lat, 0);
    const sumLng = vehicles.reduce((sum, v) => sum + v.position.lng, 0);
    return { lat: sumLat / vehicles.length, lng: sumLng / vehicles.length };
  }, [vehicles, selectedVehicleId]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const displayedVehicle = selectedVehicle || (hoveredVehicleId ? vehicles.find((v) => v.id === hoveredVehicleId) : null);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />
        <ZoomControl position="bottomright" />

        {/* Vehicle trails */}
        {showTrails &&
          vehicles.map((vehicle) => {
            if (!vehicle.trail || vehicle.trail.length < 2) return null;

            const trail = vehicle.trail.slice(-trailLength);
            const positions: [number, number][] = trail.map((p) => [p.lat, p.lng]);
            const isSelected = vehicle.id === selectedVehicleId;
            const vehicleColor = vehicle.color || vehicleColors.default;

            return (
              <Polyline
                key={`trail-${vehicle.id}`}
                positions={positions}
                pathOptions={{
                  color: isSelected ? vehicleColors.selected : vehicleColor,
                  weight: isSelected ? 3 : 2,
                  opacity: isSelected ? 0.8 : 0.5,
                  dashArray: isSelected ? undefined : '5, 5',
                }}
              />
            );
          })}

        {/* Vehicle markers */}
        {vehicles.map((vehicle) => {
          const isSelected = vehicle.id === selectedVehicleId;
          const isHovered = vehicle.id === hoveredVehicleId;

          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.position.lat, vehicle.position.lng]}
              icon={createVehicleIcon(vehicle, isSelected, showLabels && (isSelected || isHovered))}
              eventHandlers={{
                click: () => onVehicleSelect(vehicle.id),
                mouseover: () => setHoveredVehicleId(vehicle.id),
                mouseout: () => setHoveredVehicleId(null),
              }}
            />
          );
        })}

        <FitBoundsToVehicles vehicles={vehicles} />
      </MapContainer>

      {/* Selected vehicle telemetry */}
      {showTelemetry && displayedVehicle && (
        <VehicleTelemetryOverlay vehicle={displayedVehicle} theme={theme} />
      )}

      {/* Vehicle list sidebar */}
      <div
        className="absolute top-3 left-3 p-2 rounded-lg z-[1000]"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(10, 15, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${colors.border}`,
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        <div className="text-xs uppercase tracking-wider mb-2 px-2" style={{ color: colors.text }}>
          Vehicles ({vehicles.length})
        </div>
        {vehicles.map((vehicle) => {
          const isSelected = vehicle.id === selectedVehicleId;
          const statusColor = vehicle.connectionStatus === 'connected'
            ? '#00ff88'
            : vehicle.connectionStatus === 'warning'
            ? '#ffaa00'
            : '#ff4466';

          return (
            <button
              key={vehicle.id}
              onClick={() => onVehicleSelect(vehicle.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm"
              style={{
                backgroundColor: isSelected ? colors.accent + '20' : 'transparent',
                color: isSelected ? colors.accent : colors.textPrimary,
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColor }}
              />
              <span className="truncate flex-1">{vehicle.name}</span>
              <span className="text-xs" style={{ color: colors.text }}>
                {vehicle.batteryPercent}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Fit all button */}
      <button
        className="absolute bottom-16 right-3 p-2 rounded-lg z-[1000]"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(10, 15, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${colors.border}`,
          color: colors.textPrimary,
        }}
        title="Fit all vehicles"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>
  );
}
