import { ReactNode } from 'react';
import type { Theme } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  outline?: boolean;
  pulse?: boolean;
  theme?: Theme;
  children: ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  icon,
  outline = false,
  pulse = false,
  theme = 'dark',
  children,
}: BadgeProps) {
  const colors = theme === 'dark'
    ? {
        default: { bg: '#1a2332', text: '#8899aa', border: '#2a3444' },
        success: { bg: 'rgba(0, 255, 136, 0.15)', text: '#00ff88', border: '#00ff88' },
        warning: { bg: 'rgba(255, 170, 0, 0.15)', text: '#ffaa00', border: '#ffaa00' },
        error: { bg: 'rgba(255, 68, 102, 0.15)', text: '#ff4466', border: '#ff4466' },
        info: { bg: 'rgba(0, 212, 255, 0.15)', text: '#00d4ff', border: '#00d4ff' },
      }
    : {
        default: { bg: '#e2e8f0', text: '#64748b', border: '#cbd5e1' },
        success: { bg: 'rgba(22, 163, 74, 0.15)', text: '#16a34a', border: '#16a34a' },
        warning: { bg: 'rgba(217, 119, 6, 0.15)', text: '#d97706', border: '#d97706' },
        error: { bg: 'rgba(220, 38, 38, 0.15)', text: '#dc2626', border: '#dc2626' },
        info: { bg: 'rgba(0, 102, 204, 0.15)', text: '#0066cc', border: '#0066cc' },
      };

  const sizes = {
    sm: { px: '6px', py: '2px', fontSize: '10px' },
    md: { px: '8px', py: '4px', fontSize: '12px' },
    lg: { px: '12px', py: '6px', fontSize: '14px' },
  };

  const variantColors = colors[variant];
  const sizeStyles = sizes[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: `${sizeStyles.py} ${sizeStyles.px}`,
        fontSize: sizeStyles.fontSize,
        fontWeight: 600,
        borderRadius: '6px',
        backgroundColor: outline ? 'transparent' : variantColors.bg,
        color: variantColors.text,
        border: `1px solid ${variantColors.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {pulse && (
        <span
          className="animate-pulse"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: variantColors.text,
          }}
        />
      )}
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}
