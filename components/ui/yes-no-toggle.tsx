'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface YesNoToggleProps {
  value: boolean | null;
  onChange: (val: boolean) => void;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const YesNoToggle: React.FC<YesNoToggleProps> = ({
  value,
  onChange,
  label,
  sublabel,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <div className="flex flex-col">
          <span className="text-[17px] sm:text-[18px] font-semibold text-ink-primary">
            {label}
          </span>
          {sublabel && (
            <span className="text-[14px] text-ink-muted mt-0.5">{sublabel}</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'flex items-center justify-center min-h-[52px] px-4 rounded-card font-medium text-[17px] border transition-all duration-150 select-none active:scale-[0.98]',
            value === true
              ? 'bg-surface-tint-sage border-green-primary text-green-deep font-semibold shadow-sm'
              : 'bg-surface-card border-border-hairline text-ink-secondary hover:border-green-accent/60 hover:bg-surface-hover'
          )}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'flex items-center justify-center min-h-[52px] px-4 rounded-card font-medium text-[17px] border transition-all duration-150 select-none active:scale-[0.98]',
            value === false
              ? 'bg-surface-tint-sage border-green-primary text-green-deep font-semibold shadow-sm'
              : 'bg-surface-card border-border-hairline text-ink-secondary hover:border-green-accent/60 hover:bg-surface-hover'
          )}
        >
          No
        </button>
      </div>
    </div>
  );
};
