'use client';

import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import {
  SectionEData,
  SampleTypeOption,
} from '@/types/schema';

export interface Block6ConsentProps {
  dataE: SectionEData;
  onChangeE: (updated: SectionEData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const SAMPLE_OPTIONS: SampleTypeOption[] = ['Saliva', 'Blood', 'Either'];

export const Block6Consent: React.FC<Block6ConsentProps> = ({
  dataE,
  onChangeE,
  onSubmit,
  isSubmitting = false,
}) => {
  const handleSampleTypeSelect = (type: SampleTypeOption) => {
    onChangeE({ ...dataE, sample_type: type });
  };

  const handleConsentToggle = () => {
    onChangeE({ ...dataE, consent: !dataE.consent as any });
  };

  const canSubmit = dataE.consent === true && Boolean(dataE.sample_type);

  return (
    <div className="flex flex-col gap-6 block-enter">
      {/* Section Title & Description */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] sm:text-[28px] font-bold text-green-deep leading-tight">
          Sample Collection &amp; Clinical Consent
        </h1>
        <p className="text-[16px] text-ink-secondary leading-relaxed">
          Final step. Choose your genetic sampling preference and authorize our medical team to evaluate your follicle genomics.
        </p>
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
              className={`min-h-[54px] p-4 rounded-card border text-left flex flex-col justify-center transition-all ${
                dataE.sample_type === sample
                  ? 'bg-surface-tint-sage border-green-primary shadow-xs'
                  : 'bg-surface-card border-border-hairline hover:border-green-primary/50'
              }`}
            >
              <span className={`text-[16px] font-semibold ${
                dataE.sample_type === sample ? 'text-green-deep' : 'text-ink-primary'
              }`}>
                {sample}
              </span>
              <span className="text-[12px] text-ink-muted mt-0.5">
                {sample === 'Saliva'
                  ? 'Non-invasive swab'
                  : sample === 'Blood'
                  ? 'Clinical phlebotomy'
                  : 'Clinic discretion'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Q16: Clinical Consent & Authorization */}
      <div className="flex flex-col gap-2.5 pt-2">
        <span className="text-[18px] font-semibold text-ink-primary">
          16. Informed Medical Consent
        </span>
        <div
          onClick={handleConsentToggle}
          className={`p-5 rounded-card border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
            dataE.consent
              ? 'bg-surface-tint-sage border-green-primary shadow-sm'
              : 'bg-surface-card border-border-hairline hover:border-green-primary/50'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all ${
              dataE.consent
                ? 'bg-green-primary border-green-primary text-white'
                : 'border-ink-muted bg-white'
            }`}
          >
            {dataE.consent && <Check className="w-4 h-4 stroke-[3]" />}
          </div>
          <div className="flex flex-col gap-1 text-[15px] text-ink-primary">
            <span className="font-semibold text-green-deep">
              I authorize GenoRoot Clinic to evaluate my submitted medical history &amp; genetic sample.
            </span>
            <p className="text-[13px] text-ink-secondary leading-relaxed">
              Your confidential clinical data and DNA test results will only be used to design your personalized trichology therapy plan. You may revoke consent at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Reassurance Banner */}
      <div className="flex items-center gap-2.5 p-4 rounded-card bg-surface-tint-sage border border-green-primary/30 text-green-deep text-[14px]">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-green-primary" />
        <span>
          HIPAA &amp; GDPR compliant. Your genetic analysis is encrypted and shared exclusively with your attending trichologist.
        </span>
      </div>

      {/* Submit Action Button */}
      <div className="pt-6 pb-12 border-t border-border-hairline mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`w-full min-h-[54px] rounded-card font-semibold text-[18px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.985] ${
            canSubmit && !isSubmitting
              ? 'bg-green-primary hover:bg-green-deep text-white cursor-pointer'
              : 'bg-border-hairline text-ink-muted cursor-not-allowed opacity-70'
          }`}
        >
          <span>{isSubmitting ? 'Validating & Assembling JSON...' : 'Complete Intake & View Final JSON'}</span>
          {!isSubmitting && <span>→</span>}
        </button>
      </div>
    </div>
  );
};
