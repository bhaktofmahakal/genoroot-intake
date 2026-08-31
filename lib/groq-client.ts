import OpenAI from 'openai';

/**
 * Groq Whisper Audio Transcription Client
 * Uses OpenAI-compatible API endpoint: https://api.groq.com/openai/v1
 * Model: whisper-large-v3-turbo (ultra-low latency transcription)
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;

let groqClientInstance: OpenAI | null = null;

function getGroqClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY || GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is missing.');
  }

  if (!groqClientInstance) {
    groqClientInstance = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  return groqClientInstance;
}

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

  const client = getGroqClient();

  // Convert to a File object acceptable by the OpenAI client
  let fileToUpload: File;
  if (file instanceof File) {
    fileToUpload = file;
  } else if (file instanceof Blob) {
    fileToUpload = new File([file], filename, { type: file.type || 'audio/webm' });
  } else {
    // Buffer in Node.js
    const uint8Array = new Uint8Array(file);
    fileToUpload = new File([uint8Array], filename, { type: 'audio/webm' });
  }

  let attempt = 0;
  let delay = 1000; // start with 1s delay

  while (attempt < maxRetries) {
    attempt++;
    try {
      const response = await client.audio.transcriptions.create({
        file: fileToUpload,
        model: 'whisper-large-v3-turbo',
        prompt,
        response_format: 'json',
        temperature: 0.0,
        ...(language ? { language } : {}),
      });

      if (!response.text) {
        throw new Error('Groq Whisper returned an empty transcription.');
      }

      return response.text.trim();
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.message?.includes('rate_limit') || error?.message?.includes('429');
      const isNetworkError = error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT';

      if ((isRateLimit || isNetworkError) && attempt < maxRetries) {
        console.warn(`[Groq Whisper] Rate limited or network error (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // exponential backoff
      } else {
        console.error('[Groq Whisper Error]', error);
        throw new Error(`Groq Whisper transcription failed: ${error?.message || error}`);
      }
    }
  }

  throw new Error('Groq Whisper transcription exceeded maximum retries.');
}
