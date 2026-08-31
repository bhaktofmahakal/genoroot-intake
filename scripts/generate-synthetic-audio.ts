import fs from 'fs';
import path from 'path';

/**
 * Creates a minimal valid synthetic PCM WAV audio buffer for testing binary audio upload handling.
 */
export function createSyntheticWavBuffer(durationSeconds = 1.0, sampleRate = 16000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * blockAlign;
  const chunkSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // 'data' subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Fill with low-level 440Hz sine wave tone
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 440 * t) * 0.1 * 32767;
    buffer.writeInt16LE(Math.floor(sample), offset);
    offset += 2;
  }

  return buffer;
}

const testAudioDir = path.join(process.cwd(), 'scripts', 'test-audio');
if (!fs.existsSync(testAudioDir)) {
  fs.mkdirSync(testAudioDir, { recursive: true });
}

fs.writeFileSync(path.join(testAudioDir, 'sample_q1_4.wav'), createSyntheticWavBuffer(1.5));
console.log('Synthetic test audio file generated at scripts/test-audio/sample_q1_4.wav');
