'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChipProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
  isMulti?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  sublabel,
  selected,
  onClick,
  isMulti = false,
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role={isMulti ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={cn(
        'group relative flex w-full items-center justify-between min-h-[54px] px-5 py-3.5 rounded-card text-left transition-all duration-150',
        'border active:scale-[0.985] cursor-pointer select-none',
        selected
          ? 'bg-surface-tint-sage border-green-primary shadow-sm'
          : 'bg-surface-card border-border-hairline hover:border-green-accent/60 hover:bg-surface-hover',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex flex-col pr-3">
        <span
          className={cn(
            'text-[17px] sm:text-[18px] leading-snug font-medium transition-colors',
            selected ? 'text-green-deep font-semibold' : 'text-ink-primary'
          )}
        >
          {label}
        </span>
        {sublabel && (
          <span className="text-[14px] text-ink-muted mt-0.5 leading-tight">
            {sublabel}
          </span>
        )}
      </div>

      <div
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150',
          selected
            ? 'bg-green-primary text-white scale-100 shadow-sm'
            : 'border-2 border-border-hairline group-hover:border-green-accent/60 bg-white'
        )}
      >
        {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>
    </button>
  );
};
