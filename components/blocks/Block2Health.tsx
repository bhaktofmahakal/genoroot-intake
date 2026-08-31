'use client';

import React from 'react';
import { Chip } from '@/components/ui/chip';
import { YesNoToggle } from '@/components/ui/yes-no-toggle';
import {
  SectionBData,
  DiagnosedConditionOption,
} from '@/types/schema';

export interface Block2HealthProps {
  data: SectionBData;
  onChange: (updated: SectionBData) => void;
  onNext: () => void;
}

const CONDITION_OPTIONS: DiagnosedConditionOption[] = [
  'PCOS/PCOD',
  'Thyroid disorder',
  'Diabetes',
  'Autoimmune disease',
  'Anemia',
  'None',
];

export const Block2Health: React.FC<Block2HealthProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const handleConditionToggle = (opt: DiagnosedConditionOption) => {
    let current = [...data.diagnosed_conditions];
    if (opt === 'None') {
      current = current.includes(opt) ? [] : ['None'];
    } else {
      current = current.filter((x) => x !== 'None');
      if (current.includes(opt)) {
        current = current.filter((x) => x !== opt);
      } else {
        current.push(opt);
      }
    }
    onChange({ ...data, diagnosed_conditions: current });
  };

  const handleAcneChange = (val: boolean) => {
    onChange({ ...data, adult_acne_oily_skin: val });
  };

  const handleExcessHairChange = (val: boolean) => {
    onChange({ ...data, excess_body_facial_hair: val });
  };

  const isValid = data.diagnosed_conditions.length > 0;

  return (
    <div className="flex flex-col gap-6 block-enter">
      {/* Section Title & Description */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] sm:text-[28px] font-bold text-green-deep leading-tight">
          Diagnosed Conditions & Symptoms
        </h1>
        <p className="text-[16px] text-ink-secondary leading-relaxed">
          Systemic health conditions and androgen sensitivities directly influence follicular health and shedding.
        </p>
      </div>

      {/* Q5: Diagnosed conditions */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[18px] font-semibold text-ink-primary">
          5. Have you been diagnosed with any of the following medical conditions?
        </span>
        <span className="text-[14px] text-ink-muted -mt-1">
          Select all that apply or &ldquo;None&rdquo;
        </span>
        <div className="flex flex-col gap-2.5">
          {CONDITION_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              label={opt}
              isMulti
              selected={data.diagnosed_conditions.includes(opt)}
              onClick={() => handleConditionToggle(opt)}
            />
          ))}
        </div>
      </div>

      {/* Q8: Adult acne / oily skin */}
      <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-2">
        <YesNoToggle
          label="8. Do you frequently experience adult acne or excessively oily scalp/skin?"
          sublabel="Indicates possible sebum or hormonal imbalance"
          value={data.adult_acne_oily_skin}
          onChange={handleAcneChange}
        />
      </div>

      {/* Q9: Excess body / facial hair */}
      <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-2">
        <YesNoToggle
          label="9. Have you noticed sudden or excess body/facial hair growth?"
          sublabel="Relevant for assessing androgenic activity"
          value={data.excess_body_facial_hair}
          onChange={handleExcessHairChange}
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-6 pb-12 border-t border-border-hairline mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className={`w-full min-h-[54px] rounded-card font-semibold text-[18px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.985] ${
            isValid
              ? 'bg-green-primary hover:bg-green-deep text-white cursor-pointer'
              : 'bg-border-hairline text-ink-muted cursor-not-allowed opacity-70'
          }`}
        >
          <span>Continue to Lifestyle &amp; Triggers (Step 3 of 6)</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
