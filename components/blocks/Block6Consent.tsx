'use client';

import React from 'react';
import { Chip } from '@/components/ui/chip';
import { YesNoToggle } from '@/components/ui/yes-no-toggle';
import { ShieldCheck, Check } from 'lucide-react';
import {
  SectionDData,
  SectionEData,
  SampleTypeOption,
} from '@/types/schema';

export interface Block6ConsentProps {
  dataD: SectionDData;
  dataE: SectionEData;
  onChangeD: (updated: SectionDData) => void;
  onChangeE: (updated: SectionEData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const SAMPLE_OPTIONS: SampleTypeOption[] = ['Saliva', 'Blood', 'Either'];

export const Block6Consent: React.FC<Block6ConsentProps> = ({
  dataD,
  dataE,
  onChangeD,
  onChangeE,
  onSubmit,
  isSubmitting = false,
}) => {
  const handleSideEffectsToggle = (val: boolean) => {
    onChangeD({
      ...dataD,
      past_treatment_side_effects: val,
      past_treatment_side_effects_describe: val ? dataD.past_treatment_side_effects_describe || '' : '',
    });
  };

  const handleSampleTypeSelect = (type: SampleTypeOption) => {
    onChangeE({ ...dataE, sample_type: type });
  };

  const handleConsentToggle = () => {
    onChangeE({ ...dataE, consent: !dataE.consent as any });
  };

  const canSubmit = dataE.consent === true;

  return (
    <div className="flex flex-col gap-6 block-enter">
      {/* Section Title & Description */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] sm:text-[28px] font-bold text-green-deep leading-tight">
          Side Effects &amp; Clinical Consent
        </h1>
        <p className="text-[16px] text-ink-secondary leading-relaxed">
          Final step. Review past treatment reactions, choose your genomic sampling preference, and authorize evaluation.
        </p>
      </div>

      {/* Q14: Past side effects */}
      <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-3">
        <YesNoToggle
          label="14. Have you experienced adverse side effects from any past hair treatments?"
          sublabel="e.g. Scalp dermatitis, heart palpitations from minoxidil, or shedding spikes"
          value={dataD.past_treatment_side_effects}
          onChange={handleSideEffectsToggle}
        />

        <div className={`accordion-content ${dataD.past_treatment_side_effects ? 'expanded' : ''}`}>
          <div className="accordion-inner pt-3 flex flex-col gap-1.5">
            <label htmlFor="side_effects_desc" className="text-[14px] font-medium text-ink-secondary">
              Please describe the reaction and which product/treatment caused it:
            </label>
            <textarea
              id="side_effects_desc"
              rows={3}
              placeholder="e.g., Severe itching and redness with 5% topical solution"
              value={dataD.past_treatment_side_effects_describe || ''}
              onChange={(e) =>
                onChangeD({ ...dataD, past_treatment_side_effects_describe: e.target.value })
              }
              className="w-full p-3 rounded-lg border border-border-hairline bg-canvas text-[16px] text-ink-primary focus:border-green-primary outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Q15: Sample type */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[18px] font-semibold text-ink-primary">
          15. Genomic Sample Collection Preference
        </span>
        <span className="text-[14px] text-ink-muted -mt-1">
          GenoRoot customizes therapies using genetic biomarker testing. Which collection method do you prefer?
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_OPTIONS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => handleSampleTypeSelect(sample)}
              className={`min-h-[52px] px-4 rounded-card font-medium text-[17px] border transition-all active:scale-[0.98] ${
                dataE.sample_type === sample
                  ? 'bg-surface-tint-sage border-green-primary text-green-deep font-semibold shadow-sm'
                  : 'bg-surface-card border-border-hairline text-ink-secondary hover:bg-surface-hover'
              }`}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Q16: Legal & Clinical Consent Check */}
      <div className="bg-surface-tint-sage/70 border border-green-primary/30 p-5 rounded-card flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-green-primary flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[17px] font-bold text-green-deep">
              16. Clinical &amp; Genetic Analysis Consent
            </span>
            <p className="text-[14px] text-ink-secondary leading-relaxed">
              I consent to the collection of my clinical history and biological sample for the sole purpose of analyzing genetic biomarkers and generating personalized hair &amp; scalp treatment protocols. All data remains confidential.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConsentToggle}
          className={`flex items-center gap-3 w-full p-3.5 rounded-lg border transition-all text-left ${
            dataE.consent
              ? 'bg-white border-green-primary shadow-sm'
              : 'bg-white/60 border-border-hairline hover:border-green-primary'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
              dataE.consent
                ? 'bg-green-primary text-white'
                : 'border-2 border-border-hairline bg-white'
            }`}
          >
            {dataE.consent && <Check className="w-4 h-4 stroke-[3]" />}
          </div>
          <span className="text-[16px] font-semibold text-ink-primary select-none">
            I confirm and authorize my clinical intake
          </span>
        </button>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-30 bg-canvas/95 backdrop-blur-md pt-3 pb-6 border-t border-border-hairline/60 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`w-full min-h-[56px] rounded-card font-bold text-[18px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.985] ${
            canSubmit && !isSubmitting
              ? 'bg-green-primary hover:bg-green-deep text-white cursor-pointer'
              : 'bg-border-hairline text-ink-muted cursor-not-allowed opacity-70'
          }`}
        >
          <span>{isSubmitting ? 'Finalizing Evaluation...' : 'Complete Intake & View Final JSON'}</span>
          <span>✓</span>
        </button>
      </div>
    </div>
  );
};
