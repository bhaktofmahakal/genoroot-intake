import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/groq-client';
import { extractStructuredData, SectionTarget } from '@/lib/orca-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const section = (formData.get('section') as SectionTarget) || 'section_A';
    const audioFile = formData.get('audio') as File | null;
    let transcript = formData.get('transcript') as string | null;

    if (!audioFile && (!transcript || transcript.trim() === '')) {
      return NextResponse.json(
        { error: 'Missing required payload. Please provide an audio recording or text transcript.' },
        { status: 400 }
      );
    }

    // Step 1: Transcribe via Groq Whisper if audio file provided
    if (audioFile) {
      console.log(`[API /api/extract] Received audio file (${audioFile.size} bytes, type: ${audioFile.type}) for ${section}`);
      try {
        transcript = await transcribeAudio({
          file: audioFile,
          filename: audioFile.name || 'recording.webm',
        });
        console.log(`[API /api/extract] Whisper Transcript: "${transcript}"`);
      } catch (transcribeError: any) {
        console.error('[API /api/extract] Whisper Transcription Error:', transcribeError);
        return NextResponse.json(
          { error: `Transcription failed: ${transcribeError.message || transcribeError}` },
          { status: 502 }
        );
      }
    }

    if (!transcript || transcript.trim() === '') {
      return NextResponse.json(
        { error: 'Could not extract audible speech from recording.' },
        { status: 422 }
      );
    }

    // Step 2: Extract structured JSON via OrcaRouter Claude Haiku 4.5
    console.log(`[API /api/extract] Extracting structured data for ${section} using Claude Haiku 4.5...`);
    try {
      const extractedData = await extractStructuredData({
        transcript,
        section,
        useCache: true,
      });

      return NextResponse.json({
        success: true,
        section,
        transcript,
        data: extractedData,
      });
    } catch (extractError: any) {
      console.error('[API /api/extract] Haiku Extraction Error:', extractError);
      return NextResponse.json(
        {
          error: `Extraction failed: ${extractError.message || extractError}`,
          transcript, // Return transcript so user doesn't lose raw speech
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('[API /api/extract] Unexpected Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
