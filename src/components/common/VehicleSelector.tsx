import { useState } from 'react';
import type { Theme } from '@/types';

export interface SelectorVehicle {
  id: string;
  name: string;
  type: 'quadcopter' | 'hexacopter' | 'fixed-wing' | 'vtol';
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  batteryPercent: number;
  signalStrength: number;
  lastSeen: number;
}

interface VehicleSelectorProps {
  theme: Theme;
  vehicles: SelectorVehicle[];
  selectedVehicle: SelectorVehicle | null;
  onSelect: (vehicle: SelectorVehicle) => void;
}

const vehicleIcons: Record<SelectorVehicle['type'], string> = {
  'quadcopter': '🚁',
  'hexacopter': '🚁',
  'fixed-wing': '✈️',
  'vtol': '🛩️',
};

export function VehicleSelector({ theme, vehicles, selectedVehicle, onSelect }: VehicleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const colors =
    theme === 'dark'
      ? {
          bg: '#0a0f14',
          border: '#1a2332',
          text: '#8899aa',
          textPrimary: '#ffffff',
          accent: '#00d4ff',
          hover: '#1a2332',
          success: '#00ff88',
          warning: '#ffaa00',
        }
      : {
          bg: '#ffffff',
          border: '#e2e8f0',
          text: '#64748b',
          textPrimary: '#1e293b',
          accent: '#0066cc',
          hover: '#f1f5f9',
          success: '#16a34a',
          warning: '#d97706',
        };

  const isConnected = (vehicle: SelectorVehicle) => vehicle.connectionStatus === 'connected';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isOpen ? colors.hover : 'transparent',
          border: `1px solid ${colors.border}`,
        }}
      >
        {selectedVehicle ? (
          <>
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: isConnected(selectedVehicle) ? colors.success : colors.text }}
            />
            <span className="text-lg">{vehicleIcons[selectedVehicle.type]}</span>
            <span className="font-semibold" style={{ color: colors.textPrimary }}>
              {selectedVehicle.name}
            </span>
            <span className="text-xs" style={{ color: colors.text }}>
              ▼
            </span>
          </>
        ) : (
          <span style={{ color: colors.text }}>Select Vehicle...</span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div
            className="absolute top-full left-0 mt-1 w-64 rounded-lg shadow-lg z-50 overflow-hidden"
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div
              className="px-3 py-2 text-xs uppercase tracking-wider border-b"
              style={{ color: colors.text, borderColor: colors.border }}
            >
              Vehicles ({vehicles.length})
            </div>

            {vehicles.map((vehicle, index) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              return (
                <button
                  key={vehicle.id}
                  onClick={() => {
                    onSelect(vehicle);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 transition-colors text-left"
                  style={{
                    backgroundColor: isSelected ? colors.accent + '20' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = colors.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: isConnected(vehicle) ? colors.success : colors.text }}
                  />
                  <span className="text-lg">{vehicleIcons[vehicle.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: colors.textPrimary }}>
                      {vehicle.name}
                    </div>
                    <div className="text-xs" style={{ color: colors.text }}>
                      {isConnected(vehicle) ? `${vehicle.batteryPercent}% battery` : 'Disconnected'}
                    </div>
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.hover, color: colors.text }}>
                    {index + 1}
                  </span>
                </button>
              );
            })}

            <div className="border-t" style={{ borderColor: colors.border }}>
              <button
                className="w-full px-3 py-2 text-sm text-left transition-colors"
                style={{ color: colors.accent }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                + Add Vehicle
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
