'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  RotateCcw,
  Edit2,
  Code2,
  Printer,
  Dna,
  AlertCircle,
} from 'lucide-react';
import { GenoRootIntakePayload } from '@/types/schema';
import { inferClinicalTriaging } from '@/lib/clinical-triaging';

export interface SummaryViewProps {
  payload: GenoRootIntakePayload;
  onEditStep: (step: number) => void;
  onReset: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  payload,
  onEditStep,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const triaging = inferClinicalTriaging(payload);
  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genoroot-intake-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 block-enter">
      {/* Success Header Banner */}
      <div className="bg-surface-tint-sage border-2 border-green-primary/50 p-6 rounded-card flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
        <div className="w-14 h-14 rounded-full bg-green-primary text-white flex items-center justify-center flex-shrink-0 shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-[22px] sm:text-[26px] font-bold text-green-deep">
            Intake Completed Successfully
          </h1>
          <p className="text-[15px] text-ink-secondary mt-1">
            Your clinical history has been formatted into the validated GenoRoot clinical schema.
          </p>
        </div>
      </div>

      {/* Primary Deliverable Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 min-h-[50px] px-4 rounded-card bg-green-primary hover:bg-green-deep text-white font-semibold text-[15px] shadow-sm active:scale-[0.985] transition-all"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied JSON!' : 'Copy Formatted JSON'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 min-h-[50px] px-4 rounded-card bg-surface-card border border-border-hairline hover:border-green-primary text-ink-primary font-semibold text-[15px] shadow-card active:scale-[0.985] transition-all"
        >
          <Download className="w-4 h-4 text-green-primary" />
          <span>Download payload.json</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 min-h-[50px] px-4 rounded-card bg-surface-card border border-border-hairline hover:border-green-primary text-ink-primary font-semibold text-[15px] shadow-card active:scale-[0.985] transition-all"
        >
          <Printer className="w-4 h-4 text-ink-muted" />
          <span>Print Clinical Report</span>
        </button>
      </div>

      {/* Clinical Triaging & Biomarker Target Preview (Product Depth Highlight) */}
      <div className="bg-surface-card border-2 border-green-accent/40 rounded-card p-5 shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border-hairline pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-surface-tint-sage flex items-center justify-center text-green-primary">
              <Dna className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[17px] text-green-deep block">
                Preliminary Clinical Triage &amp; Biomarker Targets
              </span>
              <span className="text-[13px] text-ink-muted">
                Inferred from your submitted personal history and scalp patterns
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-surface-tint-sage text-green-deep border border-green-primary/30">
            {triaging.urgencyLevel} Priority
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
          {/* Primary Phenotype */}
          <div className="bg-canvas p-4 rounded-card border border-border-subtle flex flex-col gap-1">
            <span className="text-[12px] uppercase font-bold tracking-wider text-green-primary">
              Primary Phenotypic Profile:
            </span>
            <span className="text-[16px] font-bold text-green-deep">
              {triaging.primaryPhenotype}
            </span>
            <p className="text-ink-secondary text-[13px] mt-1 leading-relaxed">
              {triaging.phenotypeDescription}
            </p>
          </div>

          {/* Key Biomarkers */}
          <div className="bg-canvas p-4 rounded-card border border-border-subtle flex flex-col gap-2">
            <span className="text-[12px] uppercase font-bold tracking-wider text-green-primary">
              Recommended Biomarker Assay Targets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {triaging.keyBiomarkers.map((bio, idx) => (
                <span
                  key={idx}
                  className="bg-white border border-border-hairline px-2.5 py-1 rounded-md text-[13px] font-medium text-ink-primary shadow-xs"
                >
                  🧬 {bio}
                </span>
              ))}
            </div>
          </div>

