'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ProgressHeader } from '@/components/ui/progress-header';
import { Block1History } from '@/components/blocks/Block1History';
import { Block2Health } from '@/components/blocks/Block2Health';
import { Block3Lifestyle } from '@/components/blocks/Block3Lifestyle';
import { Block4Treatments } from '@/components/blocks/Block4Treatments';
import { Block5Hormonal } from '@/components/blocks/Block5Hormonal';
import { Block6Consent } from '@/components/blocks/Block6Consent';
import { SummaryView } from '@/components/blocks/SummaryView';
import { DebugPanel } from '@/components/ui/debug-panel';
import { DEMO_PATIENT_PAYLOAD } from '@/lib/demo-data';
import {
  createDefaultIntakeState,
  GenoRootIntakePayload,
  GenoRootIntakePayloadSchema,
} from '@/types/schema';

const STEP_TITLES = [
  'Personal & Family History',
  'Health Conditions & Symptoms',
  'Lifestyle Triggers & Habits',
  'Hair Care & Treatments',
  'Hormonal & Cycle Context',
  'Side Effects & Consent',
  'Clinical Summary & JSON',
];

const STEP_TIMES = [
  '~1.5 mins',
  '~1 min',
  '~1.5 mins',
  '~1.5 mins',
  '~45 secs',
  '~1 min',
  'Complete',
];

export default function GenoRootIntakePage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [payload, setPayload] = useState<GenoRootIntakePayload>(createDefaultIntakeState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Restore state from sessionStorage if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('genoroot_intake_state');
      const savedStep = sessionStorage.getItem('genoroot_intake_step');
      if (saved) {
        setPayload(JSON.parse(saved));
      }
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 7) {
          setCurrentStep(stepNum);
        }
      }
    } catch (e) {
      console.warn('Session restore failed:', e);
    }
  }, []);

  // Save state on change
  useEffect(() => {
    try {
      sessionStorage.setItem('genoroot_intake_state', JSON.stringify(payload));
      sessionStorage.setItem('genoroot_intake_step', currentStep.toString());
    } catch (e) {
      console.warn('Session save failed:', e);
    }
  }, [payload, currentStep]);

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.min(7, prev + 1));
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    const updatedPayload = {
      ...payload,
      submitted_at: new Date().toISOString(),
    };

    // Validate payload against master schema
    const validation = GenoRootIntakePayloadSchema.safeParse(updatedPayload);
    if (!validation.success) {
      console.warn('Validation warnings on submission:', validation.error.format());
    }

    setPayload(updatedPayload);
    setIsSubmitting(false);
    handleNext();
  };

  const handleReset = () => {
    try {
      sessionStorage.removeItem('genoroot_intake_state');
      sessionStorage.removeItem('genoroot_intake_step');
    } catch {}
    setPayload(createDefaultIntakeState());
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreFillDemo = () => {
    setPayload(DEMO_PATIENT_PAYLOAD);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between relative">
      {/* Sticky Progress Navigation Header */}
      {currentStep <= 6 && (
        <ProgressHeader
          currentStep={currentStep}
          totalSteps={6}
          stepTitle={STEP_TITLES[currentStep - 1]}
          estimatedTime={STEP_TIMES[currentStep - 1]}
          onBack={handleBack}
          canGoBack={currentStep > 1}
        />
      )}

      {/* Main Content Area */}
      <main className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col">
        {currentStep === 1 && (
          <Block1History
            data={payload.section_A}
            onChange={(sectionA) => setPayload({ ...payload, section_A: sectionA })}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <Block2Health
            data={payload.section_B}
            onChange={(sectionB) => setPayload({ ...payload, section_B: sectionB })}
            onNext={handleNext}
          />
        )}

        {currentStep === 3 && (
          <Block3Lifestyle
            data={payload.section_C}
            onChange={(sectionC) => setPayload({ ...payload, section_C: sectionC })}
            onNext={handleNext}
          />
        )}

        {currentStep === 4 && (
          <Block4Treatments
            data={payload.section_D}
            onChange={(sectionD) => setPayload({ ...payload, section_D: sectionD })}
            onNext={handleNext}
          />
        )}

        {currentStep === 5 && (
          <Block5Hormonal
            data={payload.section_B}
            onChange={(sectionB) => setPayload({ ...payload, section_B: sectionB })}
            onNext={handleNext}
          />
        )}

        {currentStep === 6 && (
          <Block6Consent
            dataE={payload.section_E}
            onChangeE={(sectionE) => setPayload({ ...payload, section_E: sectionE })}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 7 && (
          <SummaryView
            payload={payload}
            onEditStep={(step) => {
              setCurrentStep(step);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Dev-only Live Inspector Debug Panel */}
      <Suspense fallback={null}>
        <DebugPanel
          currentStep={currentStep}
          payload={payload}
          onPreFillDemo={handlePreFillDemo}
        />
      </Suspense>

      {/* Footer Branding */}
      <footer className="py-6 text-center text-[13px] text-ink-muted border-t border-border-hairline/40">
        <p>© 2026 GenoRoot Trichology &amp; Scalp Genetics Clinic. Confidential Clinical Intake.</p>
      </footer>
    </div>
  );
}
