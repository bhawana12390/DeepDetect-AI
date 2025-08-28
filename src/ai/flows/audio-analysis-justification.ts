'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AudioAnalysisJustificationInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AudioAnalysisJustificationInput = z.infer<
  typeof AudioAnalysisJustificationInputSchema
>;

const AudioAnalysisJustificationOutputSchema = z.object({
  justification: z
    .string()
    .describe('A textual justification of the audio deepfake assessment.'),
  confidence: z
    .number()
    .describe('A confidence score (0-100) on whether the audio is a deepfake.'),
});
export type AudioAnalysisJustificationOutput = z.infer<
  typeof AudioAnalysisJustificationOutputSchema
>;

export async function audioAnalysisJustification(
  input: AudioAnalysisJustificationInput
): Promise<AudioAnalysisJustificationOutput> {
  return audioAnalysisJustificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'audioAnalysisJustificationPrompt',
  input: { schema: AudioAnalysisJustificationInputSchema },
  output: { schema: AudioAnalysisJustificationOutputSchema },
  prompt: `You are an AI expert in deepfake audio analysis. You will be given an audio file to analyze.
  Your task is to determine if the audio is a deepfake.

  Analyze the provided audio data for signs of manipulation. Your assessment should be based on factors like:
  - Unnatural speech patterns, cadence, or intonation.
  - Metallic or robotic artifacts in the voice.
  - Inconsistent or absent background noise.
  - Abrupt cuts or changes in audio quality.

  Based on your analysis of the audio data, generate a confidence score (0-100) indicating the likelihood that the audio is a deepfake.
  - A low score (0-20) should be for audio that sounds completely natural and authentic.
  - A medium score (21-70) should be for audio that has some slightly unusual qualities but lacks definitive proof of being a deepfake.
  - A high score (71-100) should be for audio that exhibits clear and strong evidence of synthesis or manipulation.
  
  Do NOT base any part of your analysis on the file name or any metadata. Your entire analysis must come from the audio content itself.
  
  Provide a creative, plausible, one-paragraph justification for your assessment that explains what you "heard" in the audio. Do not mention the score in the justification.

  Audio: {{media url=audioDataUri}}`,
});

const audioAnalysisJustificationFlow = ai.defineFlow(
  {
    name: 'audioAnalysisJustificationFlow',
    inputSchema: AudioAnalysisJustificationInputSchema,
    outputSchema: AudioAnalysisJustificationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
