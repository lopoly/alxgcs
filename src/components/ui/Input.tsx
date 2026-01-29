import { InputHTMLAttributes, forwardRef } from 'react';
import type { Theme } from '@/types';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: Theme;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  size = 'md',
  theme = 'dark',
  fullWidth = false,
  ...props
}, ref) => {
  const colors = theme === 'dark'
    ? {
        bg: '#0a0f14',
        border: '#1a2332',
        borderFocus: '#00d4ff',
        text: '#ffffff',
        label: '#8899aa',
        hint: '#667788',
        error: '#ff4466',
        placeholder: '#667788',
      }
    : {
        bg: '#ffffff',
        border: '#e2e8f0',
        borderFocus: '#0066cc',
        text: '#1e293b',
        label: '#64748b',
        hint: '#94a3b8',
        error: '#dc2626',
        placeholder: '#94a3b8',
      };

  const sizes = {
    sm: { px: '10px', py: '6px', fontSize: '12px' },
    md: { px: '12px', py: '8px', fontSize: '14px' },
    lg: { px: '16px', py: '12px', fontSize: '16px' },
  };

  const sizeStyles = sizes[size];

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '4px',
            color: colors.label,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        style={{
          width: '100%',
          padding: `${sizeStyles.py} ${sizeStyles.px}`,
          fontSize: sizeStyles.fontSize,
          backgroundColor: colors.bg,
          border: `1px solid ${error ? colors.error : colors.border}`,
          borderRadius: '6px',
          color: colors.text,
          outline: 'none',
          transition: 'border-color 150ms ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? colors.error : colors.borderFocus;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? colors.error : colors.border;
        }}
        {...props}
      />
      {(error || hint) && (
        <p
          style={{
            fontSize: '11px',
            marginTop: '4px',
            color: error ? colors.error : colors.hint,
          }}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
