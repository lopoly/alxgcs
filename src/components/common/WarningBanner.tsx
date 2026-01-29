import type { Theme } from '@/types';

interface WarningBannerProps {
  title: string;
  message: string;
  theme: Theme;
}

export function WarningBanner({ title, message, theme }: WarningBannerProps) {
  return (
    <div
      className="p-3 rounded-lg border flex items-center gap-2"
      style={{
        backgroundColor: theme === 'dark' ? '#ffaa0010' : '#fef3c7',
        borderColor: '#ffaa00',
      }}
    >
      <span style={{ fontSize: '16px' }}>⚠️</span>
      <div>
        <div style={{ color: '#ffaa00', fontSize: '11px', fontWeight: '600' }}>{title}</div>
        <div
          style={{
            fontSize: '10px',
            color: theme === 'dark' ? '#8899aa' : '#64748b',
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
