export type AnalysisResult = {
  classification: 'Authentic' | 'Deepfake' | 'Uncertain';
  overallConfidence: number;
  overallJustification: string;
};

export type ImageAnalysisResult = AnalysisResult;

export type AudioAnalysisResult = AnalysisResult;

export type VideoAnalysisResult = AnalysisResult & {
  visualConfidence: number;
  audioConfidence: number;
  visualJustification: string;
  audioJustification: string;
  hasAudio: boolean;
};

export type AnalysisResultItem = (ImageAnalysisResult | AudioAnalysisResult | VideoAnalysisResult) & {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video';
  filePreview?: string | null;
  sourceUrl?: string;
  fileSize?: number | null;
  fileType?: string | null;
};
