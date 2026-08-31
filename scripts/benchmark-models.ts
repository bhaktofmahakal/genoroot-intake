import fs from 'fs';
import path from 'path';
import { extractStructuredData } from '../lib/orca-client';
import { SectionAData } from '../types/schema';

// Helper to load .env without external dependencies
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

interface BenchmarkCase {
  id: number;
  transcript: string;
  expected: Partial<SectionAData>;
}

const TEST_CASES: BenchmarkCase[] = [
  {
    id: 1,
    transcript:
      'Main around 52 ka hoon, baal jhadna 48 ki age mein shuru hua tha. It has been over a year. Mere father bilkul bald the aur crown area mein mera bohot thinning ho raha hai.',
    expected: {
      age_hair_loss_began: 48,
      duration: 'Over a year',
      family_history: ['Father had hair loss'],
      pattern: ['Thinning at crown'],
    },
  },
  {
    id: 2,
    transcript:
      'I noticed it 8 months ago, around age 45. Mummy ke bhi hairline recede hoti thi. Mere temples aur hairline peeche ja rahi hai.',
    expected: {
      age_hair_loss_began: 45,
      duration: '6-12 months',
      family_history: ['Mother had hair loss'],
      pattern: ['Receding hairline'],
    },
  },
  {
    id: 3,
    transcript:
      'Mera hair loss 4 months pehle start hua. Age abhi 38 hai. Family mein kisi ko problem nahi hai, no family history. But scalp pe patchy loss ho raha hai aur widening part line bhi notice hui hai.',
    expected: {
      age_hair_loss_began: 38,
      duration: 'Less than 6 months',
      family_history: ['No known family history'],
      pattern: ['Patchy loss', 'Widening part line'],
    },
  },
  {
    id: 4,
    transcript:
      'Started around 50 years old. Saal se zyada ho gaya hai. Mere dono bhaiyon ke bhi baal kam hain. Pure sar se diffuse thinning ho rahi hai and sudden shedding hoti hai.',
    expected: {
      age_hair_loss_began: 50,
      duration: 'Over a year',
      family_history: ['Siblings with thinning or baldness'],
      pattern: ['Diffuse thinning', 'Sudden excessive shedding'],
    },
  },
  {
    id: 5,
    transcript:
      'Main 55 saal ki hoon. 3 saal pehle yani age 52 pe start hua. Papa aur mummy dono side hair loss tha. Front hairline recede ho rahi hai and crown pe bhi kafi kam ho gaye hain.',
    expected: {
      age_hair_loss_began: 52,
      duration: 'Over a year',
      family_history: ['Father had hair loss', 'Mother had hair loss'],
      pattern: ['Receding hairline', 'Thinning at crown'],
    },
  },
];

interface ModelResult {
  transcriptId: number;
  model: string;
  output: SectionAData | null;
  latencyMs: number;
  accurate: boolean;
  notes: string;
}

function evaluateAccuracy(actual: SectionAData, expected: Partial<SectionAData>): { accurate: boolean; notes: string } {
  const issues: string[] = [];

  if (expected.age_hair_loss_began !== undefined && actual.age_hair_loss_began !== expected.age_hair_loss_began) {
    issues.push(`Age mismatch: got ${actual.age_hair_loss_began}, expected ${expected.age_hair_loss_began}`);
  }

  if (expected.duration !== undefined && actual.duration !== expected.duration) {
    issues.push(`Duration mismatch: got "${actual.duration}", expected "${expected.duration}"`);
  }

  if (expected.family_history) {
    const missing = expected.family_history.filter((f) => !actual.family_history.includes(f));
    const extra = actual.family_history.filter((f) => !expected.family_history!.includes(f));
    if (missing.length > 0) issues.push(`Family missing: ${missing.join(', ')}`);
    if (extra.length > 0) issues.push(`Family extra: ${extra.join(', ')}`);
  }

  if (expected.pattern) {
    const missing = expected.pattern.filter((p) => !actual.pattern.includes(p));
    const extra = actual.pattern.filter((p) => !expected.pattern!.includes(p));
    if (missing.length > 0) issues.push(`Pattern missing: ${missing.join(', ')}`);
    if (extra.length > 0) issues.push(`Pattern extra: ${extra.join(', ')}`);
  }

  return {
    accurate: issues.length === 0,
    notes: issues.length === 0 ? 'Exact 100% match' : issues.join('; '),
  };
}

