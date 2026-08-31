'use client';

import React, { useState } from 'react';
import { Chip } from '@/components/ui/chip';
import { YesNoToggle } from '@/components/ui/yes-no-toggle';
import { MicButton } from '@/components/ui/mic-button';
import { ConfirmationCard } from '@/components/ui/confirmation-card';
import { useMediaRecorder } from '@/hooks/use-media-recorder';
import {
  SectionCData,
  Past6MonthsTriggerOption,
  SmokingSeverityOption,
  HairWashFrequencyOption,
} from '@/types/schema';

export interface Block3LifestyleProps {
  data: SectionCData;
  onChange: (updated: SectionCData) => void;
  onNext: () => void;
}

const TRIGGER_OPTIONS: Past6MonthsTriggerOption[] = [
  'Crash dieting or major weight loss',
  'High stress or emotional trauma',
  'Fever with illness (COVID, Dengue, Typhoid)',
  'Recent surgery',
  'Change in location/water/air quality',
];

const SMOKING_SEVERITY_OPTIONS: SmokingSeverityOption[] = [
  'Mild <5/day',
  'Moderate 5-10/day',
  'Severe >10/day',
];

const WASH_FREQUENCY_OPTIONS: HairWashFrequencyOption[] = [
  'Daily',
  'Alternate Days',
  'Weekly',
];

