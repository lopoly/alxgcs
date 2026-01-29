import { ReactNode, ButtonHTMLAttributes } from 'react';
import type { Theme } from '@/types';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  theme?: Theme;
  children?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  theme = 'dark',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const colors = theme === 'dark'
    ? {
        primary: { bg: '#00d4ff', text: '#000000', hover: '#00b8e0' },
        secondary: { bg: '#1a2332', text: '#ffffff', hover: '#2a3444' },
        ghost: { bg: 'transparent', text: '#8899aa', hover: '#1a2332' },
        danger: { bg: '#ff4466', text: '#ffffff', hover: '#e63950' },
      }
    : {
        primary: { bg: '#0066cc', text: '#ffffff', hover: '#0052a3' },
        secondary: { bg: '#e2e8f0', text: '#1e293b', hover: '#cbd5e1' },
        ghost: { bg: 'transparent', text: '#64748b', hover: '#f1f5f9' },
        danger: { bg: '#dc2626', text: '#ffffff', hover: '#b91c1c' },
      };

  const sizes = {
    sm: { px: '12px', py: '6px', fontSize: '12px', gap: '4px' },
    md: { px: '16px', py: '8px', fontSize: '14px', gap: '6px' },
    lg: { px: '24px', py: '12px', fontSize: '16px', gap: '8px' },
  };

  const variantColors = colors[variant];
  const sizeStyles = sizes[size];

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizeStyles.gap,
        padding: `${sizeStyles.py} ${sizeStyles.px}`,
        fontSize: sizeStyles.fontSize,
        fontWeight: 500,
        borderRadius: '8px',
        border: variant === 'ghost' ? `1px solid ${theme === 'dark' ? '#1a2332' : '#e2e8f0'}` : 'none',
        backgroundColor: variantColors.bg,
        color: variantColors.text,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 150ms ease',
        width: fullWidth ? '100%' : 'auto',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = variantColors.hover;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = variantColors.bg;
      }}
      {...props}
    >
      {loading ? (
        <span className="animate-spin">⟳</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span>{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span>{icon}</span>}
        </>
      )}
    </button>
  );
}
