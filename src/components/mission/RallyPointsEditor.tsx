import { useState } from 'react';
import type { Theme } from '@/types';

export interface RallyPoint {
  id: string;
  lat: number;
  lng: number;
  altitude: number;
  isLanding: boolean;
}

interface RallyPointsEditorProps {
  theme: Theme;
  rallyPoints: RallyPoint[];
  onRallyPointsChange: (points: RallyPoint[]) => void;
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  homePosition: { lat: number; lng: number } | null;
}

export function RallyPointsEditor({
  theme,
  rallyPoints,
  onRallyPointsChange,
  selectedPointId,
  onSelectPoint,
  homePosition,
}: RallyPointsEditorProps) {
  const [isAdding, setIsAdding] = useState(false);

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
          error: '#ff4466',
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
          error: '#dc2626',
        };

  const handleAddPoint = () => {
    setIsAdding(true);
    // The actual point will be added when user clicks on map
  };

  const handleDeletePoint = (id: string) => {
    onRallyPointsChange(rallyPoints.filter((p) => p.id !== id));
    if (selectedPointId === id) {
      onSelectPoint(null);
    }
  };

  const handleUpdatePoint = (id: string, updates: Partial<RallyPoint>) => {
    onRallyPointsChange(
      rallyPoints.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleClearAll = () => {
    onRallyPointsChange([]);
    onSelectPoint(null);
  };

  const calculateDistance = (point: RallyPoint): string => {
    if (!homePosition) return '—';
    const R = 6371000; // Earth's radius in meters
    const dLat = ((point.lat - homePosition.lat) * Math.PI) / 180;
    const dLon = ((point.lng - homePosition.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((homePosition.lat * Math.PI) / 180) *
        Math.cos((point.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`;
  };

  const selectedPoint = rallyPoints.find((p) => p.id === selectedPointId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-3 border-b flex items-center justify-between"
        style={{ borderColor: colors.border }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🚩</span>
          <span className="font-medium" style={{ color: colors.textPrimary }}>
            Rally Points
          </span>
        </div>
        <span
          className="text-xs px-2 py-1 rounded"
          style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
        >
          {rallyPoints.length} points
        </span>
      </div>

      {/* Info Banner */}
      <div
        className="p-3 border-b text-xs"
        style={{ borderColor: colors.border, backgroundColor: colors.hover }}
      >
        <div className="flex items-start gap-2">
          <span>ℹ️</span>
          <span style={{ color: colors.text }}>
            Rally points are safe locations the vehicle can fly to in case of failsafe events or when commanded to return.
          </span>
        </div>
      </div>

      {/* Add Button */}
      <div className="p-3 border-b" style={{ borderColor: colors.border }}>
        <button
          onClick={handleAddPoint}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          style={{
            backgroundColor: isAdding ? colors.success + '20' : colors.accent + '20',
            color: isAdding ? colors.success : colors.accent,
            border: `1px solid ${isAdding ? colors.success : colors.accent}40`,
          }}
        >
          {isAdding ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Click on map to place point
            </>
          ) : (
            <>
              <span>+</span>
              Add Rally Point
            </>
          )}
        </button>
      </div>

      {/* Points List */}
      <div className="flex-1 overflow-y-auto p-2">
        {rallyPoints.length === 0 ? (
          <div className="text-center py-8" style={{ color: colors.text }}>
            <div className="text-3xl mb-2">🚩</div>
            <div className="text-sm">No rally points defined</div>
            <div className="text-xs mt-1">Add points for emergency landing locations</div>
          </div>
        ) : (
          <div className="space-y-2">
            {rallyPoints.map((point, index) => (
              <div
                key={point.id}
                onClick={() => onSelectPoint(point.id)}
                className="p-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: selectedPointId === point.id ? colors.accent + '20' : colors.hover,
                  border: `1px solid ${selectedPointId === point.id ? colors.accent : colors.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: colors.warning, color: '#000' }}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium" style={{ color: colors.textPrimary }}>
                      Rally {index + 1}
                    </span>
                    {point.isLanding && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: colors.success + '20', color: colors.success }}
                      >
                        Landing
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePoint(point.id);
                    }}
                    className="p-1 rounded hover:bg-red-500/20"
                    style={{ color: colors.error }}
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span style={{ color: colors.text }}>Position: </span>
                    <span style={{ color: colors.textPrimary }}>
                      {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: colors.text }}>Altitude: </span>
                    <span style={{ color: colors.textPrimary }}>{point.altitude}m</span>
                  </div>
                  <div>
                    <span style={{ color: colors.text }}>Distance: </span>
                    <span style={{ color: colors.textPrimary }}>{calculateDistance(point)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Point Editor */}
      {selectedPoint && (
        <div className="p-3 border-t space-y-3" style={{ borderColor: colors.border }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: colors.text }}>
            Edit Rally Point
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: colors.text }}>
              Altitude (m)
            </label>
            <input
              type="number"
              value={selectedPoint.altitude}
              onChange={(e) =>
                handleUpdatePoint(selectedPoint.id, { altitude: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: colors.bg,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm" style={{ color: colors.textPrimary }}>
                Landing Point
              </div>
              <div className="text-xs" style={{ color: colors.text }}>
                Vehicle can land here
              </div>
            </div>
            <button
              onClick={() => handleUpdatePoint(selectedPoint.id, { isLanding: !selectedPoint.isLanding })}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{
                backgroundColor: selectedPoint.isLanding ? colors.success : colors.border,
              }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{
                  transform: selectedPoint.isLanding ? 'translateX(20px)' : 'translateX(2px)',
                }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Clear All */}
      {rallyPoints.length > 0 && (
        <div className="p-3 border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={handleClearAll}
            className="w-full px-3 py-2 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: colors.error + '20',
              color: colors.error,
            }}
          >
            Clear All Rally Points
          </button>
        </div>
      )}
    </div>
  );
}
