import { useState } from 'react';
import type { Theme } from '@/types';

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

interface SurveyPatternEditorProps {
  theme: Theme;
  pattern: SurveyPattern | null;
  onPatternChange: (pattern: SurveyPattern | null) => void;
  onStartDrawing: () => void;
  isDrawing: boolean;
}

export function SurveyPatternEditor({
  theme,
  pattern,
  onPatternChange,
  onStartDrawing,
  isDrawing,
}: SurveyPatternEditorProps) {
  const [previewStats, setPreviewStats] = useState({
    distance: 0,
    time: 0,
    lines: 0,
    photos: 0,
  });

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

  const surveyTypes: { id: SurveyPattern['type']; label: string; icon: string; desc: string }[] = [
    { id: 'grid', label: 'Grid', icon: '⊞', desc: 'Parallel lines for area mapping' },
    { id: 'corridor', label: 'Corridor', icon: '⟂', desc: 'Follow a path with offset lines' },
    { id: 'spiral', label: 'Spiral', icon: '🌀', desc: 'Spiral inward pattern' },
  ];

  const cameraTypes: { id: SurveyPattern['cameraType']; label: string; icon: string }[] = [
    { id: 'mapping', label: 'Nadir Mapping', icon: '📷' },
    { id: 'oblique', label: 'Oblique', icon: '📸' },
    { id: 'video', label: 'Video', icon: '🎥' },
  ];

  const handleUpdatePattern = (updates: Partial<SurveyPattern>) => {
    if (!pattern) return;
    const updated = { ...pattern, ...updates };
    onPatternChange(updated);

    // Recalculate preview stats based on pattern
    const area = calculatePolygonArea(updated.polygon);
    const lines = Math.ceil(Math.sqrt(area) / updated.gridSpacing);
    const distance = lines * Math.sqrt(area) + lines * updated.turnaroundDistance;
    const time = distance / (updated.speed * 0.277778); // Convert km/h to m/s
    const photos = Math.floor(distance / (updated.gridSpacing * (1 - updated.overlap / 100)));

    setPreviewStats({
      distance: Math.round(distance / 1000 * 10) / 10,
      time: Math.round(time / 60),
      lines,
      photos,
    });
  };

  const calculatePolygonArea = (points: [number, number][]): number => {
    if (points.length < 3) return 0;
    // Simple approximation using latitude/longitude as meters (not accurate but good for UI)
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i][1] * points[j][0];
      area -= points[j][1] * points[i][0];
    }
    return Math.abs(area / 2) * 111000 * 111000; // Very rough m² estimate
  };

  const handleCreateNewPattern = (type: SurveyPattern['type']) => {
    const newPattern: SurveyPattern = {
      id: `survey-${Date.now()}`,
      type,
      polygon: [],
      altitude: 100,
      speed: 40,
      gridSpacing: 50,
      gridAngle: 0,
      overlap: 70,
      sidelap: 60,
      terrainFollow: false,
      cameraType: 'mapping',
      turnaroundDistance: 30,
    };
    onPatternChange(newPattern);
    onStartDrawing();
  };

  const handleClearPattern = () => {
    onPatternChange(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-3 border-b flex items-center gap-2"
        style={{ borderColor: colors.border }}
      >
        <span className="text-lg">📐</span>
        <span className="font-medium" style={{ color: colors.textPrimary }}>
          Survey Pattern
        </span>
      </div>

      {!pattern ? (
        /* Pattern Type Selection */
        <div className="flex-1 p-3">
          <label className="text-xs uppercase tracking-wider block mb-3" style={{ color: colors.text }}>
            Choose Pattern Type
          </label>
          <div className="space-y-2">
            {surveyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleCreateNewPattern(type.id)}
                className="w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3"
                style={{
                  backgroundColor: colors.hover,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <div className="font-medium" style={{ color: colors.textPrimary }}>
                    {type.label}
                  </div>
                  <div className="text-xs" style={{ color: colors.text }}>
                    {type.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Pattern Editor */
        <div className="flex-1 overflow-y-auto">
          {/* Drawing Status */}
          {isDrawing && (
            <div
              className="p-3 border-b flex items-center gap-2"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.accent + '10',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs" style={{ color: colors.textPrimary }}>
                Click on map to draw survey area
              </span>
            </div>
          )}

          {/* Pattern Type Indicator */}
          <div className="p-3 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {surveyTypes.find((t) => t.id === pattern.type)?.icon}
              </span>
              <span className="font-medium capitalize" style={{ color: colors.textPrimary }}>
                {pattern.type} Survey
              </span>
              <span
                className="ml-auto text-xs px-2 py-1 rounded"
                style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
              >
                {pattern.polygon.length} points
              </span>
            </div>
          </div>

          {/* Flight Parameters */}
          <div className="p-3 border-b space-y-3" style={{ borderColor: colors.border }}>
            <label className="text-xs uppercase tracking-wider block" style={{ color: colors.text }}>
              Flight Parameters
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: colors.text }}>
                  Altitude (m)
                </label>
                <input
                  type="number"
                  value={pattern.altitude}
                  onChange={(e) => handleUpdatePattern({ altitude: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.hover,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: colors.text }}>
                  Speed (km/h)
                </label>
                <input
                  type="number"
                  value={pattern.speed}
                  onChange={(e) => handleUpdatePattern({ speed: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.hover,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
            </div>

            {/* Terrain Following */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm" style={{ color: colors.textPrimary }}>
                  Terrain Following
                </div>
                <div className="text-xs" style={{ color: colors.text }}>
                  Maintain altitude AGL
                </div>
              </div>
              <button
                onClick={() => handleUpdatePattern({ terrainFollow: !pattern.terrainFollow })}
                className="relative w-10 h-5 rounded-full transition-colors"
                style={{
                  backgroundColor: pattern.terrainFollow ? colors.success : colors.border,
                }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{
                    transform: pattern.terrainFollow ? 'translateX(20px)' : 'translateX(2px)',
                  }}
                />
              </button>
            </div>
          </div>

          {/* Grid Parameters */}
          <div className="p-3 border-b space-y-3" style={{ borderColor: colors.border }}>
            <label className="text-xs uppercase tracking-wider block" style={{ color: colors.text }}>
              Grid Parameters
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: colors.text }}>
                  Line Spacing (m)
                </label>
                <input
                  type="number"
                  value={pattern.gridSpacing}
                  onChange={(e) => handleUpdatePattern({ gridSpacing: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.hover,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: colors.text }}>
                  Grid Angle (°)
                </label>
                <input
                  type="number"
                  value={pattern.gridAngle}
                  onChange={(e) => handleUpdatePattern({ gridAngle: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.hover,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                  }}
                  min={0}
                  max={360}
                />
              </div>
            </div>

            {/* Overlap Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: colors.text }}>
                  Overlap (%)
                </label>
                <input
                  type="number"
                  value={pattern.overlap}
                  onChange={(e) => handleUpdatePattern({ overlap: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.hover,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                  }}
                  min={0}
                  max={95}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: colors.text }}>
                  Sidelap (%)
                </label>
                <input
                  type="number"
                  value={pattern.sidelap}
                  onChange={(e) => handleUpdatePattern({ sidelap: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.hover,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                  }}
                  min={0}
                  max={95}
                />
              </div>
            </div>

            {/* Turnaround */}
            <div>
              <label className="text-xs block mb-1" style={{ color: colors.text }}>
                Turnaround Distance (m)
              </label>
              <input
                type="number"
                value={pattern.turnaroundDistance}
                onChange={(e) => handleUpdatePattern({ turnaroundDistance: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: colors.hover,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                }}
              />
            </div>
          </div>

          {/* Camera Type */}
          <div className="p-3 border-b" style={{ borderColor: colors.border }}>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: colors.text }}>
              Camera Mode
            </label>
            <div className="flex gap-2">
              {cameraTypes.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => handleUpdatePattern({ cameraType: cam.id })}
                  className="flex-1 px-2 py-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1"
                  style={{
                    backgroundColor: pattern.cameraType === cam.id ? colors.accent + '20' : 'transparent',
                    color: pattern.cameraType === cam.id ? colors.accent : colors.text,
                    border: `1px solid ${pattern.cameraType === cam.id ? colors.accent : colors.border}`,
                  }}
                >
                  <span className="text-lg">{cam.icon}</span>
                  <span>{cam.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Stats */}
          {pattern.polygon.length >= 3 && (
            <div className="p-3 border-b" style={{ borderColor: colors.border }}>
              <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: colors.text }}>
                Estimated Statistics
              </label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.hover }}>
                  <div className="text-xs" style={{ color: colors.text }}>Distance</div>
                  <div className="font-medium" style={{ color: colors.textPrimary }}>
                    {previewStats.distance} km
                  </div>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.hover }}>
                  <div className="text-xs" style={{ color: colors.text }}>Flight Time</div>
                  <div className="font-medium" style={{ color: colors.textPrimary }}>
                    {previewStats.time} min
                  </div>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.hover }}>
                  <div className="text-xs" style={{ color: colors.text }}>Grid Lines</div>
                  <div className="font-medium" style={{ color: colors.textPrimary }}>
                    {previewStats.lines}
                  </div>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.hover }}>
                  <div className="text-xs" style={{ color: colors.text }}>Est. Photos</div>
                  <div className="font-medium" style={{ color: colors.textPrimary }}>
                    {previewStats.photos}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {pattern && (
        <div className="p-3 border-t space-y-2" style={{ borderColor: colors.border }}>
          <button
            className="w-full px-4 py-2 rounded-lg font-medium text-sm"
            style={{ backgroundColor: colors.accent, color: '#000' }}
          >
            Generate Waypoints
          </button>
          <button
            onClick={handleClearPattern}
            className="w-full px-4 py-2 rounded-lg font-medium text-sm"
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
            }}
          >
            Clear Survey
          </button>
        </div>
      )}
    </div>
  );
}
