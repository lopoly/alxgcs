import { SelectHTMLAttributes, forwardRef } from 'react';
import type { Theme } from '@/types';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'size'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: Theme;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
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
      }
    : {
        bg: '#ffffff',
        border: '#e2e8f0',
        borderFocus: '#0066cc',
        text: '#1e293b',
        label: '#64748b',
        hint: '#94a3b8',
        error: '#dc2626',
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
      <select
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
          cursor: 'pointer',
          transition: 'border-color 150ms ease',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(colors.label)}' d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          paddingRight: '32px',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? colors.error : colors.borderFocus;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? colors.error : colors.border;
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
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

Select.displayName = 'Select';
