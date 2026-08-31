'use client';

import React, { useState } from 'react';
import { Chip } from '@/components/ui/chip';
import { MicButton } from '@/components/ui/mic-button';
import { ConfirmationCard } from '@/components/ui/confirmation-card';
import { ScalpZoneSelector } from '@/components/ui/scalp-zone-selector';
import { useMediaRecorder } from '@/hooks/use-media-recorder';
import {
  SectionAData,
  DurationOption,
  FamilyHistoryOption,
  PatternOption,
} from '@/types/schema';

export interface Block1HistoryProps {
  data: SectionAData;
  onChange: (updated: SectionAData) => void;
  onNext: () => void;
}

const DURATION_OPTIONS: DurationOption[] = [
  'Less than 6 months',
  '6-12 months',
  'Over a year',
];

const FAMILY_OPTIONS: FamilyHistoryOption[] = [
  'Father had hair loss',
  'Mother had hair loss',
  'Siblings with thinning or baldness',
  'No known family history',
];

const PATTERN_OPTIONS: PatternOption[] = [
  'Receding hairline',
  'Thinning at crown',
  'Widening part line',
  'Diffuse thinning',
  'Patchy loss',
  'Sudden excessive shedding',
];

export const Block1History: React.FC<Block1HistoryProps> = ({
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
        setErrorMessage('No audio was recorded. Please try again or tap the choices below.');
        return;
      }

      setExtracting(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'history_recording.webm');
      formData.append('section', 'section_A');

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to extract information from recording.');
      }

      setExtractedTranscript(result.transcript);
      onChange({
        ...data,
        ...result.data,
        family_history:
          result.data.family_history && result.data.family_history.length > 0
            ? result.data.family_history
            : data.family_history,
        pattern:
          result.data.pattern && result.data.pattern.length > 0
            ? result.data.pattern
            : data.pattern,
      });
    } catch (err: any) {
      console.error('[Block 1 Extract Error]', err);
      setErrorMessage(err.message || 'Voice extraction failed. You can select your answers manually below.');
    } finally {
      setExtracting(false);
    }
  };

  // Toggles & updates
  const handleDurationSelect = (dur: DurationOption) => {
    onChange({ ...data, duration: dur });
  };

  const handleFamilyToggle = (opt: FamilyHistoryOption) => {
    let current = [...data.family_history];
    if (opt === 'No known family history') {
      current = current.includes(opt) ? [] : ['No known family history'];
    } else {
      current = current.filter((x) => x !== 'No known family history');
      if (current.includes(opt)) {
        current = current.filter((x) => x !== opt);
      } else {
        current.push(opt);
      }
    }
    onChange({ ...data, family_history: current });
  };

  const handlePatternToggle = (opt: PatternOption) => {
    let current = [...data.pattern];
    if (current.includes(opt)) {
      current = current.filter((x) => x !== opt);
    } else {
      current.push(opt);
    }
    onChange({ ...data, pattern: current });
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? (null as any) : parseInt(e.target.value, 10);
    onChange({ ...data, age_hair_loss_began: val });
  };

  const isValid =
    data.age_hair_loss_began !== null &&
    !isNaN(data.age_hair_loss_began) &&
    data.age_hair_loss_began > 0 &&
    data.duration &&
    data.family_history.length > 0 &&
    data.pattern.length > 0;

  return (
    <div className="flex flex-col gap-6 block-enter">
      {/* Section Title & Description */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] sm:text-[28px] font-bold text-green-deep leading-tight">
          Personal & Family Hair History
        </h1>
        <p className="text-[16px] text-ink-secondary leading-relaxed">
          Tell us about when your hair loss began, what patterns you notice, and any family history.
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
        title="Voice Copilot (Questions 1 to 4)"
        scopeText="Answers Age, Duration, Family History & Scalp Pattern together"
        helperText='e.g., "Started at age 48, my father had hair loss, noticed crown thinning"'
      />

      {/* AI Extraction Confirmation Card (if voice was used) */}
      {extractedTranscript && (
        <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-[14px] text-green-900 flex items-center gap-2">
            <span>✓</span>
            <span className="font-semibold">
              Questions 1–4 auto-filled from your voice! Review the fields below, then tap &ldquo;Continue to Section B&rdquo; at the bottom.
            </span>
          </div>
          <ConfirmationCard
            transcript={extractedTranscript}
            isEditing={isEditingExtracted}
            onToggleEdit={() => setIsEditingExtracted(!isEditingExtracted)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[15px]">
              <div className="bg-canvas p-3 rounded-lg border border-border-subtle">
                <span className="text-ink-muted text-[13px] block">Age Onset:</span>
                <span className="font-semibold text-green-deep">
                  {data.age_hair_loss_began ? `${data.age_hair_loss_began} years old` : 'Not provided'}
                </span>
              </div>

              <div className="bg-canvas p-3 rounded-lg border border-border-subtle">
                <span className="text-ink-muted text-[13px] block">Duration:</span>
                <span className="font-semibold text-green-deep">{data.duration}</span>
              </div>

              <div className="bg-canvas p-3 rounded-lg border border-border-subtle col-span-1 sm:col-span-2">
                <span className="text-ink-muted text-[13px] block">Family History:</span>
                <span className="font-semibold text-green-deep">
                  {data.family_history.join(', ') || 'None selected'}
                </span>
              </div>

              <div className="bg-canvas p-3 rounded-lg border border-border-subtle col-span-1 sm:col-span-2">
                <span className="text-ink-muted text-[13px] block">Pattern:</span>
                <span className="font-semibold text-green-deep">
                  {data.pattern.join(', ') || 'None selected'}
                </span>
              </div>
            </div>
          </ConfirmationCard>
        </div>
      )}

      {/* Manual Tap Controls (Always available as primary or edit fallback) */}
      <div className="flex flex-col gap-6 pt-2">
        {/* Q1: Age hair loss began */}
        <div className="flex flex-col gap-2">
          <label htmlFor="age_input" className="text-[18px] font-semibold text-ink-primary">
            1. At what age did you first notice hair loss or thinning?
          </label>
          <div className="relative max-w-[200px]">
            <input
              id="age_input"
              type="number"
              min="10"
              max="100"
              placeholder="e.g. 48"
              value={data.age_hair_loss_began ?? ''}
              onChange={handleAgeChange}
              className="w-full min-h-[52px] px-4 rounded-card border border-border-hairline bg-surface-card text-[18px] text-ink-primary font-medium focus:border-green-primary focus:ring-2 focus:ring-green-primary/20 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted text-[15px] pointer-events-none">
              years
            </span>
          </div>
        </div>

        {/* Q2: Duration */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[18px] font-semibold text-ink-primary">
            2. How long have you been experiencing noticeable hair loss?
          </span>
          <div className="flex flex-col gap-2.5">
            {DURATION_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={data.duration === opt}
                onClick={() => handleDurationSelect(opt)}
              />
            ))}
          </div>
        </div>

        {/* Q3: Family history */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[18px] font-semibold text-ink-primary">
            3. Is there a history of hair thinning or balding in your family?
          </span>
          <span className="text-[14px] text-ink-muted -mt-1">
            Select all that apply
          </span>
          <div className="flex flex-col gap-2.5">
            {FAMILY_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                isMulti
                selected={data.family_history.includes(opt)}
                onClick={() => handleFamilyToggle(opt)}
              />
            ))}
          </div>
        </div>

        {/* Q4: Pattern & Interactive Scalp Map */}
        <div className="flex flex-col gap-3">
          <span className="text-[18px] font-semibold text-ink-primary">
            4. What specific pattern of hair loss are you noticing?
          </span>
          <span className="text-[14px] text-ink-muted -mt-1">
            Select all that apply on the visual scalp map or chips below:
          </span>

          {/* Interactive Scalp Zone Map */}
          <ScalpZoneSelector
            selectedPatterns={data.pattern}
            onTogglePattern={handlePatternToggle}
          />
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-30 bg-canvas/95 backdrop-blur-md pt-3 pb-6 border-t border-border-hairline/60 -mx-4 px-4 sm:mx-0 sm:px-0">
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
          <span>Continue to Section B: Health (Step 2 of 6)</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
