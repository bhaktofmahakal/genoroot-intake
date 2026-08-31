'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bug, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Copy, Check, Wand2 } from 'lucide-react';
import { validateIntakeOutput } from '@/lib/validate-output';
import { GenoRootIntakePayload } from '@/types/schema';

export interface DebugPanelProps {
  currentStep: number;
  payload: GenoRootIntakePayload;
  onPreFillDemo: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  currentStep,
  payload,
  onPreFillDemo,
}) => {
  const searchParams = useSearchParams();
  const isDebugParam = searchParams.get('debug') === 'true' || searchParams.get('dev') === '1';

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // If debug query param is present, default to visible
  useEffect(() => {
    if (isDebugParam) {
      setIsOpen(true);
    }
  }, [isDebugParam]);

  const report = validateIntakeOutput(payload);
  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Only render if debug param is present OR user manually opens via hidden corner trigger
  return (
    <div id="debug-panel" className="no-print fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-ink-primary text-white text-[13px] font-mono shadow-xl border border-green-deep hover:bg-green-deep transition-all"
        title="Toggle Developer Debug Panel (?debug=true)"
      >
        <Bug className="w-4 h-4 text-green-soft" />
        <span>Dev State</span>
        {report.valid ? (
          <span className="w-2 h-2 rounded-full bg-green-400" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-amber-400" />
        )}
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Debug Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[480px] max-h-[560px] bg-ink-primary text-green-soft border-2 border-green-deep rounded-section mt-2 p-4 shadow-2xl flex flex-col gap-3 font-mono text-[12px] animate-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-green-deep/60 pb-2">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-green-soft" />
              <span className="font-bold text-[14px] text-white">GenoRoot Live Inspector</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPreFillDemo}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-green-primary hover:bg-green-accent text-white text-[11px] font-semibold transition-colors"
                title="Fill with realistic 55yo patient data"
              >
                <Wand2 className="w-3 h-3" />
                <span>Pre-fill Demo</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-green-soft hover:text-white transition-colors"
                title="Copy live JSON"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Validation Status Badge */}
          <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-green-deep/50">
            <div className="flex items-center gap-2">
              {report.valid ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span className={report.valid ? 'text-green-400 font-bold' : 'text-amber-300 font-bold'}>
                {report.valid ? 'SCHEMA COMPLIANT' : `${report.totalErrors} PENDING FIELD(S)`}
              </span>
            </div>
            <span className="text-[11px] text-ink-muted text-white/60">
              Active Step: {currentStep}
            </span>
          </div>

          {/* Validation Errors List (if any) */}
          {!report.valid && report.errors.length > 0 && (
            <div className="max-h-24 overflow-y-auto bg-amber-950/30 p-2 rounded border border-amber-800/50 text-amber-200 text-[11px] flex flex-col gap-1">
              <span className="font-bold text-amber-400 uppercase text-[10px]">Unfilled Schema Keys:</span>
              {report.errors.slice(0, 4).map((err, idx) => (
                <div key={idx} className="truncate">
                  • <span className="font-semibold">{err.path}:</span> {err.message}
                </div>
              ))}
              {report.errors.length > 4 && (
                <span className="text-[10px] text-amber-400/80">+{report.errors.length - 4} more keys</span>
              )}
            </div>
          )}

          {/* Live Structured JSON Stream */}
          <div className="flex-1 overflow-y-auto max-h-[300px] bg-black/60 p-3 rounded-lg border border-green-deep/40 text-[11px] text-green-200/90 leading-relaxed">
            <pre>{jsonString}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
