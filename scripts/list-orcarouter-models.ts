import fs from 'fs';
import path from 'path';

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

async function listModels() {
  loadEnv();
  const apiKey = process.env.ORCAROUTER_API_KEY;
  if (!apiKey) {
    console.error('Missing ORCAROUTER_API_KEY');
    return;
  }

  try {
    const res = await fetch('https://api.orcarouter.ai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch models:', res.status, await res.text());
      return;
    }

    const data = await res.json();
    console.log('Total models available:', data.data?.length);
    const anthropicModels = data.data?.filter((m: any) =>
      m.id.toLowerCase().includes('anthropic') || m.id.toLowerCase().includes('claude')
    );
    console.log('\nAnthropic / Claude Models on OrcaRouter:');
    anthropicModels.forEach((m: any) => {
      console.log(`- ${m.id}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

listModels();
