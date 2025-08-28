
'use client';

import { useState, useEffect, useId } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/file-uploader';
import { AnalysisResultCard } from '@/components/analysis-result-card';
import { analyzeImage, analyzeAudio, analyzeVideoWithFFmpeg, analyzeMediaFromUrl } from '@/lib/actions';
import type { ImageAnalysisResult, AudioAnalysisResult, VideoAnalysisResult, AnalysisResultItem } from '@/types';
import { useToast } from "@/hooks/use-toast"
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { Loader2, Upload, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

type AnalysisState<T> = {
  file: File | null;
  filePreview: string | null;
  result: T | null;
  isLoading: boolean;
  fileName: string | null;
  url: string;
  inputType: 'upload' | 'url';
  fileSize: number | null;
  fileType: string | null;
};

type AnalysisTabsProps = {
  onAnalysisComplete: (result: AnalysisResultItem) => void;
  selectedResult: AnalysisResultItem | null;
};


export default function AnalysisTabs({ onAnalysisComplete, selectedResult }: AnalysisTabsProps) {
  const { toast } = useToast();
  const uniqueId = useId();

  const [activeTab, setActiveTab] = useState(selectedResult?.type || 'image');
  
  const initialImageState: AnalysisState<ImageAnalysisResult> = { file: null, filePreview: null, result: null, isLoading: false, fileName: null, url: '', inputType: 'upload', fileSize: null, fileType: null };
  const initialAudioState: AnalysisState<AudioAnalysisResult> = { file: null, filePreview: null, result: null, isLoading: false, fileName: null, url: '', inputType: 'upload', fileSize: null, fileType: null };
  const initialVideoState: AnalysisState<VideoAnalysisResult> = { file: null, filePreview: null, result: null, isLoading: false, fileName: null, url: '', inputType: 'upload', fileSize: null, fileType: null };

  const [imageState, setImageState] = useState<AnalysisState<ImageAnalysisResult>>(initialImageState);
  const [audioState, setAudioState] = useState<AnalysisState<AudioAnalysisResult>>(initialAudioState);
  const [videoState, setVideoState] = useState<AnalysisState<VideoAnalysisResult>>(initialVideoState);
  
  useEffect(() => {
    if (selectedResult) {
      setActiveTab(selectedResult.type);
      const stateSetterMap = {
        image: setImageState,
        audio: setAudioState,
        video: setVideoState,
      };
      const setter = stateSetterMap[selectedResult.type];

      if (setter) {
        // Reset all states before setting the selected one
        setImageState(initialImageState);
        setAudioState(initialAudioState);
        setVideoState(initialVideoState);

        setter({
          file: null, 
          fileName: selectedResult.name,
          filePreview: selectedResult.filePreview || null,
          result: selectedResult as any,
          isLoading: false,
          url: selectedResult.sourceUrl || '',
          inputType: selectedResult.sourceUrl ? 'url' : 'upload',
          fileSize: selectedResult.fileSize || null,
          fileType: selectedResult.fileType || null,
        });
      }
    }
  }, [selectedResult]);


  const handleFileChange = <T,>(setter: React.Dispatch<React.SetStateAction<AnalysisState<T>>>) => (file: File | null) => {
    if (file) {
      const filePreview = URL.createObjectURL(file);
      setter(prev => ({ ...prev, file, filePreview, result: null, isLoading: false, fileName: file.name, url: '', fileSize: file.size, fileType: file.type }));
    } else {
      setter(prev => ({ ...prev, file: null, filePreview: null, result: null, isLoading: false, fileName: null, fileSize: null, fileType: null }));
    }
  };

  const handleUrlChange = <T,>(setter: React.Dispatch<React.SetStateAction<AnalysisState<T>>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(prev => ({...prev, url: event.target.value, fileName: null, file: null, filePreview: null, result: null }));
  };

  const handleInputTypeChange = <T,>(setter: React.Dispatch<React.SetStateAction<AnalysisState<T>>>) => (value: 'upload' | 'url') => {
    setter(prev => ({...initialImageState, inputType: value, result: null}));
  }

  const handleAnalyze = async (type: 'image' | 'audio' | 'video') => {
    const stateSetterMap = {
        image: { state: imageState, setter: setImageState, analysisFn: analyzeImage },
        audio: { state: audioState, setter: setAudioState, analysisFn: analyzeAudio },
        video: { state: videoState, setter: setVideoState, analysisFn: analyzeVideoWithFFmpeg },
    };

    const { state, setter, analysisFn } = stateSetterMap[type];
    
    if (state.inputType === 'upload' && !state.file) {
        toast({ title: "No file selected", description: "Please upload a file to analyze.", variant: "destructive" });
        return;
    }
    if (state.inputType === 'url' && !state.url) {
        toast({ title: "No URL provided", description: "Please enter a URL to analyze.", variant: "destructive" });
        return;
    }

    setter(prev => ({ ...prev, isLoading: true, result: null }));

    try {
        let result;
        let sourceName: string;
        let sourceUrl: string | undefined;
        let filePreview: string | null = state.filePreview;
        let fileSize: number | null = state.fileSize;
        let fileType: string | null = state.fileType;


        if (state.inputType === 'upload' && state.file) {
            const formData = new FormData();
            formData.append('file', state.file);
            result = await analysisFn(formData);
            sourceName = state.file.name;
        } else if (state.inputType === 'url' && state.url) {
            const analysisResult = await analyzeMediaFromUrl(state.url, type);
            result = analysisResult.result;
            sourceName = analysisResult.fileName;
            sourceUrl = state.url;
            filePreview = sourceUrl; // Use the URL for preview
            fileSize = analysisResult.fileSize;
            fileType = analysisResult.fileType;
            setter(prev => ({ ...prev, filePreview: sourceUrl, fileName: sourceName, fileSize, fileType }));
        } else {
            throw new Error("Invalid state for analysis.");
        }
      
      setter(prev => ({ ...prev, result: result as any, isLoading: false }));

      if (onAnalysisComplete) {
        onAnalysisComplete({
          ...(result as any),
          id: `${uniqueId}-${Date.now()}`,
          name: sourceName,
          type,
          filePreview: filePreview,
          sourceUrl,
          fileSize: fileSize,
          fileType: fileType,
        });
      }

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong during the analysis. Please try again.";
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setter(prev => ({ ...prev, isLoading: false }));
    }
  };

  const renderTabContent = (
    type: 'image' | 'audio' | 'video'
  ) => {
    const commonProps = {
      image: {
        title: 'Image Analysis',
        description: 'Upload an image file or provide an image URL to detect if it is a deepfake.',
        accept: 'image/*',
        state: imageState,
        setter: setImageState,
      },
      audio: {
        title: 'Audio Analysis',
        description: 'Upload an audio file or provide an audio URL to detect if it is a deepfake.',
        accept: 'audio/*',
        state: audioState,
        setter: setAudioState,
      },
      video: {
        title: 'Video Analysis',
        description: 'Upload a video file or provide a video URL to detect if it is a deepfake.',
        accept: 'video/*',
        state: videoState,
        setter: setVideoState,
      },
    };
  
    const { title, description, accept, state, setter } = commonProps[type];

    return (
      <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-1 bg-muted rounded-lg flex w-full">
            <Button
              variant={state.inputType === 'upload' ? 'default' : 'ghost'}
              className={cn("w-full", state.inputType === 'upload' ? 'bg-background shadow-sm' : '')}
              onClick={() => handleInputTypeChange(setter)('upload')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
            <Button
              variant={state.inputType === 'url' ? 'default' : 'ghost'}
              className={cn("w-full", state.inputType === 'url' ? 'bg-background shadow-sm' : '')}
              onClick={() => handleInputTypeChange(setter)('url')}
            >
              <Link className="mr-2 h-4 w-4" />
              From URL
            </Button>
          </div>

          {state.inputType === 'upload' ? (
            <FileUploader 
                onFileChange={handleFileChange(setter)} 
                accept={accept} 
                fileName={state.fileName}
                filePreview={state.filePreview}
                mediaType={type}
                fileSize={state.fileSize}
                fileType={state.fileType}
              />
          ) : (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor={`url-input-${type}`}>Media URL</Label>
                    <Input id={`url-input-${type}`} type="url" placeholder="https://example.com/media.jpg" value={state.url} onChange={handleUrlChange(setter)} />
                </div>
                {state.filePreview && (
                  <>
                    <Separator />
                    <FileUploader 
                      onFileChange={() => {}}
                      accept={accept}
                      fileName={state.fileName}
                      filePreview={state.filePreview}
                      mediaType={type}
                      fileSize={state.fileSize}
                      fileType={state.fileType}
                    />
                  </>
                )}
            </div>
          )}
          
          <Button
            onClick={() => handleAnalyze(type)}
            disabled={state.isLoading || (state.inputType === 'upload' && !state.fileName) || (state.inputType === 'url' && !state.url)}
            className="w-full"
          >
            {state.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze {title.replace(' Analysis', '')}
          </Button>

          {state.isLoading && (
            <div className="text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Analyzing... this may take a moment.</p>
            </div>
          )}
          {state.result && (
            <div>
              <AnalysisResultCard result={state.result} type={type} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="image">Image</TabsTrigger>
        <TabsTrigger value="audio">Audio</TabsTrigger>
        <TabsTrigger value="video">Video</TabsTrigger>
      </TabsList>
      <TabsContent value="image" className="mt-4 sm:mt-6">
        {renderTabContent('image')}
      </TabsContent>
      <TabsContent value="audio" className="mt-4 sm:mt-6">
        {renderTabContent('audio')}
      </TabsContent>
      <TabsContent value="video" className="mt-4 sm:mt-6">
        {renderTabContent('video')}
      </TabsContent>
    </Tabs>
  );
}
