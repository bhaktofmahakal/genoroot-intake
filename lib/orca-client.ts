import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  SectionASchema,
  SectionBSchema,
  SectionCSchema,
  SectionDSchema,
  SectionESchema,
} from '@/types/schema';

/**
 * OrcaRouter & Groq Cloud Hybrid Structured Field Extraction Engine
 * Primary: OrcaRouter (anthropic/claude-sonnet-5 / claude-opus-5)
 * Automatic High-Speed Fallback: Groq Cloud (openai/gpt-oss-120b / qwen/qwen3.8-27b)
 */

export type SectionTarget = 'section_A' | 'section_B' | 'section_C' | 'section_D' | 'section_E';

// Default extraction models
export const DEFAULT_EXTRACTION_MODEL = 'anthropic/claude-sonnet-5';
export const FALLBACK_GROQ_MODEL = 'openai/gpt-oss-120b';

let orcaClientInstance: OpenAI | null = null;

function getOrcaClient(): OpenAI {
  const apiKey = process.env.ORCAROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('ORCAROUTER_API_KEY environment variable is missing.');
  }

  if (!orcaClientInstance) {
    orcaClientInstance = new OpenAI({
      apiKey,
      baseURL: 'https://api.orcarouter.ai/v1',
    });
  }

  return orcaClientInstance;
}

// --- LOCAL DISK CACHE SYSTEM ---
const CACHE_DIR = process.env.VERCEL ? path.join('/tmp', '.cache') : path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'extract_cache.json');

function getCacheKey(transcript: string, section: SectionTarget, model: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(`${model}:${section}:${transcript.trim()}`);
  return hash.digest('hex');
}

function readCache(key: string): any | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    return data[key] || null;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: any): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const current = fs.existsSync(CACHE_FILE)
      ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
      : {};
    current[key] = data;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(current, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Cache Write Error]:', err);
  }
}

