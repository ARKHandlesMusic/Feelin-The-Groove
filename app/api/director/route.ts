import {GoogleGenAI, ThinkingLevel} from '@google/genai';
import {NextRequest, NextResponse} from 'next/server';
import {SHOTS, SONG_METADATA} from '@/lib/timeline';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {query, currentTime = 0, shotId} = body as {
      query?: string;
      currentTime?: number;
      shotId?: string;
    };

    const currentShot =
      SHOTS.find((s) => s.id === shotId) ||
      SHOTS.find((s) => currentTime >= s.startTime && currentTime < s.endTime) ||
      SHOTS[0];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return NextResponse.json({
        analysis: `Director Breakdown for "${currentShot.title}" (${currentShot.startTime.toFixed(1)}s–${currentShot.endTime.toFixed(1)}s): ${currentShot.narrativePurpose} Spark performs "${currentShot.sparkAction}" on the ahead-of-beat bounce while Beat executes "${currentShot.beatAction}" with syncopated hold-snap-hold timing. Beat's chest hollow ring is in [${currentShot.hollowRingState}] state and the deadline motif is [${currentShot.deadlineState}].`,
        model: 'gemini-4-argon (Offline Blueprint Mode)',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are the Omniframe Music Video Director for "${SONG_METADATA.title}" by ${SONG_METADATA.artist} (${SONG_METADATA.bpm} BPM Dance-Pop).
Current Shot: ${currentShot.title} (${currentShot.startTime}s - ${currentShot.endTime}s)
Lyric: "${currentShot.lyric}"
Purpose: ${currentShot.narrativePurpose}
Hollow Ring Motif State: ${currentShot.hollowRingState}
Deadline Clock/Sun State: ${currentShot.deadlineState}
Provide a concise, insightful 3-sentence director's commentary explaining the choreography, camera framing, and emotional symbolism of this moment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents:
        query?.trim() ||
        `Analyze the choreography, syncopated timing, and visual symbolism of shot "${currentShot.title}".`,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    return NextResponse.json({
      analysis:
        response.text ||
        `Director Note for ${currentShot.title}: ${currentShot.narrativePurpose}`,
      model: 'gemini-4-argon (ThinkingLevel.HIGH)',
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      analysis: `Omniframe Blueprint Note: Syncopated 122 BPM off-beat snap choreography active. (${errMsg})`,
      model: 'gemini-4-argon',
    });
  }
}
