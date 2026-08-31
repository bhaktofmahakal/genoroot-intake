'use client';

import React from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
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
  helperText = 'Speak naturally in English or Hinglish',
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={cn('w-full flex flex-col items-center gap-3 my-2', className)}>
      {/* Listening State Card */}
      {isRecording ? (
        <div className="w-full bg-surface-tint-warm border-2 border-terracotta rounded-card p-5 flex flex-col items-center gap-4 transition-all duration-200 animate-in fade-in zoom-in-95 shadow-md">
          {/* Header Pulse & Timer */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-terracotta"></span>
              </span>
              <span className="text-[15px] font-semibold text-terracotta-dark">
                Listening... ({formatTime(recordingDuration)})
              </span>
            </div>
            <span className="text-[13px] text-ink-muted">Speak clearly</span>
          </div>

          {/* Live Organic Audio Waveform */}
          <div className="flex items-center justify-center gap-1.5 h-10 my-1">
            {audioLevels.map((lvl, idx) => (
              <div
                key={idx}
                className="w-2 rounded-full bg-terracotta transition-all duration-75"
                style={{
                  height: `${Math.max(8, Math.min(40, lvl))}px`,
                }}
              />
            ))}
          </div>

          {/* Stop / Submit Button */}
          <button
            type="button"
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2 min-h-[50px] px-6 rounded-card bg-terracotta hover:bg-terracotta-dark text-white font-semibold text-[17px] active:scale-[0.98] transition-all shadow-sm"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>Done Speaking (Tap to Process)</span>
          </button>
        </div>
      ) : isProcessing ? (
        /* Processing State */
        <div className="w-full bg-surface-tint-sage border border-green-primary/40 rounded-card p-5 flex flex-col items-center justify-center gap-2 text-center transition-all">
          <Loader2 className="w-6 h-6 text-green-primary animate-spin" />
          <span className="text-[16px] font-semibold text-green-deep">
            Analyzing speech with Claude Haiku...
          </span>
          <span className="text-[14px] text-ink-muted">
            Transcribing audio and filling your form fields
          </span>
        </div>
      ) : (
        /* Idle Voice Prompt Card */
        <div className="w-full bg-surface-card border border-border-hairline rounded-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-card hover:border-green-primary/50 transition-all">
          <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
            <div className="w-12 h-12 rounded-full bg-surface-tint-sage text-green-primary flex items-center justify-center flex-shrink-0">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[16px] sm:text-[17px] font-semibold text-ink-primary">
                Prefer to speak your answer?
              </div>
              <div className="text-[14px] text-ink-muted">
                {helperText}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-card bg-green-primary hover:bg-green-deep text-white font-medium text-[16px] active:scale-[0.98] transition-all shadow-sm"
          >
            <Mic className="w-4 h-4" />
            <span>Tap to Speak</span>
          </button>
        </div>
      )}

      {/* Error Recovery Banner */}
      {error && (
        <div className="w-full flex items-start gap-2.5 p-3.5 rounded-card bg-red-50 border border-red-200 text-red-800 text-[14px]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <span className="font-semibold">Voice intake notice: </span>
            {error}
            <div className="text-[13px] text-red-700 mt-1">
              You can still tap the options manually below.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
