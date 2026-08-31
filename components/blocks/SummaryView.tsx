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
  FileCheck2,
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

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col gap-6 block-enter">
      {/* Printable Clinic Letterhead (Only visible on paper / PDF print) */}
      <div className="hidden print:block border-b-2 border-green-900 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[16pt] font-black text-green-900 tracking-tight">
                GenoRoot
              </span>
              <span className="text-[12pt] font-bold text-gray-700">
                | Trichology &amp; Scalp Genetics Clinic
              </span>
            </div>
            <p className="text-[8.5pt] text-gray-600 font-medium">
              Confidential Patient Medical Intake &amp; Phenotypic Triaging Evaluation
            </p>
          </div>
          <div className="text-right text-[8.5pt] text-gray-600 leading-tight">
            <div><strong>Date:</strong> {formattedDate}</div>
            <div><strong>Status:</strong> <span className="text-green-800 font-bold">Validated (16/16 Completed)</span></div>
          </div>
        </div>
      </div>

      {/* Success Header Banner (Screen Only) */}
      <div className="no-print bg-surface-tint-sage border-2 border-green-primary/50 p-6 rounded-card flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
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

      {/* Primary Deliverable Actions (Screen Only) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-3">
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

      {/* Clinical Triaging & Biomarker Target Preview */}
      <div className="bg-surface-card border-2 border-green-accent/40 rounded-card p-5 shadow-card flex flex-col gap-4 print:border print:border-gray-300 print:p-2.5 print:mb-2 print:rounded-md break-inside-avoid">
        <div className="flex items-center justify-between border-b border-border-hairline pb-3 print:pb-1">
          <div className="flex items-center gap-2.5">
            <div className="no-print w-8 h-8 rounded-full bg-surface-tint-sage flex items-center justify-center text-green-primary">
              <Dna className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[17px] print:text-[11pt] text-green-deep block">
                Preliminary Clinical Triage &amp; Biomarker Targets
              </span>
              <span className="text-[13px] print:text-[8pt] text-ink-muted">
                Inferred from submitted patient personal history and scalp patterns
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[12px] print:text-[8pt] font-bold bg-surface-tint-sage text-green-deep border border-green-primary/30">
            {triaging.urgencyLevel} Priority
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2 text-[14px]">
          {/* Primary Phenotype */}
          <div className="bg-canvas print:bg-white p-4 print:p-2 rounded-card border border-border-subtle print:border-gray-200 flex flex-col gap-1">
            <span className="text-[12px] print:text-[8pt] uppercase font-bold tracking-wider text-green-primary">
              Primary Phenotypic Profile:
            </span>
            <span className="text-[16px] print:text-[10pt] font-bold text-green-deep">
              {triaging.primaryPhenotype}
            </span>
            <p className="text-ink-secondary text-[13px] print:text-[8pt] mt-0.5 leading-relaxed">
              {triaging.phenotypeDescription}
            </p>
          </div>

          {/* Key Biomarkers */}
          <div className="bg-canvas print:bg-white p-4 print:p-2 rounded-card border border-border-subtle print:border-gray-200 flex flex-col gap-1.5">
            <span className="text-[12px] print:text-[8pt] uppercase font-bold tracking-wider text-green-primary">
              Recommended Biomarker Assay Targets:
            </span>
            <div className="flex flex-wrap gap-1.5 print:gap-1">
              {triaging.keyBiomarkers.map((bio, idx) => (
                <span
                  key={idx}
                  className="bg-white border border-border-hairline print:border-gray-300 px-2.5 print:px-1.5 py-1 print:py-0.5 rounded-md text-[13px] print:text-[8pt] font-medium text-ink-primary"
                >
                  🧬 {bio}
                </span>
              ))}
            </div>
          </div>

          {/* Priority Clinical Flags */}
          <div className="bg-canvas print:bg-white p-4 print:p-2 rounded-card border border-border-subtle print:border-gray-200 col-span-1 sm:col-span-2 flex flex-col gap-1.5">
            <span className="text-[12px] print:text-[8pt] uppercase font-bold tracking-wider text-terracotta">
              Physiological &amp; Environmental Flags:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:gap-1">
              {triaging.priorityFlags.map((flag, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[13px] print:text-[8pt] text-ink-primary">
                  <AlertCircle className="w-3.5 h-3.5 print:w-3 print:h-3 text-terracotta flex-shrink-0" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher (Screen Only) */}
      <div className="no-print flex items-center justify-between border-b border-border-hairline pb-2 mt-2">
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
        /* Raw Schema JSON Viewer (Screen Only) */
        <div className="no-print relative bg-ink-primary text-green-soft p-5 rounded-card overflow-x-auto text-[14px] font-mono leading-relaxed shadow-lg border border-green-deep">
          <pre>{jsonString}</pre>
        </div>
      ) : (
        /* Structured Clinical Review Cards (Organized in 2 Columns when printed) */
        <div className="flex flex-col gap-4 print:grid print:grid-cols-2 print:gap-2">
          {/* Section A */}
          <div className="bg-surface-card p-5 print:p-2.5 rounded-card border border-border-hairline print:border-gray-300 shadow-card flex flex-col gap-3 print:gap-1 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2 print:pb-1">
              <span className="font-bold text-green-deep text-[17px] print:text-[9.5pt]">
                Section A: Hair Loss History
              </span>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="no-print flex items-center gap-1 text-[14px] font-semibold text-green-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 text-[15px] print:text-[8.5pt]">
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Age Onset:</span>
                <span className="font-semibold">{payload.section_A.age_hair_loss_began} years</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Duration:</span>
                <span className="font-semibold">{payload.section_A.duration}</span>
              </div>
              <div className="sm:col-span-2 print:col-span-2">
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Family History:</span>
                <span className="font-semibold">{payload.section_A.family_history.join(', ')}</span>
              </div>
              <div className="sm:col-span-2 print:col-span-2">
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Pattern:</span>
                <span className="font-semibold">{payload.section_A.pattern.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Section B */}
          <div className="bg-surface-card p-5 print:p-2.5 rounded-card border border-border-hairline print:border-gray-300 shadow-card flex flex-col gap-3 print:gap-1 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2 print:pb-1">
              <span className="font-bold text-green-deep text-[17px] print:text-[9.5pt]">
                Section B: Health &amp; Hormonal
              </span>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="no-print flex items-center gap-1 text-[14px] font-semibold text-green-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 text-[15px] print:text-[8.5pt]">
              <div className="sm:col-span-2 print:col-span-2">
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Diagnosed Conditions:</span>
                <span className="font-semibold">{payload.section_B.diagnosed_conditions.join(', ')}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Menstrual Cycle:</span>
                <span className="font-semibold">{payload.section_B.menstrual_cycle}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Pregnancy Status:</span>
                <span className="font-semibold">{payload.section_B.pregnancy_related}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Adult Acne / Oily:</span>
                <span className="font-semibold">{payload.section_B.adult_acne_oily_skin ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Excess Body/Facial:</span>
                <span className="font-semibold">{payload.section_B.excess_body_facial_hair ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Section C */}
          <div className="bg-surface-card p-5 print:p-2.5 rounded-card border border-border-hairline print:border-gray-300 shadow-card flex flex-col gap-3 print:gap-1 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2 print:pb-1">
              <span className="font-bold text-green-deep text-[17px] print:text-[9.5pt]">
                Section C: Lifestyle &amp; Triggers
              </span>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="no-print flex items-center gap-1 text-[14px] font-semibold text-green-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 text-[15px] print:text-[8.5pt]">
              <div className="sm:col-span-2 print:col-span-2">
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Past 6 Months Triggers:</span>
                <span className="font-semibold">
                  {payload.section_C.past_6_months.length > 0
                    ? payload.section_C.past_6_months.join(', ')
                    : 'None reported'}
                </span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Wash Frequency:</span>
                <span className="font-semibold">{payload.section_C.habits.hair_wash_frequency}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Smoking:</span>
                <span className="font-semibold">
                  {payload.section_C.habits.smoking
                    ? `Yes (${payload.section_C.habits.smoking_severity || 'Mild'})`
                    : 'No'}
                </span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Hard Water:</span>
                <span className="font-semibold">{payload.section_C.habits.hard_water ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Alcohol:</span>
                <span className="font-semibold">{payload.section_C.habits.alcohol ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Section D */}
          <div className="bg-surface-card p-5 print:p-2.5 rounded-card border border-border-hairline print:border-gray-300 shadow-card flex flex-col gap-3 print:gap-1 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2 print:pb-1">
              <span className="font-bold text-green-deep text-[17px] print:text-[9.5pt]">
                Section D: Hair Care &amp; Past Treatments
              </span>
              <button
                type="button"
                onClick={() => onEditStep(4)}
                className="no-print flex items-center gap-1 text-[14px] font-semibold text-green-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="flex flex-col gap-1.5 text-[15px] print:text-[8.5pt]">
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Products Used:</span>
                <span className="font-semibold">
                  {Object.entries(payload.section_D.products)
                    .filter(([_, item]) => item.used)
                    .map(([name, item]) => `${name} (${item.duration || '<3mo'})`)
                    .join(', ') || 'None selected'}
                </span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Procedures Done:</span>
                <span className="font-semibold">
                  {Object.entries(payload.section_D.procedures)
                    .filter(([_, item]) => item.done)
                    .map(([name, item]) => `${name} (${item.sessions || '1-3'} sessions)`)
                    .join(', ') || 'None selected'}
                </span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Side Effects:</span>
                <span className="font-semibold">
                  {payload.section_D.past_treatment_side_effects
                    ? `Yes — ${payload.section_D.past_treatment_side_effects_describe || 'Noted'}`
                    : 'None reported'}
                </span>
              </div>
            </div>
          </div>

          {/* Section E */}
          <div className="bg-surface-card p-5 print:p-2.5 rounded-card border border-border-hairline print:border-gray-300 shadow-card flex flex-col gap-3 print:gap-1 break-inside-avoid print:col-span-2">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2 print:pb-1">
              <span className="font-bold text-green-deep text-[17px] print:text-[9.5pt]">
                Section E: Sample Collection &amp; Clinical Authorization
              </span>
              <button
                type="button"
                onClick={() => onEditStep(6)}
                className="no-print flex items-center gap-1 text-[14px] font-semibold text-green-primary hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 text-[15px] print:text-[8.5pt]">
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Sample Type Preference:</span>
                <span className="font-semibold">{payload.section_E.sample_type}</span>
              </div>
              <div>
                <span className="text-ink-muted text-[13px] print:text-[7.5pt] block">Consent Status:</span>
                <span className="font-semibold text-green-primary">✓ Authorized &amp; Signed by Patient</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clinician Review Sign-off Block (Only visible on print) */}
      <div className="hidden print:block border-t-2 border-gray-300 pt-2.5 mt-2">
        <div className="flex items-center justify-between text-[8.5pt] text-gray-700">
          <div>
            <span><strong>Clinician Sign-off:</strong> ___________________________</span>
          </div>
          <div>
            <span><strong>Date:</strong> _______________</span>
          </div>
          <div>
            <span><strong>DNA Assay Kit:</strong> [✓] Authorized for Dispatch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
