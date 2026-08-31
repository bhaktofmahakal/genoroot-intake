'use client';

import React from 'react';
import { Sparkles, Edit3, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmationCardProps {
  title?: string;
  transcript?: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  title = 'Extracted from your voice',
  transcript,
  isEditing,
  onToggleEdit,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full bg-surface-card border rounded-card p-5 shadow-card transition-all flex flex-col gap-4',
        isEditing ? 'border-green-primary ring-1 ring-green-primary/30' : 'border-green-primary/40',
        className
      )}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-2 border-b border-border-hairline pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-surface-tint-sage flex items-center justify-center text-green-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[16px] font-semibold text-green-deep flex items-center gap-1.5">
              <span>{title}</span>
              <CheckCircle2 className="w-4 h-4 text-green-accent inline" />
            </div>
            <div className="text-[13px] text-ink-muted">
              {isEditing ? 'Make any adjustments directly below' : 'Review your clinical answers'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-hairline hover:border-green-primary text-[14px] font-medium text-ink-secondary hover:text-green-deep hover:bg-surface-hover transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Done Editing' : 'Edit'}</span>
        </button>
      </div>

      {/* Raw Speech Transcript Collapsible */}
      {transcript && (
        <div className="bg-canvas p-3 rounded-lg border border-border-subtle text-[14px] text-ink-secondary italic">
          <span className="font-medium not-italic text-ink-muted text-[12px] uppercase block mb-1">
            What we heard:
          </span>
          &ldquo;{transcript}&rdquo;
        </div>
      )}

      {/* Structured Content Fields */}
      <div className="flex flex-col gap-3.5 pt-1">{children}</div>
    </div>
  );
};
