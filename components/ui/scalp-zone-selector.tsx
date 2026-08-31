'use client';

import React from 'react';
import { PatternOption } from '@/types/schema';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export interface ScalpZoneSelectorProps {
  selectedPatterns: PatternOption[];
  onTogglePattern: (pattern: PatternOption) => void;
}

interface ScalpZone {
  id: PatternOption;
  label: string;
  sublabel: string;
  iconSvg: React.ReactNode;
}

const ZONES: ScalpZone[] = [
  {
    id: 'Receding hairline',
    label: 'Frontal Hairline & Temples',
    sublabel: 'M-shaped hairline or receding front corners',
    iconSvg: (
      <svg viewBox="0 0 100 70" className="w-full h-12" fill="none">
        <path d="M 15 55 C 15 20, 85 20, 85 55" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 25 45 C 35 25, 45 42, 50 42 C 55 42, 65 25, 75 45" stroke="#BA5D3F" strokeWidth="4" strokeLinecap="round" />
        <circle cx="28" cy="36" r="3.5" fill="#BA5D3F" />
        <circle cx="72" cy="36" r="3.5" fill="#BA5D3F" />
      </svg>
    ),
  },
  {
    id: 'Thinning at crown',
    label: 'Crown & Vertex',
    sublabel: 'Noticeable scalp showing at the top back circle',
    iconSvg: (
      <svg viewBox="0 0 100 70" className="w-full h-12" fill="none">
        <path d="M 15 55 C 15 20, 85 20, 85 55" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="50" cy="35" rx="14" ry="10" stroke="#BA5D3F" strokeWidth="3" strokeDasharray="3 3" />
        <circle cx="50" cy="35" r="5" fill="#BA5D3F" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'Widening part line',
    label: 'Center / Widening Part',
    sublabel: 'Part line is wider than before with visible scalp',
    iconSvg: (
      <svg viewBox="0 0 100 70" className="w-full h-12" fill="none">
        <path d="M 15 55 C 15 20, 85 20, 85 55" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="50" y1="20" x2="50" y2="52" stroke="#BA5D3F" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 44 26 L 40 32 M 56 26 L 60 32" stroke="#BA5D3F" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'Diffuse thinning',
    label: 'Overall Diffuse Loss',
    sublabel: 'Reduced overall volume across entire scalp',
    iconSvg: (
      <svg viewBox="0 0 100 70" className="w-full h-12" fill="none">
        <path d="M 15 55 C 15 20, 85 20, 85 55" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="35" cy="32" r="2.5" fill="#BA5D3F" />
        <circle cx="50" cy="28" r="2.5" fill="#BA5D3F" />
        <circle cx="65" cy="32" r="2.5" fill="#BA5D3F" />
        <circle cx="42" cy="42" r="2.5" fill="#BA5D3F" />
        <circle cx="58" cy="42" r="2.5" fill="#BA5D3F" />
      </svg>
    ),
  },
  {
    id: 'Patchy loss',
    label: 'Discrete Coin-Sized Patches',
    sublabel: 'Smooth circular bare spots (alopecia areata pattern)',
    iconSvg: (
      <svg viewBox="0 0 100 70" className="w-full h-12" fill="none">
        <path d="M 15 55 C 15 20, 85 20, 85 55" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="62" cy="38" r="9" stroke="#BA5D3F" strokeWidth="3" fill="#BA5D3F" fillOpacity="0.25" />
      </svg>
    ),
  },
  {
    id: 'Sudden excessive shedding',
    label: 'Sudden Telogen Shedding',
    sublabel: 'Hair falling in large clumps when brushing/washing',
    iconSvg: (
      <svg viewBox="0 0 100 70" className="w-full h-12" fill="none">
        <path d="M 15 55 C 15 20, 85 20, 85 55" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 40 45 C 38 52, 34 58, 30 62" stroke="#BA5D3F" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 50 48 C 50 56, 48 62, 46 66" stroke="#BA5D3F" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 60 45 C 62 52, 66 58, 70 62" stroke="#BA5D3F" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const ScalpZoneSelector: React.FC<ScalpZoneSelectorProps> = ({
  selectedPatterns,
  onTogglePattern,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-ink-muted flex items-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-green-primary" />
          <span>Interactive Scalp Map — Tap the regions where you see hair thinning</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {ZONES.map((zone) => {
          const isSelected = selectedPatterns.includes(zone.id);

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onTogglePattern(zone.id)}
              className={cn(
                'group flex flex-col items-center justify-between p-3.5 rounded-card border text-center transition-all duration-150 active:scale-[0.97] cursor-pointer min-h-[140px]',
                isSelected
                  ? 'bg-surface-tint-sage border-green-primary shadow-sm text-green-deep ring-1 ring-green-primary/30'
                  : 'bg-surface-card border-border-hairline text-ink-secondary hover:border-green-accent/60 hover:bg-surface-hover'
              )}
            >
              {/* Anatomical Mini Diagram */}
              <div
                className={cn(
                  'w-full flex items-center justify-center transition-transform group-hover:scale-105',
                  isSelected ? 'text-green-primary' : 'text-ink-muted'
                )}
              >
                {zone.iconSvg}
              </div>

              {/* Label */}
              <div className="flex flex-col gap-0.5 mt-1">
                <span className="text-[14px] font-bold leading-tight">
                  {zone.label}
                </span>
                <span className="text-[11px] text-ink-muted leading-tight line-clamp-2">
                  {zone.sublabel}
                </span>
              </div>

              {/* Selected Badge */}
              <div
                className={cn(
                  'mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all',
                  isSelected
                    ? 'bg-green-primary text-white'
                    : 'bg-transparent text-transparent group-hover:text-ink-muted/50'
                )}
              >
                {isSelected ? '✓ Selected' : '+ Select'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
