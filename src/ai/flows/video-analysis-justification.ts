'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VideoAnalysisJustificationInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VideoAnalysisJustificationInput = z.infer<
  typeof VideoAnalysisJustificationInputSchema
>;

const VideoAnalysisJustificationOutputSchema = z.object({
  overallJustification: z
    .string()
    .describe(
      'A summary textual justification of the overall deepfake assessment, combining visual and audio analysis.'
    ),
  visualJustification: z
    .string()
    .describe(
      'A textual justification of the visual (frame) deepfake assessment.'
    ),
  audioJustification: z
    .string()
    .describe(
      'A textual justification of the audio deepfake assessment. If no audio is present, this should state that.'
    ),
  overallConfidence: z
    .number()
    .describe(
      'An overall confidence score (0-100) on whether the video is a deepfake.'
    ),
  visualConfidence: z
    .number()
    .describe(
      'A confidence score (0-100) on whether the visual frames are a deepfake.'
    ),
  audioConfidence: z
    .number()
    .describe(
      'A confidence score (0-100) on whether the audio track is a deepfake. Should be 0 if no audio is present.'
    ),
  hasAudio: z.boolean().describe('Whether the video contains an audio track.'),
});
export type VideoAnalysisJustificationOutput = z.infer<
  typeof VideoAnalysisJustificationOutputSchema
>;

export async function videoAnalysisJustification(
  input: VideoAnalysisJustificationInput
): Promise<VideoAnalysisJustificationOutput> {
  return videoAnalysisJustificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'videoAnalysisJustificationPrompt',
  input: { schema: VideoAnalysisJustificationInputSchema },
  output: { schema: VideoAnalysisJustificationOutputSchema },
  prompt: `You are an AI expert in multimodal deepfake analysis. You will be given a video file to analyze.
Your task is to determine if the video is a deepfake by analyzing BOTH its visual frames and its audio track.

First, determine if the video contains an audio track. Set the 'hasAudio' flag accordingly.

1.  **Visual Analysis (Frame-by-Frame Simulation):**
    Analyze the video for visual signs of manipulation. Base your assessment on:
    -   Unnatural facial movements or expressions (e.g., inconsistent blinking, odd smiles).
    -   Flickering or inconsistencies around the edges of a person or objects.
    -   Awkward or robotic body movements.
    -   Blurring or distortion in the background.
    -   Inconsistent lighting and shadows across frames.
    Generate a 'visualConfidence' score (0-100) and a 'visualJustification' for your assessment.

2.  **Audio Analysis:**
    If an audio track exists, analyze it for signs of manipulation:
    -   Unnatural speech patterns, cadence, or intonation.
    -   Metallic or robotic artifacts.
    -   Inconsistent or absent background noise.
    -   Abrupt cuts or changes in quality.
    Generate an 'audioConfidence' score (0-100) and an 'audioJustification'. If no audio is present, the score must be 0 and the justification should state "No audio track was detected in the video."

3.  **Overall Assessment:**
    Combine your findings from the visual and audio analyses to provide an 'overallConfidence' score. This score should be a weighted average, with visual analysis having a higher impact.
    Provide a final 'overallJustification' that summarizes why you arrived at your conclusion, referencing both visual and audio evidence if applicable.

Do NOT base any part of your analysis on the file name or any metadata. Your entire analysis must come from the video content itself.

Video: {{media url=videoDataUri}}`,
});

const videoAnalysisJustificationFlow = ai.defineFlow(
  {
    name: 'videoAnalysisJustificationFlow',
    inputSchema: VideoAnalysisJustificationInputSchema,
    outputSchema: VideoAnalysisJustificationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
