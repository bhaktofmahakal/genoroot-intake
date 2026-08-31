'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseMediaRecorderReturn {
  isRecording: boolean;
  isProcessing: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  recordingDuration: number;
  audioLevels: number[];
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  resetRecording: () => void;
}

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>([10, 20, 40, 25, 15]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const updateAudioLevels = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Extract 5 representative audio bands for waveform animation
    const step = Math.floor(dataArray.length / 5);
    const levels = [
      Math.max(8, (dataArray[step * 0] / 255) * 36),
      Math.max(12, (dataArray[step * 1] / 255) * 44),
      Math.max(16, (dataArray[step * 2] / 255) * 52),
      Math.max(12, (dataArray[step * 3] / 255) * 44),
      Math.max(8, (dataArray[step * 4] / 255) * 36),
    ];
    setAudioLevels(levels);

    animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];
    setRecordingDuration(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Audio analysis for live visual waveform
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext visualization setup failed:', audioCtxErr);
      }

      // Check supported MIME types for cross-browser iOS/Android compatibility
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = ''; // Let browser choose default
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100); // Collect data every 100ms
      setIsRecording(true);

      // Duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('[MediaRecorder Start Error]', err);
      setError(err.message || 'Microphone permission was denied.');
      setIsRecording(false);
    }
  }, [audioUrl]);

  useEffect(() => {
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRecording, updateAudioLevels]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsProcessing(true);

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setIsProcessing(false);

        // Cleanup audio tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }

        resolve(blob);
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const resetRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
    setIsProcessing(false);
    setRecordingDuration(0);
    setError(null);
  }, [audioUrl]);

  return {
    isRecording,
    isProcessing,
    audioBlob,
    audioUrl,
    recordingDuration,
    audioLevels,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