export const Block3Lifestyle: React.FC<Block3LifestyleProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const {
    isRecording,
    isProcessing,
    recordingDuration,
    audioLevels,
    error: recorderError,
    startRecording,
    stopRecording,
  } = useMediaRecorder();

  const [extracting, setExtracting] = useState(false);
  const [extractedTranscript, setExtractedTranscript] = useState<string | null>(null);
  const [isEditingExtracted, setIsEditingExtracted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStopAndExtract = async () => {
    try {
      setErrorMessage(null);
      const audioBlob = await stopRecording();
      if (!audioBlob || audioBlob.size === 0) {
        setErrorMessage('No audio recorded. Please try again or fill the options below.');
        return;
      }

      setExtracting(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'lifestyle_recording.webm');
      formData.append('section', 'section_C');

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to extract lifestyle information.');
      }

      setExtractedTranscript(result.transcript);
      onChange({
        ...data,
        ...result.data,
        past_6_months:
          result.data.past_6_months && result.data.past_6_months.length > 0
            ? Array.from(new Set([...data.past_6_months, ...result.data.past_6_months]))
            : data.past_6_months,
        habits: {
          ...data.habits,
          ...(result.data.habits || {}),
        },
      });
    } catch (err: any) {
      console.error('[Block 3 Extract Error]', err);
      setErrorMessage(err.message || 'Voice extraction failed. You can adjust your answers manually.');
    } finally {
      setExtracting(false);
    }
  };

  const handleTriggerToggle = (opt: Past6MonthsTriggerOption) => {
    let current = [...data.past_6_months];
    if (current.includes(opt)) {
      current = current.filter((x) => x !== opt);
    } else {
      current.push(opt);
    }
    onChange({ ...data, past_6_months: current });
  };

  const handleHabitChange = (key: keyof SectionCData['habits'], val: any) => {
    onChange({
      ...data,
      habits: {
        ...data.habits,
        [key]: val,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 block-enter">
      {/* Section Title & Description */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] sm:text-[28px] font-bold text-green-deep leading-tight">
          Lifestyle & Environmental Triggers
        </h1>
        <p className="text-[16px] text-ink-secondary leading-relaxed">
          Acute stress, metabolic shifts, and water quality can trigger telogen effluvium and follicular shock.
        </p>
      </div>

      {/* Voice-First Input Option */}
      <MicButton
        isRecording={isRecording}
        isProcessing={isProcessing || extracting}
        recordingDuration={recordingDuration}
        audioLevels={audioLevels}
        onStart={startRecording}
        onStop={handleStopAndExtract}
        error={errorMessage || recorderError}
        title="Voice Copilot (Questions 10 & 11)"
        scopeText="Answers Recent Triggers, Habits, Water & Salon Treatments together"
        helperText='e.g., "High stress past 6 months, hard water at home, wash hair alternate days"'
      />

      {/* AI Extraction Confirmation Card */}
      {extractedTranscript && (
        <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-[14px] text-green-900 flex items-center gap-2">
            <span>✓</span>
            <span className="font-semibold">
              Questions 10 &amp; 11 auto-filled from your voice! Review the fields below, then tap &ldquo;Continue to Treatments&rdquo; at the bottom.
            </span>
          </div>
          <ConfirmationCard
            transcript={extractedTranscript}
            isEditing={isEditingExtracted}
            onToggleEdit={() => setIsEditingExtracted(!isEditingExtracted)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[15px]">
              <div className="bg-canvas p-3 rounded-lg border border-border-subtle col-span-1 sm:col-span-2">
                <span className="text-ink-muted text-[13px] block">Recent Triggers:</span>
                <span className="font-semibold text-green-deep">
                  {data.past_6_months.length > 0 ? data.past_6_months.join(', ') : 'None reported'}
                </span>
              </div>

              <div className="bg-canvas p-3 rounded-lg border border-border-subtle">
                <span className="text-ink-muted text-[13px] block">Wash Frequency:</span>
                <span className="font-semibold text-green-deep">{data.habits.hair_wash_frequency}</span>
              </div>

              <div className="bg-canvas p-3 rounded-lg border border-border-subtle">
                <span className="text-ink-muted text-[13px] block">Smoking:</span>
                <span className="font-semibold text-green-deep">
                  {data.habits.smoking ? `Yes (${data.habits.smoking_severity || 'Unspecified'})` : 'No'}
                </span>
              </div>

              <div className="bg-canvas p-3 rounded-lg border border-border-subtle">
                <span className="text-ink-muted text-[13px] block">Hard Water:</span>
                <span className="font-semibold text-green-deep">{data.habits.hard_water ? 'Yes' : 'No'}</span>
              </div>

              <div className="bg-canvas p-3 rounded-lg border border-border-subtle">
                <span className="text-ink-muted text-[13px] block">Chemical/Salon:</span>
                <span className="font-semibold text-green-deep">
                  {data.habits.salon_treatments ? `Yes (${data.habits.salon_treatment_detail || 'Detail noted'})` : 'No'}
                </span>
              </div>
            </div>
          </ConfirmationCard>
        </div>
      )}

      {/* Manual Interactive Form */}
      <div className="flex flex-col gap-6 pt-2">
        {/* Q10: Past 6 months triggers */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[18px] font-semibold text-ink-primary">
            10. In the past 6 months, have you experienced any of these events?
          </span>
          <span className="text-[14px] text-ink-muted -mt-1">
            Select all that apply (or leave blank if none)
          </span>
          <div className="flex flex-col gap-2.5">
            {TRIGGER_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                isMulti
                selected={data.past_6_months.includes(opt)}
                onClick={() => handleTriggerToggle(opt)}
              />
            ))}
          </div>
        </div>

        {/* Q11: Habits (Accordion / Progressive Unfold) */}
        <div className="flex flex-col gap-4">
          <span className="text-[18px] font-semibold text-ink-primary">
            11. Daily Habits & Scalp Care Routine
          </span>

          {/* Hair Wash Frequency */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-3">
            <span className="text-[17px] font-semibold text-ink-primary">
              How often do you wash your hair?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {WASH_FREQUENCY_OPTIONS.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => handleHabitChange('hair_wash_frequency', freq)}
                  className={`min-h-[50px] px-3 rounded-card text-[16px] font-medium border transition-all active:scale-[0.98] ${
                    data.habits.hair_wash_frequency === freq
                      ? 'bg-surface-tint-sage border-green-primary text-green-deep font-semibold'
                      : 'bg-canvas border-border-hairline text-ink-secondary hover:bg-surface-hover'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Smoking Toggle & Progressive Followup */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-3">
            <YesNoToggle
              label="Do you smoke tobacco?"
              value={data.habits.smoking}
              onChange={(val) => {
                handleHabitChange('smoking', val);
                if (!val) handleHabitChange('smoking_severity', null);
              }}
            />

            {/* Smooth Unfold if Smoking = Yes */}
            <div className={`accordion-content ${data.habits.smoking ? 'expanded' : ''}`}>
              <div className="accordion-inner pt-3 flex flex-col gap-2">
                <span className="text-[15px] font-medium text-ink-secondary">
                  Smoking frequency:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SMOKING_SEVERITY_OPTIONS.map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => handleHabitChange('smoking_severity', sev)}
                      className={`min-h-[46px] px-2 rounded-lg text-[14px] border font-medium transition-all ${
                        data.habits.smoking_severity === sev
                          ? 'bg-surface-tint-sage border-green-primary text-green-deep font-semibold'
                          : 'bg-canvas border-border-hairline text-ink-secondary hover:bg-surface-hover'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hard Water */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card">
            <YesNoToggle
              label="Do you have hard water in your home/location?"
              sublabel="Mineral buildup can dry hair shafts and irritate scalp"
              value={data.habits.hard_water}
              onChange={(val) => handleHabitChange('hard_water', val)}
            />
          </div>

          {/* Alcohol */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card">
            <YesNoToggle
              label="Do you regularly consume alcohol?"
              value={data.habits.alcohol}
              onChange={(val) => handleHabitChange('alcohol', val)}
            />
          </div>

          {/* Heating tools & chemicals */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card">
            <YesNoToggle
              label="Do you frequently use heating tools, hair dyes, or styling chemicals?"
              value={data.habits.heating_tools_styling_chemicals}
              onChange={(val) => handleHabitChange('heating_tools_styling_chemicals', val)}
            />
          </div>

          {/* Salon treatments with followup detail */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-3">
            <YesNoToggle
              label="Have you had recent salon treatments (Keratin, straightening, bleach)?"
              value={data.habits.salon_treatments}
              onChange={(val) => {
                handleHabitChange('salon_treatments', val);
                if (!val) handleHabitChange('salon_treatment_detail', '');
              }}
            />

            <div className={`accordion-content ${data.habits.salon_treatments ? 'expanded' : ''}`}>
              <div className="accordion-inner pt-3 flex flex-col gap-1.5">
                <label htmlFor="salon_detail_input" className="text-[14px] font-medium text-ink-secondary">
                  Please describe treatment & approximate date:
                </label>
                <input
                  id="salon_detail_input"
                  type="text"
                  placeholder="e.g. Keratin treatment 3 months ago"
                  value={data.habits.salon_treatment_detail || ''}
                  onChange={(e) => handleHabitChange('salon_treatment_detail', e.target.value)}
                  className="w-full min-h-[48px] px-3.5 rounded-lg border border-border-hairline bg-canvas text-[16px] text-ink-primary focus:border-green-primary outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-30 bg-canvas/95 backdrop-blur-md pt-3 pb-6 border-t border-border-hairline/60 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={onNext}
          className="w-full min-h-[54px] rounded-card font-semibold text-[18px] flex items-center justify-center gap-2 bg-green-primary hover:bg-green-deep text-white transition-all shadow-md active:scale-[0.985] cursor-pointer"
        >
          <span>Continue to Treatments & Care</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
