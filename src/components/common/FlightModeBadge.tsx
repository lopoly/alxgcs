import type { FlightMode } from '@/types';

interface FlightModeBadgeProps {
  mode: FlightMode;
  armed: boolean;
}

const modeColors: Record<string, { bg: string; text: string; border: string }> = {
  AUTO: { bg: '#00d4ff20', text: '#00d4ff', border: '#00d4ff' },
  LOITER: { bg: '#8855ff20', text: '#8855ff', border: '#8855ff' },
  RTL: { bg: '#ffaa0020', text: '#ffaa00', border: '#ffaa00' },
  MANUAL: { bg: '#ff446620', text: '#ff4466', border: '#ff4466' },
  GUIDED: { bg: '#00ff8820', text: '#00ff88', border: '#00ff88' },
  STABILIZE: { bg: '#00d4ff20', text: '#00d4ff', border: '#00d4ff' },
  LAND: { bg: '#ffaa0020', text: '#ffaa00', border: '#ffaa00' },
  TAKEOFF: { bg: '#00ff8820', text: '#00ff88', border: '#00ff88' },
};

export function FlightModeBadge({ mode, armed }: FlightModeBadgeProps) {
  const colors = modeColors[mode] || modeColors.AUTO;

  return (
    <div className="flex items-center gap-2">
      <div
        className="px-4 py-2 rounded-lg border font-bold tracking-wider"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderColor: colors.border,
          fontSize: '14px',
        }}
      >
        {mode}
      </div>
      <div
        className="px-3 py-2 rounded-lg font-bold tracking-wider animate-pulse"
        style={{
          backgroundColor: armed ? '#00ff8820' : '#ff446620',
          color: armed ? '#00ff88' : '#ff4466',
          borderWidth: '1px',
          borderColor: armed ? '#00ff88' : '#ff4466',
          fontSize: '12px',
        }}
      >
        {armed ? 'ARMED' : 'DISARMED'}
      </div>
    </div>
  );
}
