'use client';

import React from 'react';
import { Mic, Square, Loader2, AlertCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MicButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  recordingDuration?: number;
  audioLevels?: number[];
  onStart: () => void;
  onStop: () => void;
  error?: string | null;
  className?: string;
  helperText?: string;
  title?: string;
  scopeText?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  isRecording,
  isProcessing,
  recordingDuration = 0,
  audioLevels = [10, 24, 38, 24, 12],
  onStart,
  onStop,
  error,
  className,
  helperText = 'e.g., "Started at age 48, father had hair loss, thinning at crown"',
  title = 'Voice Copilot — Speak to Auto-Fill',
  scopeText = 'Answers questions in this section in one go',
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={cn('w-full flex flex-col items-center gap-3 my-2', className)}>
      {/* 1. Listening Active State */}
      {isRecording ? (
        <div className="w-full bg-surface-tint-warm border-2 border-terracotta rounded-card p-5 flex flex-col items-center gap-4 transition-all duration-200 animate-in fade-in zoom-in-95 shadow-md">
          {/* Header Pulse & Live Duration */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-terracotta"></span>
              </span>
              <span className="text-[16px] font-bold text-terracotta-dark">
                Listening... ({formatTime(recordingDuration)})
              </span>
            </div>
            <span className="text-[13px] font-medium text-terracotta-dark bg-white/70 px-2.5 py-0.5 rounded-full border border-terracotta/30">
              Speak naturally in English or Hinglish
            </span>
          </div>

          {/* Live Soundwave Audio Visualizer */}
          <div className="flex items-center justify-center gap-1.5 h-12 my-1">
            {audioLevels.map((lvl, idx) => (
              <div
                key={idx}
                className="w-2.5 rounded-full bg-terracotta transition-all duration-75"
                style={{
                  height: `${Math.max(10, Math.min(46, lvl))}px`,
                }}
              />
            ))}
          </div>

          <p className="text-[14px] text-ink-secondary text-center -mt-1">
            When finished speaking, tap below to process and auto-fill your answers.
          </p>

          {/* Big Thumb-Sized Done Speaking Button */}
          <button
            type="button"
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2.5 min-h-[52px] px-6 rounded-card bg-terracotta hover:bg-terracotta-dark text-white font-bold text-[17px] active:scale-[0.985] transition-all shadow-md"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>Done Speaking (Tap to Auto-Fill)</span>
          </button>
        </div>
      ) : isProcessing ? (
        /* 2. Processing State */
        <div className="w-full bg-surface-tint-sage border-2 border-green-primary/50 rounded-card p-6 flex flex-col items-center justify-center gap-3 text-center transition-all shadow-sm">
          <Loader2 className="w-7 h-7 text-green-primary animate-spin" />
          <div className="flex flex-col gap-1">
            <span className="text-[17px] font-bold text-green-deep">
              Analyzing speech with AI...
            </span>
            <span className="text-[14px] text-ink-secondary">
              Transcribing with Groq Whisper and extracting answers into the form below
            </span>
          </div>
        </div>
      ) : (
        /* 3. Idle / Start Voice Prompt Card with Step-by-Step Guidance */
        <div className="w-full bg-surface-card border-2 border-green-accent/40 hover:border-green-primary/60 rounded-card p-5 flex flex-col gap-4 shadow-card transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-tint-sage text-green-primary flex items-center justify-center flex-shrink-0 shadow-xs">
                <Mic className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[17px] sm:text-[18px] font-bold text-green-deep">
                    {title}
                  </span>
                  <span className="inline-flex whitespace-nowrap items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-surface-tint-sage text-green-deep border border-green-primary/30 px-2 py-0.5 rounded-md flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-green-primary" /> Voice AI
                  </span>
                </div>
                <div className="text-[13px] text-ink-muted">
                  {scopeText}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onStart}
              className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 min-h-[50px] px-6 rounded-card bg-green-primary hover:bg-green-deep text-white font-semibold text-[16px] active:scale-[0.985] transition-all shadow-sm"
            >
              <Mic className="w-4 h-4" />
              <span>Tap to Speak</span>
            </button>
          </div>

          {/* Micro Instructions & Voice Example */}
          <div className="bg-canvas p-3.5 rounded-lg border border-border-subtle flex flex-col gap-2 text-[13px] text-ink-secondary">
            <div className="flex items-start gap-2">
              <span className="font-bold text-green-deep">💡 Example to say:</span>
              <span className="italic text-ink-primary font-medium">{helperText}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-ink-muted border-t border-border-subtle/60 pt-2">
              <span>👉 <strong>How it works:</strong> Tap &ldquo;Tap to Speak&rdquo; ➔ Speak your details ➔ Tap &ldquo;Done Speaking&rdquo; ➔ Review answers &amp; tap &ldquo;Continue&rdquo; below.</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Recovery Banner */}
      {error && (
        <div className="w-full flex items-start gap-2.5 p-4 rounded-card bg-red-50 border border-red-200 text-red-800 text-[14px]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <span className="font-semibold block">Microphone / Extraction Notice</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
