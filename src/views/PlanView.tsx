import type { Theme } from '@/types';

interface PlanViewProps {
  theme: Theme;
}

export function PlanView({ theme }: PlanViewProps) {
  const colors =
    theme === 'dark'
      ? { bg: '#030508', text: '#8899aa', textPrimary: '#ffffff', border: '#1a2332' }
      : { bg: '#f0f4f8', text: '#64748b', textPrimary: '#1e293b', border: '#e2e8f0' };

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="text-center">
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
        <h2 style={{ color: colors.textPrimary, fontSize: '24px', fontWeight: '600' }}>
          Mission Planning
        </h2>
        <p style={{ color: colors.text, marginTop: '8px' }}>
          Create and edit mission waypoints, survey patterns, and geofences
        </p>
        <div
          className="mt-6 px-6 py-3 rounded-lg border inline-block"
          style={{ borderColor: colors.border, color: colors.text }}
        >
          Coming in Phase 3
        </div>
      </div>
    </div>
  );
}
