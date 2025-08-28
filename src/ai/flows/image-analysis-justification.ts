'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ImageAnalysisJustificationInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a person or scene, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageAnalysisJustificationInput = z.infer<
  typeof ImageAnalysisJustificationInputSchema
>;

const ImageAnalysisJustificationOutputSchema = z.object({
  justification: z
    .string()
    .describe('A textual justification of the image deepfake assessment.'),
  confidence: z
    .number()
    .describe('A confidence score (0-100) on whether the image is a deepfake.'),
});
export type ImageAnalysisJustificationOutput = z.infer<
  typeof ImageAnalysisJustificationOutputSchema
>;

export async function imageAnalysisJustification(
  input: ImageAnalysisJustificationInput
): Promise<ImageAnalysisJustificationOutput> {
  return imageAnalysisJustificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageAnalysisJustificationPrompt',
  input: { schema: ImageAnalysisJustificationInputSchema },
  output: { schema: ImageAnalysisJustificationOutputSchema },
  prompt: `You are an AI expert in deepfake image analysis. You will be given an image to analyze.
  Your task is to determine if the image is a deepfake.

  Analyze the provided image for signs of digital manipulation. Your assessment should be based on visual evidence within the image, such as:
  - Inconsistent lighting, shadows, or reflections.
  - Unnatural textures on skin or other surfaces.
  - Strange artifacts around edges (e.g., around a person's hair).
  - Asymmetry in facial features or distorted backgrounds.
  - Lack of fine details like pores or subtle imperfections.

  Based on your analysis of the image data, generate a confidence score (0-100) indicating the likelihood that the image is a deepfake.
  - A low score (0-20) should be for images that appear completely natural and authentic, with consistent lighting and fine details.
  - A medium score (21-70) should be for images that have some suspicious but not conclusive elements, like slightly soft focus or minor inconsistencies.
  - A high score (71-100) should be for images that exhibit clear and strong evidence of digital generation or manipulation.
  
  Do NOT base any part of your analysis on the file name or any metadata. Your entire analysis must come from the image content itself.
  
  Provide a creative, plausible, one-paragraph justification for your assessment that explains what you "saw" in the image. Do not mention the score in the justification.

  Image: {{media url=imageDataUri}}`,
});

const imageAnalysisJustificationFlow = ai.defineFlow(
  {
    name: 'imageAnalysisJustificationFlow',
    inputSchema: ImageAnalysisJustificationInputSchema,
    outputSchema: ImageAnalysisJustificationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
