'use client';

import React from 'react';
import { Chip } from '@/components/ui/chip';
import { YesNoToggle } from '@/components/ui/yes-no-toggle';
import {
  SectionDData,
  ProductRowName,
  ProcedureRowName,
  TreatmentDurationOption,
  ProcedureSessionsOption,
} from '@/types/schema';

export interface Block4TreatmentsProps {
  data: SectionDData;
  onChange: (updated: SectionDData) => void;
  onNext: () => void;
}

const PRODUCTS_LIST: ProductRowName[] = [
  'OTC/Medicated Shampoos',
  'Hair Oils/Serums',
  'Topical Minoxidil',
  'Oral Minoxidil',
  'Supplements',
];

const PROCEDURES_LIST: ProcedureRowName[] = [
  'PRP/GFC/iPRF',
  'Stem Cells/Exosomes',
  'Hair Transplant',
  'Other',
];

const DURATION_LIST: TreatmentDurationOption[] = ['<3mo', '3-6mo', '>6mo'];
const SESSIONS_LIST: ProcedureSessionsOption[] = ['1-3', '4-6', '>6'];

export const Block4Treatments: React.FC<Block4TreatmentsProps> = ({
  data,
  onChange,
  onNext,
}) => {
  // Product toggle & details
  const handleProductToggle = (prod: ProductRowName) => {
    const current = data.products[prod] || { used: false, duration: null, helped: null, side_effects: null };
    const updatedUsed = !current.used;

    onChange({
      ...data,
      products: {
        ...data.products,
        [prod]: {
          used: updatedUsed,
          duration: updatedUsed ? current.duration || '3-6mo' : null,
          helped: updatedUsed ? (current.helped !== null ? current.helped : true) : null,
          side_effects: updatedUsed ? (current.side_effects !== null ? current.side_effects : false) : null,
        },
      },
    });
  };

  const handleProductField = (prod: ProductRowName, field: 'duration' | 'helped' | 'side_effects', val: any) => {
    onChange({
      ...data,
      products: {
        ...data.products,
        [prod]: {
          ...data.products[prod],
          [field]: val,
        },
      },
    });
  };

  // Procedure toggle & details
  const handleProcedureToggle = (proc: ProcedureRowName) => {
    const current = data.procedures[proc] || { done: false, sessions: null, helped: null };
    const updatedDone = !current.done;

    onChange({
      ...data,
      procedures: {
        ...data.procedures,
        [proc]: {
          done: updatedDone,
          sessions: updatedDone ? current.sessions || '1-3' : null,
          helped: updatedDone ? (current.helped !== null ? current.helped : true) : null,
        },
      },
    });
  };

  const handleProcedureField = (proc: ProcedureRowName, field: 'sessions' | 'helped', val: any) => {
    onChange({
      ...data,
      procedures: {
        ...data.procedures,
        [proc]: {
          ...data.procedures[proc],
          [field]: val,
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 block-enter">
      {/* Section Title & Description */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] sm:text-[28px] font-bold text-green-deep leading-tight">
          Current Hair Care & Past Treatments
        </h1>
        <p className="text-[16px] text-ink-secondary leading-relaxed">
          Select any products or medical procedures you have tried. Tapping an item unfolds quick details on duration and results.
        </p>
      </div>

      {/* Q12: Products (Collapsed Table -> Progressive Unfold) */}
      <div className="flex flex-col gap-3">
        <span className="text-[18px] font-semibold text-ink-primary">
          12. Products & Medications Used
        </span>
        <span className="text-[14px] text-ink-muted -mt-1">
          Select all that apply. Tap again to deselect.
        </span>

        <div className="flex flex-col gap-3">
          {PRODUCTS_LIST.map((prod) => {
            const isUsed = !!data.products[prod]?.used;
            const currentItem = data.products[prod] || { used: false, duration: '<3mo', helped: false, side_effects: false };

            return (
              <div
                key={prod}
                className={`rounded-card border transition-all duration-200 overflow-hidden ${
                  isUsed
                    ? 'bg-surface-card border-green-primary shadow-sm'
                    : 'bg-surface-card border-border-hairline hover:border-green-accent/60'
                }`}
              >
                {/* Header Chip */}
                <Chip
                  label={prod}
                  isMulti
                  selected={isUsed}
                  onClick={() => handleProductToggle(prod)}
                  className="border-none rounded-none bg-transparent hover:bg-transparent shadow-none"
                />

                {/* Unfolded Sub-Questions */}
                <div className={`accordion-content ${isUsed ? 'expanded' : ''}`}>
                  <div className="accordion-inner p-4 pt-1 border-t border-border-subtle bg-canvas/60 flex flex-col gap-3.5">
                    {/* Duration */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[14px] font-semibold text-ink-secondary">
                        How long did you use it?
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {DURATION_LIST.map((dur) => (
                          <button
                            key={dur}
                            type="button"
                            onClick={() => handleProductField(prod, 'duration', dur)}
                            className={`min-h-[44px] px-2 rounded-lg text-[14px] font-medium border transition-all ${
                              currentItem.duration === dur
                                ? 'bg-surface-tint-sage border-green-primary text-green-deep font-semibold'
                                : 'bg-white border-border-hairline text-ink-secondary hover:bg-surface-hover'
                            }`}
                          >
                            {dur}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Did it help? */}
                    <div className="flex flex-col gap-1.5">
                      <YesNoToggle
                        label="Did you notice improvement or reduced shedding?"
                        value={currentItem.helped ?? null}
                        onChange={(val) => handleProductField(prod, 'helped', val)}
                      />
                    </div>

                    {/* Side effects? */}
                    <div className="flex flex-col gap-1.5">
                      <YesNoToggle
                        label="Did you experience any adverse side effects?"
                        value={currentItem.side_effects ?? null}
                        onChange={(val) => handleProductField(prod, 'side_effects', val)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Q13: Procedures (PRP, GFC, Transplant, etc.) */}
      <div className="flex flex-col gap-3 pt-2">
        <span className="text-[18px] font-semibold text-ink-primary">
          13. Clinical Procedures & Therapies
        </span>
        <span className="text-[14px] text-ink-muted -mt-1">
          Select any in-clinic procedures you have undergone
        </span>

        <div className="flex flex-col gap-3">
          {PROCEDURES_LIST.map((proc) => {
            const isDone = !!data.procedures[proc]?.done;
            const currentItem = data.procedures[proc] || { done: false, sessions: '1-3', helped: false };

            return (
              <div
                key={proc}
                className={`rounded-card border transition-all duration-200 overflow-hidden ${
                  isDone
                    ? 'bg-surface-card border-green-primary shadow-sm'
                    : 'bg-surface-card border-border-hairline hover:border-green-accent/60'
                }`}
              >
                <Chip
                  label={proc}
                  isMulti
                  selected={isDone}
                  onClick={() => handleProcedureToggle(proc)}
                  className="border-none rounded-none bg-transparent hover:bg-transparent shadow-none"
                />

                <div className={`accordion-content ${isDone ? 'expanded' : ''}`}>
                  <div className="accordion-inner p-4 pt-1 border-t border-border-subtle bg-canvas/60 flex flex-col gap-3.5">
                    {/* Sessions count */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[14px] font-semibold text-ink-secondary">
                        Number of sessions completed:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {SESSIONS_LIST.map((sess) => (
                          <button
                            key={sess}
                            type="button"
                            onClick={() => handleProcedureField(proc, 'sessions', sess)}
                            className={`min-h-[44px] px-2 rounded-lg text-[14px] font-medium border transition-all ${
                              currentItem.sessions === sess
                                ? 'bg-surface-tint-sage border-green-primary text-green-deep font-semibold'
                                : 'bg-white border-border-hairline text-ink-secondary hover:bg-surface-hover'
                            }`}
                          >
                            {sess}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Helped? */}
                    <div className="flex flex-col gap-1.5">
                      <YesNoToggle
                        label="Did this procedure help your hair density?"
                        value={currentItem.helped ?? null}
                        onChange={(val) => handleProcedureField(proc, 'helped', val)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Q14: Past side effects or poor response */}
      <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-3">
        <YesNoToggle
          label="14. Have you experienced adverse side effects or poor response from any past hair treatments?"
          sublabel="e.g. Scalp dermatitis, flaking, heart palpitations from minoxidil, or sudden shedding spikes"
          value={data.past_treatment_side_effects}
          onChange={(val) => {
            onChange({
              ...data,
              past_treatment_side_effects: val,
              past_treatment_side_effects_describe: val ? data.past_treatment_side_effects_describe || '' : '',
            });
          }}
        />

        <div className={`accordion-content ${data.past_treatment_side_effects ? 'expanded' : ''}`}>
          <div className="accordion-inner pt-3 flex flex-col gap-1.5">
            <label htmlFor="side_effects_desc" className="text-[14px] font-medium text-ink-secondary">
              Please describe the reaction and which product/treatment caused it:
            </label>
            <textarea
              id="side_effects_desc"
              rows={3}
              placeholder="e.g., Severe itching and redness with 5% topical minoxidil, stopped after 2 weeks"
              value={data.past_treatment_side_effects_describe || ''}
              onChange={(e) =>
                onChange({ ...data, past_treatment_side_effects_describe: e.target.value })
              }
              className="w-full p-3 rounded-lg border border-border-hairline bg-canvas text-[16px] text-ink-primary focus:border-green-primary outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-6 pb-12 border-t border-border-hairline mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onNext}
          className="w-full min-h-[54px] rounded-card font-semibold text-[18px] flex items-center justify-center gap-2 bg-green-primary hover:bg-green-deep text-white transition-all shadow-md active:scale-[0.985] cursor-pointer"
        >
          <span>Continue to Hormonal &amp; Cycle Context (Step 5 of 6)</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