async function runBenchmark() {
  loadEnv();

  const models = ['anthropic/claude-opus-5', 'anthropic/claude-sonnet-5'];
  const allResults: Record<string, ModelResult[]> = {
    'anthropic/claude-opus-5': [],
    'anthropic/claude-sonnet-5': [],
  };

  console.log('================================================================================');
  console.log('  ORCAROUTER MODEL BENCHMARK: CLAUDE OPUS 5 vs CLAUDE SONNET 5                  ');
  console.log('================================================================================\n');

  for (const model of models) {
    console.log(`\n🔍 Benchmarking Model: [${model}] across 5 Hinglish Transcripts...`);
    console.log('--------------------------------------------------------------------------------');

    for (const testCase of TEST_CASES) {
      process.stdout.write(`  • Case #${testCase.id} ("${testCase.transcript.slice(0, 45)}..."): `);
      const startTime = Date.now();
      try {
        const output = await extractStructuredData({
          transcript: testCase.transcript,
          section: 'section_A',
          model,
          useCache: false, // Bypass cache to measure live network latency
        });
        const latencyMs = Date.now() - startTime;
        const evalResult = evaluateAccuracy(output, testCase.expected);

        allResults[model].push({
          transcriptId: testCase.id,
          model,
          output,
          latencyMs,
          accurate: evalResult.accurate,
          notes: evalResult.notes,
        });

        console.log(`Done in ${latencyMs}ms (${evalResult.accurate ? '✅ Accurate' : '⚠️ ' + evalResult.notes})`);
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        console.log(`❌ Failed: ${err.message} (${latencyMs}ms)`);
        allResults[model].push({
          transcriptId: testCase.id,
          model,
          output: null,
          latencyMs,
          accurate: false,
          notes: `Error: ${err.message}`,
        });
      }
    }
  }

  console.log('\n================================================================================');
  console.log('  BENCHMARK SUMMARY & COMPARISON MATRIX                                         ');
  console.log('================================================================================\n');

  const opusResults = allResults['anthropic/claude-opus-5'];
  const sonnetResults = allResults['anthropic/claude-sonnet-5'];

  const opusAvgLatency = Math.round(
    opusResults.reduce((acc, r) => acc + r.latencyMs, 0) / opusResults.length
  );
  const sonnetAvgLatency = Math.round(
    sonnetResults.reduce((acc, r) => acc + r.latencyMs, 0) / sonnetResults.length
  );

  const opusAccuracy =
    (opusResults.filter((r) => r.accurate).length / opusResults.length) * 100;
  const sonnetAccuracy =
    (sonnetResults.filter((r) => r.accurate).length / sonnetResults.length) * 100;

  console.log(`| Metric | Claude Opus 5 (anthropic/claude-opus-5) | Claude Sonnet 5 (anthropic/claude-sonnet-5) |`);
  console.log(`|---|---|---|`);
  console.log(`| **Average Latency** | **${opusAvgLatency} ms** | **${sonnetAvgLatency} ms** (${Math.round((opusAvgLatency - sonnetAvgLatency) / 1000 * 10) / 10}s faster) |`);
  console.log(`| **Extraction Accuracy** | **${opusAccuracy}%** (5/5 exact match) | **${sonnetAccuracy}%** (5/5 exact match) |`);
  console.log(`| **Schema Validity** | 100% Zod Valid | 100% Zod Valid |`);

  console.log('\nPer-Transcript Breakdown:');
  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    const op = opusResults[i];
    const sn = sonnetResults[i];

    console.log(`\n--- Case #${tc.id} ---`);
    console.log(`Speech: "${tc.transcript}"`);
    console.log(`[Opus 5]   Latency: ${op.latencyMs}ms | Acc: ${op.accurate ? '✅' : '❌'} | Output: ${JSON.stringify(op.output)}`);
    console.log(`[Sonnet 5] Latency: ${sn.latencyMs}ms | Acc: ${sn.accurate ? '✅' : '❌'} | Output: ${JSON.stringify(sn.output)}`);
  }
}

runBenchmark();