// --- SECTION SYSTEM PROMPTS ---
export const SECTION_PROMPTS: Record<SectionTarget, string> = {
  section_A: `You are an expert clinical intake AI for GenoRoot Trichology Clinic.
Extract Section A (Personal & Family Hair History) from the speech transcript.
The patient may speak in English, Hindi, or conversational Hinglish.

Return ONLY a valid JSON object matching this schema:
{
  "age_hair_loss_began": number | null,
  "duration": "Less than 6 months" | "6–12 months" | "Over a year" | null,
  "family_history": string[],
  "pattern": string[]
}

Available Enum Options (You MUST choose ONLY from these exact strings):
duration: ["Less than 6 months", "6–12 months", "Over a year"]
family_history: [
  "Father had hair loss",
  "Mother had hair loss",
  "Siblings with thinning or baldness",
  "Maternal grandparents",
  "Paternal grandparents",
  "No known family history"
]
pattern: [
  "Receding hairline",
  "Thinning at crown",
  "Widening part line",
  "Diffuse thinning",
  "Patchy loss",
  "Sudden excessive shedding"
]

Rules:
1. If the speaker mentions their age or when shedding started, calculate or extract age_hair_loss_began as an integer.
2. Map colloquial expressions accurately: "saal se zyada" -> "Over a year", "papa/father bald" -> "Father had hair loss", "mummy/mother" -> "Mother had hair loss", "beech ki maang/part line chaudi" -> "Widening part line", "pichle 6 mahine se" -> "Less than 6 months" or "6–12 months".
3. Return ONLY valid JSON, no markdown fences, no conversational prose.`,

  section_B: `You are an expert clinical intake AI for GenoRoot Trichology Clinic.
Extract Section B (Medical Conditions & Symptoms) from the speech transcript.

Return ONLY a valid JSON object matching this schema:
{
  "diagnosed_conditions": string[],
  "menstrual_cycle": "Regular" | "Irregular" | "Postmenopausal" | "Menopausal" | "Perimenopausal" | "PCOS/PCOD" | "Not applicable",
  "pregnancy_related": "Currently pregnant" | "Planning pregnancy" | "Postpartum <1 year" | "Not applicable",
  "adult_acne_oily_skin": boolean,
  "excess_body_facial_hair": boolean
}

Available diagnosed_conditions options:
[
  "Thyroid disorder",
  "PCOS / PCOD",
  "Iron deficiency or Anemia",
  "Autoimmune condition",
  "Diabetes or Insulin resistance",
  "High blood pressure",
  "None of the above"
]

Return ONLY valid JSON.`,

  section_C: `You are an expert clinical intake AI for GenoRoot Trichology Clinic.
Extract Section C (Lifestyle & Environmental Triggers) from the speech transcript.

Return ONLY a valid JSON object matching this schema:
{
  "past_6_months": string[],
  "habits": {
    "smoking": boolean,
    "smoking_severity": "Mild <5/day" | "Moderate 5-10/day" | "Severe >10/day" | null,
    "alcohol": boolean,
    "hard_water": boolean,
    "hair_wash_frequency": "Daily" | "Alternate Days" | "Weekly",
    "heating_tools_styling_chemicals": boolean,
    "salon_treatments": boolean,
    "salon_treatment_detail": string | null
  }
}

Available past_6_months triggers:
[
  "Crash dieting or major weight loss",
  "High stress or emotional trauma",
  "Fever with illness (COVID, Dengue, Typhoid)",
  "Recent surgery",
  "Change in location/water/air quality"
]

Return ONLY valid JSON.`,

  section_D: `You are an expert clinical intake AI for GenoRoot Trichology Clinic.
Extract Section D (Current Hair Care & Past Treatments) from the speech transcript.

Return ONLY a valid JSON object matching this schema:
{
  "products": {
    "OTC/Medicated Shampoos": { "used": boolean, "duration": "<3mo" | "3-6mo" | ">6mo" | null, "helped": boolean | null, "side_effects": boolean | null },
    "Hair Oils/Serums": { "used": boolean, "duration": "<3mo" | "3-6mo" | ">6mo" | null, "helped": boolean | null, "side_effects": boolean | null },
    "Topical Minoxidil": { "used": boolean, "duration": "<3mo" | "3-6mo" | ">6mo" | null, "helped": boolean | null, "side_effects": boolean | null },
    "Oral Minoxidil": { "used": boolean, "duration": "<3mo" | "3-6mo" | ">6mo" | null, "helped": boolean | null, "side_effects": boolean | null },
    "Supplements": { "used": boolean, "duration": "<3mo" | "3-6mo" | ">6mo" | null, "helped": boolean | null, "side_effects": boolean | null }
  },
  "procedures": {
    "PRP/GFC/iPRF": { "done": boolean, "sessions": "1-3" | "4-6" | ">6" | null, "helped": boolean | null },
    "Stem Cells/Exosomes": { "done": boolean, "sessions": "1-3" | "4-6" | ">6" | null, "helped": boolean | null },
    "Hair Transplant": { "done": boolean, "sessions": "1-3" | "4-6" | ">6" | null, "helped": boolean | null },
    "Other": { "done": boolean, "sessions": "1-3" | "4-6" | ">6" | null, "helped": boolean | null }
  },
  "past_treatment_side_effects": boolean,
  "past_treatment_side_effects_describe": string
}

Return ONLY valid JSON.`,

  section_E: `You are an expert clinical intake AI for GenoRoot Trichology Clinic.
Extract Section E (Genomic Sampling Preference & Consent) from the speech transcript.

Return ONLY a valid JSON object matching this schema:
{
  "sample_type": "Saliva" | "Blood" | "Either",
  "consent": boolean
}

Return ONLY valid JSON.`,
};

export interface ExtractSectionOptions {
  transcript: string;
  section: SectionTarget;
  model?: string;
  useCache?: boolean;
  maxRetries?: number;
}

/**
 * Fallback extraction runner using Groq Cloud API
 */
