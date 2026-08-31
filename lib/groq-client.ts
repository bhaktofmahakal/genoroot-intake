/**
 * Groq Whisper Audio Transcription Client
 * Uses direct fetch to Groq's Whisper API: https://api.groq.com/openai/v1/audio/transcriptions
 * Model: whisper-large-v3-turbo (ultra-low latency transcription)
 */

export interface TranscribeAudioOptions {
  file: File | Blob | Buffer;
  filename?: string;
  language?: string; // e.g. 'en', 'hi' (Whisper automatically handles mixed Hinglish)
  prompt?: string; // Optional context prompt for domain vocabulary (hair, scalp, minoxidil, finasteride, PRP)
  maxRetries?: number;
}

/**
 * Transcribe audio using Groq's Whisper API with exponential backoff on 429 rate limits.
 */
export async function transcribeAudio(options: TranscribeAudioOptions): Promise<string> {
  const {
    file,
    filename = 'audio.webm',
    language,
    prompt = 'Medical hair and scalp intake for GenoRoot clinic. Patient describing hair loss, duration, shedding, crown, hairline, treatments.',
    maxRetries = 3,
  } = options;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is missing.');
  }

  // Convert input to a standard Blob/File object
  let blob: Blob;
  if (file instanceof Blob || file instanceof File) {
    blob = file;
  } else {
    // Buffer in Node.js
    const uint8Array = new Uint8Array(file);
    blob = new Blob([uint8Array], { type: 'audio/webm' });
  }

  let attempt = 0;
  let delay = 1000; // start with 1s delay

  while (attempt < maxRetries) {
    attempt++;
    try {
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('response_format', 'json');
      formData.append('temperature', '0.0');
      if (prompt) formData.append('prompt', prompt);
      if (language) formData.append('language', language);

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429 && attempt < maxRetries) {
          console.warn(`[Groq Whisper] Rate limited (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
          delay *= 2;
          continue;
        }
        throw new Error(`Groq API error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (!result.text) {
        throw new Error('Groq Whisper returned an empty transcription.');
      }

      return result.text.trim();
    } catch (error: any) {
      if (attempt < maxRetries && (error?.message?.includes('429') || error?.name === 'TypeError')) {
        console.warn(`[Groq Whisper] Retryable error (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      } else {
        console.error('[Groq Whisper Error]', error);
        throw new Error(`Groq Whisper transcription failed: ${error?.message || error}`);
      }
    }
  }

  throw new Error('Groq Whisper transcription exceeded maximum retries.');
}
