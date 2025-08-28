
'use server';

import {
  imageAnalysisJustification
} from '@/ai/flows/image-analysis-justification';
import {
  audioAnalysisJustification
} from '@/ai/flows/audio-analysis-justification';
import {
  videoAnalysisJustification
} from '@/ai/flows/video-analysis-justification';

import type { ImageAnalysisResult, AudioAnalysisResult, VideoAnalysisResult, AnalysisResult } from '@/types';

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';

// Helper function to process analysis results
const processAnalysis = (
  confidence: number
): Pick<AnalysisResult, 'classification'> => {
  let classification: 'Authentic' | 'Deepfake' | 'Uncertain';
  if (confidence >= 70) {
    classification = 'Deepfake';
  } else if (confidence >= 20) {
    classification = 'Uncertain';
  } else {
    classification = 'Authentic';
  }
  
  return {
    classification,
  };
};

// Helper function to convert file to data URI
const fileToDataUri = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function analyzeImage(formData: FormData): Promise<ImageAnalysisResult> {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file uploaded');
  }

  const imageDataUri = await fileToDataUri(file);

  const result = await imageAnalysisJustification({
    imageDataUri
  });

  const { classification } = processAnalysis(result.confidence);
  
  return {
    overallJustification: result.justification,
    overallConfidence: result.confidence,
    classification,
  };
}

export async function analyzeAudio(formData: FormData): Promise<AudioAnalysisResult> {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file uploaded');
  }
  
  const audioDataUri = await fileToDataUri(file);
  
  const result = await audioAnalysisJustification({
    audioDataUri
  });
  
  const { classification } = processAnalysis(result.confidence);

  return {
    overallJustification: result.justification,
    overallConfidence: result.confidence,
    classification,
  };
}

export async function analyzeVideo(formData: FormData): Promise<VideoAnalysisResult> {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file uploaded');
    }
  
    const videoDataUri = await fileToDataUri(file);
  
    const result = await videoAnalysisJustification({
      videoDataUri
    });

    const { classification } = processAnalysis(result.overallConfidence);
  
    // Ensure we return a plain object
    return {
      overallJustification: result.overallJustification,
      visualJustification: result.visualJustification,
      audioJustification: result.audioJustification,
      overallConfidence: result.overallConfidence,
      visualConfidence: result.visualConfidence,
      audioConfidence: result.audioConfidence,
      hasAudio: result.hasAudio,
      classification: classification,
    };
  }

export async function analyzeVideoWithFFmpeg(formData: FormData): Promise<VideoAnalysisResult> {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file uploaded');

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-analysis-'));
  const inputPath = path.join(tempDir, file.name);
  const framesPath = path.join(tempDir, 'frames');
  const audioPath = path.join(tempDir, 'audio.mp3');
  await fs.mkdir(framesPath);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputPath, buffer);

    const hasAudio = await new Promise<boolean>((resolve) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                resolve(false);
                return;
            }
            const hasAudioStream = metadata.streams.some(s => s.codec_type === 'audio');
            resolve(hasAudioStream);
        });
    });

    const extractFramesPromise = new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .on('error', reject)
        .on('end', () => resolve())
        .outputOptions('-vf', 'fps=0.5')
        .save(path.join(framesPath, 'frame-%d.png'));
    });

    const extractAudioPromise = hasAudio ? new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
            .on('error', reject)
            .on('end', () => resolve())
            .outputOptions('-q:a', '0', '-map', 'a')
            .save(audioPath);
    }) : Promise.resolve();

    await Promise.all([extractFramesPromise, extractAudioPromise]);

    const frameFiles = await fs.readdir(framesPath);
    if (frameFiles.length === 0) {
      throw new Error('Could not extract any frames from the video.');
    }
    
    // Visual analysis
    const frameAnalysisPromises = frameFiles.map(async (frameFile) => {
        const fullPath = path.join(framesPath, frameFile);
        const frameBuffer = await fs.readFile(fullPath);
        const imageDataUri = `data:image/png;base64,${frameBuffer.toString('base64')}`;
        return imageAnalysisJustification({ imageDataUri });
    });
    
    // Audio analysis
    const audioAnalysisPromise = hasAudio ? (async () => {
        const audioBuffer = await fs.readFile(audioPath);
        const audioDataUri = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
        return audioAnalysisJustification({ audioDataUri });
    })() : Promise.resolve(null);
    
    const [frameResults, audioResult] = await Promise.all([
        Promise.all(frameAnalysisPromises),
        audioAnalysisPromise
    ]);

    // Aggregate visual results
    const visualConfidence = frameResults.reduce((sum, r) => sum + r.confidence, 0) / frameResults.length;
    const visualJustification = frameResults.reduce((max, current) => current.confidence > max.confidence ? current : max, frameResults[0]).justification;

    // Get audio results
    const audioConfidence = audioResult?.confidence ?? 0;
    const audioJustification = audioResult?.justification ?? "No audio track was detected in the video.";
    
    // Combine for overall score (e.g., 70% visual, 30% audio)
    const overallConfidence = hasAudio ? (visualConfidence * 0.7) + (audioConfidence * 0.3) : visualConfidence;
    
    const { classification } = processAnalysis(overallConfidence);

    const overallJustification = `Overall assessment based on visual and audio streams. Visual analysis of ${frameFiles.length} frames suggests: ${visualJustification}. ${hasAudio ? `Audio analysis suggests: ${audioJustification}` : ''}`;
    
    return {
      overallJustification,
      visualJustification,
      audioJustification,
      overallConfidence,
      visualConfidence,
      audioConfidence,
      hasAudio,
      classification,
    };

  } finally {
    // Cleanup temporary files
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

export async function analyzeMediaFromUrl(url: string, type: 'image' | 'audio' | 'video') {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch media from URL: ${response.statusText}`);
    }

    const fileBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const fileSize = Number(response.headers.get('content-length')) || fileBuffer.byteLength;
    const fileName = path.basename(new URL(url).pathname) || `media.${type}`;

    const file = new File([fileBuffer], fileName, { type: contentType });

    const formData = new FormData();
    formData.append('file', file);

    let result;
    switch (type) {
      case 'image':
        result = await analyzeImage(formData);
        break;
      case 'audio':
        result = await analyzeAudio(formData);
        break;
      case 'video':
        result = await analyzeVideoWithFFmpeg(formData);
        break;
      default:
        throw new Error('Unsupported media type for URL analysis.');
    }

    return { result, fileName, fileSize, fileType: contentType };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) throw new Error(`Invalid URL or network error. Could not retrieve media.`);
      throw error;
    }
    throw new Error('An unexpected error occurred while analyzing media from URL.');
  }
}