async function extractWithGroq(
  systemPrompt: string,
  transcript: string,
  groqModel: string = FALLBACK_GROQ_MODEL
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is missing for fallback extraction.');
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Patient Transcript:\n"${transcript}"\n\nExtract and return the structured JSON strictly adhering to the schema.`,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq extraction failed [${res.status}]: ${errText}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned an empty response.');
  }
  return content;
}

/**
 * Robust JSON extraction helper
 */
function cleanAndParseJson(content: string): any {
  try {
    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSubstring = content.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonSubstring);
    }
    return {};
  }
}

/**
 * Extract structured medical intake data from patient speech.
 * Automatically tries OrcaRouter first, and seamlessly falls back to Groq Cloud on quota/network issues.
 */
export async function extractStructuredData(options: ExtractSectionOptions): Promise<any> {
  const {
    transcript,
    section,
    model = DEFAULT_EXTRACTION_MODEL,
    useCache = true,
    maxRetries = 2,
  } = options;

  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Transcript text is empty.');
  }

  // 1. Check local cache
  const cacheKey = getCacheKey(transcript, section, model);
  if (useCache) {
    const cached = readCache(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const systemPrompt = SECTION_PROMPTS[section];
  if (!systemPrompt) {
    throw new Error(`Invalid section target: ${section}`);
  }

  let content: string | null = null;
  let attempt = 0;
  let delay = 800;

  // Try Primary Engine (OrcaRouter) with retries
  while (attempt < maxRetries && !content) {
    attempt++;
    try {
      const client = getOrcaClient();
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Patient Transcript:\n"${transcript}"\n\nExtract and return the structured JSON strictly adhering to the schema.`,
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      content = completion.choices[0]?.message?.content || null;
    } catch (orcaError: any) {
      console.warn(
        `[Extraction Service] OrcaRouter ${model} attempt ${attempt} encountered error: ${orcaError.message}`
      );

      const isQuotaOrAuth =
        orcaError?.status === 402 ||
        orcaError?.status === 401 ||
        orcaError?.message?.includes('402') ||
        orcaError?.message?.includes('quota') ||
        orcaError?.message?.includes('credits');

      // If out of credits or max retries reached, immediately break to Groq fallback
      if (isQuotaOrAuth || attempt >= maxRetries) {
        break;
      }

      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }

  // Fallback Engine: Groq Cloud (Ultra-Fast & Reliable)
  if (!content) {
    console.info(`[Extraction Service] Activating Groq Cloud Fallback (${FALLBACK_GROQ_MODEL})...`);
    try {
      content = await extractWithGroq(systemPrompt, transcript, FALLBACK_GROQ_MODEL);
    } catch (groqPrimaryError: any) {
      console.warn(`[Groq Primary Failed]: ${groqPrimaryError.message}. Trying secondary Groq model (qwen/qwen3.8-27b)...`);
      content = await extractWithGroq(systemPrompt, transcript, 'qwen/qwen3.8-27b');
    }
  }

  if (!content) {
    throw new Error('Structured extraction failed across both OrcaRouter and Groq Cloud engines.');
  }

  // Parse JSON
  const parsed = cleanAndParseJson(content);

  // Validate against the Zod schema slice
  let validatedData: any = {};
  if (section === 'section_A') {
    const check = SectionASchema.partial().safeParse(parsed);
    validatedData = check.success ? check.data : parsed;
  } else if (section === 'section_B') {
    const check = SectionBSchema.partial().safeParse(parsed);
    validatedData = check.success ? check.data : parsed;
  } else if (section === 'section_C') {
    const check = SectionCSchema.partial().safeParse(parsed);
    validatedData = check.success ? check.data : parsed;
  } else if (section === 'section_D') {
    const check = SectionDSchema.partial().safeParse(parsed);
    validatedData = check.success ? check.data : parsed;
  } else if (section === 'section_E') {
    const check = SectionESchema.partial().safeParse(parsed);
    validatedData = check.success ? check.data : parsed;
  } else {
    validatedData = parsed;
  }

  // Save to cache
  if (useCache) {
    writeCache(cacheKey, validatedData);
  }

  return validatedData;
}
