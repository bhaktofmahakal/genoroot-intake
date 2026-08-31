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
 * OrcaRouter Client for Claude Structured Field Extraction
 * Uses OpenAI-compatible API endpoint: https://api.orcarouter.ai/v1
 */

export type SectionTarget = 'section_A' | 'section_B' | 'section_C' | 'section_D' | 'section_E';

// Default extraction model (winner locked after comparative benchmark)
export const DEFAULT_EXTRACTION_MODEL = 'anthropic/claude-sonnet-5';

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
const CACHE_DIR = path.join(process.cwd(), '.cache');
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

function writeCache(key: string, value: any): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    let data: Record<string, any> = {};
    if (fs.existsSync(CACHE_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      } catch {
        data = {};
      }
    }
    data[key] = value;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Cache Write Error]', err);
  }
}

// --- SYSTEM PROMPT INSTRUCTIONS PER SECTION ---

const SECTION_PROMPTS: Record<SectionTarget, string> = {
  section_A: `You are an expert clinical intake parser for GenoRoot Hair & Scalp Clinic.
Extract Section A (Personal & Family Hair Loss History) from patient speech (English, Hindi, or Hinglish).

Target JSON Schema for Section A:
{
  "age_hair_loss_began": number, // e.g. 48 (Age when hair loss started)
  "duration": "Less than 6 months" | "6-12 months" | "Over a year", // Duration of hair loss problem
  "family_history": ("Father had hair loss" | "Mother had hair loss" | "Siblings with thinning or baldness" | "No known family history")[],
  "pattern": ("Receding hairline" | "Thinning at crown" | "Widening part line" | "Diffuse thinning" | "Patchy loss" | "Sudden excessive shedding")[]
}

Rules:
1. Handle Hinglish numbers (e.g. "chaalis" -> 40, "pachaas" -> 50, "around 48" -> 48, "unpachaas" -> 49).
2. If patient mentions father/papa/pitaji had balding/hair loss -> include "Father had hair loss".
3. If patient mentions mother/mummy/maa had thinning -> include "Mother had hair loss".
4. If family has no hair loss -> ["No known family history"].
5. For duration:
   - < 6 months -> "Less than 6 months"
   - 6 to 12 months (e.g. "8 months", "saal bhar se thoda kam") -> "6-12 months"
   - > 1 year (e.g. "2 years", "kafi saal", "over a year") -> "Over a year"
6. Output ONLY valid, parseable JSON matching the exact schema. No markdown wrapping, no extra keys.`,

  section_B: `You are an expert clinical intake parser for GenoRoot Hair & Scalp Clinic.
Extract Section B (Hormonal & Health Influences) from patient speech.

Target JSON Schema for Section B:
{
  "diagnosed_conditions": ("PCOS/PCOD" | "Thyroid disorder" | "Diabetes" | "Autoimmune disease" | "Anemia" | "None")[],
  "menstrual_cycle": "Regular" | "Irregular" | "Menopausal" | "Not applicable",
  "pregnancy_related": "Currently pregnant" | "Postpartum <1 year" | "Not applicable",
  "adult_acne_oily_skin": boolean,
  "excess_body_facial_hair": boolean
}

Rules:
- Default conditions to ["None"] if no conditions diagnosed.
- If male patient or not applicable, set menstrual_cycle to "Not applicable" and pregnancy_related to "Not applicable".
- Output ONLY valid JSON.`,

  section_C: `You are an expert clinical intake parser for GenoRoot Hair & Scalp Clinic.
Extract Section C (Lifestyle & Environmental Triggers) from patient speech.

Target JSON Schema for Section C:
{
  "past_6_months": ("Crash dieting or major weight loss" | "High stress or emotional trauma" | "Fever with illness (COVID, Dengue, Typhoid)" | "Recent surgery" | "Change in location/water/air quality")[],
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

Output ONLY valid JSON.`,

  section_D: `You are an expert clinical intake parser for GenoRoot Hair & Scalp Clinic.
Extract Section D (Current Hair Care & Treatments) from patient speech.

Target JSON Schema for Section D:
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
  "past_treatment_side_effects_describe": string | null
}

Output ONLY valid JSON.`,

  section_E: `You are an expert clinical intake parser for GenoRoot Hair & Scalp Clinic.
Extract Section E (Sample Collection & Consent) from patient speech.

Target JSON Schema for Section E:
{
  "sample_type": "Saliva" | "Blood" | "Either",
  "consent": boolean
}

Output ONLY valid JSON.`,
};

export interface ExtractSectionOptions {
  transcript: string;
  section: SectionTarget;
  model?: string;
  useCache?: boolean;
  maxRetries?: number;
}

/**
 * Extract structured medical intake JSON from transcript using OrcaRouter (Claude model)
 */
export async function extractStructuredData(options: ExtractSectionOptions): Promise<any> {
  const {
    transcript,
    section,
    model = DEFAULT_EXTRACTION_MODEL,
    useCache = true,
    maxRetries = 3,
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

  const client = getOrcaClient();
  const systemPrompt = SECTION_PROMPTS[section];
  if (!systemPrompt) {
    throw new Error(`Invalid section target: ${section}`);
  }

  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    attempt++;
    try {
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

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`OrcaRouter ${model} returned an empty response.`);
      }

      // Robust Markdown JSON stripping
      let rawJson = content.trim();
      if (rawJson.startsWith('```json')) {
        rawJson = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      } else if (rawJson.startsWith('```')) {
        rawJson = rawJson.replace(/^```\s*/i, '').replace(/```\s*$/, '');
      }
      rawJson = rawJson.trim();

      // Parse JSON
      const parsed = JSON.parse(rawJson);

      // Validate against the Zod schema slice
      let validatedData: any;
      if (section === 'section_A') {
        validatedData = SectionASchema.parse(parsed);
      } else if (section === 'section_B') {
        validatedData = SectionBSchema.parse(parsed);
      } else if (section === 'section_C') {
        validatedData = SectionCSchema.parse(parsed);
      } else if (section === 'section_D') {
        validatedData = SectionDSchema.parse(parsed);
      } else if (section === 'section_E') {
        validatedData = SectionESchema.parse(parsed);
      } else {
        validatedData = parsed;
      }

      // Save to cache
      if (useCache) {
        writeCache(cacheKey, validatedData);
      }

      return validatedData;
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes('429') ||
        error?.message?.includes('rate_limit');
      const isNetworkError =
        error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT';

      if ((isRateLimit || isNetworkError) && attempt < maxRetries) {
        console.warn(
          `[OrcaRouter ${model}] Rate limited or network error (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`
        );
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      } else {
        console.error(`[OrcaRouter ${model} Error]`, error);
        throw new Error(`OrcaRouter ${model} extraction failed: ${error?.message || error}`);
      }
    }
  }

  throw new Error(`OrcaRouter ${model} extraction exceeded maximum retries.`);
}