          {/* Priority Clinical Flags */}
          <div className="bg-canvas p-4 rounded-card border border-border-subtle col-span-1 sm:col-span-2 flex flex-col gap-2">
            <span className="text-[12px] uppercase font-bold tracking-wider text-terracotta">
              Physiological &amp; Environmental Flags:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {triaging.priorityFlags.map((flag, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[13px] text-ink-primary">
                  <AlertCircle className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Formatted Review Cards vs Raw JSON */}
      <div className="flex items-center justify-between border-b border-border-hairline pb-2 mt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRawJson(false)}
            className={`px-4 py-2 rounded-lg text-[15px] font-semibold transition-all ${
              !showRawJson
                ? 'bg-surface-tint-sage text-green-deep shadow-xs'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            Clinical Summary Cards
          </button>
          <button
            type="button"
            onClick={() => setShowRawJson(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-semibold transition-all ${
              showRawJson
                ? 'bg-surface-tint-sage text-green-deep shadow-xs'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Raw Schema JSON</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-[14px] text-ink-muted hover:text-red-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {showRawJson ? (
        /* Raw Schema JSON Viewer */
        <div className="relative bg-ink-primary text-green-soft p-5 rounded-card overflow-x-auto text-[14px] font-mono leading-relaxed shadow-lg border border-green-deep">
          <pre>{jsonString}</pre>
        </div>
      ) : (
        /* Structured Clinical Review Cards */
        <div className="flex flex-col gap-4">
          {/* Section A */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="font-bold text-green-deep text-[17px]">
                Section A: Personal &amp; Family Hair History
              </span>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="flex items-center gap-1 text-[14px] font-semibold text-green-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[15px]">
              <div>
                <span className="text-ink-muted text-[13px] block">Age Onset:</span>
                <span className="font-medium">{payload.section_A.age_hair_loss_began} years</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Duration:</span>
                <span className="font-medium">{payload.section_A.duration}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-ink-muted text-[13px] block">Family History:</span>
                <span className="font-medium">{payload.section_A.family_history.join(', ')}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-ink-muted text-[13px] block">Pattern:</span>
                <span className="font-medium">{payload.section_A.pattern.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Section B */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="font-bold text-green-deep text-[17px]">
                Section B: Hormonal &amp; Health Influences
              </span>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="flex items-center gap-1 text-[14px] font-semibold text-green-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[15px]">
              <div className="sm:col-span-2">
                <span className="text-ink-muted text-[13px] block">Diagnosed Conditions:</span>
                <span className="font-medium">{payload.section_B.diagnosed_conditions.join(', ')}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Menstrual Cycle (Q6):</span>
                <span className="font-medium">{payload.section_B.menstrual_cycle}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Pregnancy Status (Q7):</span>
                <span className="font-medium">{payload.section_B.pregnancy_related}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Adult Acne / Oily Skin:</span>
                <span className="font-medium">{payload.section_B.adult_acne_oily_skin ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Excess Body/Facial Hair:</span>
                <span className="font-medium">{payload.section_B.excess_body_facial_hair ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Section C */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="font-bold text-green-deep text-[17px]">
                Section C: Lifestyle &amp; Environmental Triggers
              </span>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="flex items-center gap-1 text-[14px] font-semibold text-green-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[15px]">
              <div className="sm:col-span-2">
                <span className="text-ink-muted text-[13px] block">Past 6 Months Triggers:</span>
                <span className="font-medium">
                  {payload.section_C.past_6_months.length > 0
                    ? payload.section_C.past_6_months.join(', ')
                    : 'None reported'}
                </span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Wash Frequency:</span>
                <span className="font-medium">{payload.section_C.habits.hair_wash_frequency}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Smoking:</span>
                <span className="font-medium">
                  {payload.section_C.habits.smoking
                    ? `Yes (${payload.section_C.habits.smoking_severity || 'Unspecified'})`
                    : 'No'}
                </span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Hard Water:</span>
                <span className="font-medium">{payload.section_C.habits.hard_water ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Alcohol:</span>
                <span className="font-medium">{payload.section_C.habits.alcohol ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Section D */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="font-bold text-green-deep text-[17px]">
                Section D: Hair Care &amp; Past Treatments
              </span>
              <button
                type="button"
                onClick={() => onEditStep(4)}
                className="flex items-center gap-1 text-[14px] font-semibold text-green-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="flex flex-col gap-2 text-[15px]">
              <div>
                <span className="text-ink-muted text-[13px] block">Products Used:</span>
                <span className="font-medium">
                  {Object.entries(payload.section_D.products)
                    .filter(([_, item]) => item.used)
                    .map(([name, item]) => `${name} (${item.duration || '<3mo'})`)
                    .join(', ') || 'None selected'}
                </span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Procedures Done:</span>
                <span className="font-medium">
                  {Object.entries(payload.section_D.procedures)
                    .filter(([_, item]) => item.done)
                    .map(([name, item]) => `${name} (${item.sessions || '1-3'} sessions)`)
                    .join(', ') || 'None selected'}
                </span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Side Effects:</span>
                <span className="font-medium">
                  {payload.section_D.past_treatment_side_effects
                    ? `Yes — ${payload.section_D.past_treatment_side_effects_describe || 'Noted'}`
                    : 'None reported'}
                </span>
              </div>
            </div>
          </div>

          {/* Section E */}
          <div className="bg-surface-card p-5 rounded-card border border-border-hairline shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="font-bold text-green-deep text-[17px]">
                Section E: Sample Collection &amp; Consent
              </span>
              <button
                type="button"
                onClick={() => onEditStep(6)}
                className="flex items-center gap-1 text-[14px] font-semibold text-green-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[15px]">
              <div>
                <span className="text-ink-muted text-[13px] block">Sample Type Preference:</span>
                <span className="font-medium">{payload.section_E.sample_type}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] block">Clinical Consent:</span>
                <span className="font-medium text-green-primary">✓ Authorized &amp; Signed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
