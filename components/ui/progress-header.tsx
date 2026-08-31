'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressHeaderProps {
  currentStep: number; // 1 to 6
  totalSteps?: number;
  stepTitle: string;
  questionRange?: string; // e.g. "Q1–Q4 of 16"
  estimatedTime?: string;
  onBack?: () => void;
  canGoBack?: boolean;
}

const QUESTION_PROGRESS_MAP: Record<number, { range: string; percent: number }> = {
  1: { range: 'Questions 1–4 of 16', percent: 25 },
  2: { range: 'Questions 5, 8, 9 of 16', percent: 44 },
  3: { range: 'Questions 10–11 of 16', percent: 56 },
  4: { range: 'Questions 12–13 of 16', percent: 69 },
  5: { range: 'Questions 6–7 of 16', percent: 81 },
  6: { range: 'Questions 14–16 of 16', percent: 100 },
};

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentStep,
  totalSteps = 6,
  stepTitle,
  questionRange,
  estimatedTime = '~1 min',
  onBack,
  canGoBack = false,
}) => {
  const currentInfo = QUESTION_PROGRESS_MAP[currentStep] || {
    range: `Section ${currentStep} of ${totalSteps}`,
    percent: Math.min(100, Math.round((currentStep / totalSteps) * 100)),
  };

  const displayRange = questionRange || currentInfo.range;
  const percentage = currentInfo.percent;

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-border-hairline/80 transition-all">
      <div className="max-w-xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col gap-2">
        {/* Navigation & Header Info */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 -ml-2 rounded-lg text-[15px] font-semibold transition-colors',
              canGoBack
                ? 'text-ink-secondary hover:text-green-deep hover:bg-surface-hover active:scale-95'
                : 'text-ink-muted/40 cursor-not-allowed opacity-0 pointer-events-none'
            )}
            aria-label="Go back to previous question"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[12px] sm:text-[13px] font-bold tracking-wider text-green-primary uppercase">
              GenoRoot Intake
            </span>
          </div>

          <div className="text-right">
            <span className="text-[12px] sm:text-[13px] font-semibold text-green-deep bg-surface-tint-sage px-2.5 py-0.5 rounded-full border border-green-primary/30">
              {displayRange}
            </span>
          </div>
        </div>

        {/* Step Title & Anxiety-Reducing Microcopy */}
        <div className="flex items-center justify-between text-[14px]">
          <span className="font-semibold text-ink-primary truncate max-w-[70%] text-[15px] sm:text-[16px]">
            {stepTitle}
          </span>
          <span className="text-ink-muted text-[13px] flex-shrink-0">
            {estimatedTime}
          </span>
        </div>

        {/* 6px Botanical Sage Progress Bar */}
        <div className="w-full bg-border-hairline/70 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-green-primary h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(45,90,39,0.35)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </header>
  );
};
