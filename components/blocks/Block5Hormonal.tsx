'use client';

import React from 'react';
import { Chip } from '@/components/ui/chip';
import {
  SectionBData,
  MenstrualCycleOption,
  PregnancyRelatedOption,
} from '@/types/schema';

export interface Block5HormonalProps {
  data: SectionBData;
  onChange: (updated: SectionBData) => void;
  onNext: () => void;
}

interface MergedHormonalOption {
  id: string;
  label: string;
  sublabel: string;
  menstrual: MenstrualCycleOption;
  pregnancy: PregnancyRelatedOption;
}

const MERGED_OPTIONS: MergedHormonalOption[] = [
  {
    id: 'regular',
    label: 'Regular Menstrual Cycles',
    sublabel: 'Predictable monthly cycles with normal flow',
    menstrual: 'Regular',
    pregnancy: 'Not applicable',
  },
  {
    id: 'irregular',
    label: 'Irregular Menstrual Cycles',
    sublabel: 'Missed periods, unpredictable spacing, or severe flow variation',
    menstrual: 'Irregular',
    pregnancy: 'Not applicable',
  },
  {
    id: 'menopausal',
    label: 'Menopausal / Post-Menopausal',
    sublabel: 'Perimenopause, active menopause, or complete cessation of cycles',
    menstrual: 'Menopausal',
    pregnancy: 'Not applicable',
  },
  {
    id: 'pregnant',
    label: 'Currently Pregnant',
    sublabel: 'Active pregnancy trimesters (significant estrogen/progesterone surge)',
    menstrual: 'Irregular',
    pregnancy: 'Currently pregnant',
  },
  {
    id: 'postpartum',
    label: 'Postpartum (< 1 year)',
    sublabel: 'Delivered within the past 12 months (frequent acute telogen shedding)',
    menstrual: 'Irregular',
    pregnancy: 'Postpartum <1 year',
  },
  {
    id: 'not_applicable',
    label: 'Not Applicable',
    sublabel: 'Male patient or not applicable to your biological health profile',
    menstrual: 'Not applicable',
    pregnancy: 'Not applicable',
  },
];

export const Block5Hormonal: React.FC<Block5HormonalProps> = ({
  data,
  onChange,
  onNext,
}) => {
  // Determine selected option ID
  const selectedOption = MERGED_OPTIONS.find(
    (opt) =>
      opt.menstrual === data.menstrual_cycle &&
      opt.pregnancy === data.pregnancy_related
  ) || MERGED_OPTIONS[MERGED_OPTIONS.length - 1]; // default to not_applicable

  const handleSelect = (opt: MergedHormonalOption) => {
    onChange({
      ...data,
      menstrual_cycle: opt.menstrual,
      pregnancy_related: opt.pregnancy,
    });
  };

  return (
    <div className="flex flex-col gap-6 block-enter">
      {/* Section Title & Description */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] sm:text-[28px] font-bold text-green-deep leading-tight">
          Hormonal & Reproductive Context
        </h1>
        <p className="text-[16px] text-ink-secondary leading-relaxed">
          Estrogen, progesterone, and androgen shifts are primary drivers of follicle cycling. Please select the option that best reflects your current status.
        </p>
      </div>

      {/* Unified Clinical Options */}
      <div className="flex flex-col gap-3">
        <span className="text-[18px] font-semibold text-ink-primary">
          6 &amp; 7. Which of the following describes your hormonal context?
        </span>

        <div className="flex flex-col gap-3">
          {MERGED_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              sublabel={opt.sublabel}
              selected={selectedOption.id === opt.id}
              onClick={() => handleSelect(opt)}
            />
          ))}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-30 bg-canvas/95 backdrop-blur-md pt-3 pb-6 border-t border-border-hairline/60 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={onNext}
          className="w-full min-h-[54px] rounded-card font-semibold text-[18px] flex items-center justify-center gap-2 bg-green-primary hover:bg-green-deep text-white transition-all shadow-md active:scale-[0.985] cursor-pointer"
        >
          <span>Continue to Final Review &amp; Consent</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
