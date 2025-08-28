
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ImageAnalysisResult, AudioAnalysisResult, VideoAnalysisResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Sparkles, Video, Mic, Clipboard } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useState, useEffect } from "react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Button } from "./ui/button";

type AnalysisResultCardProps = {
  result: ImageAnalysisResult | AudioAnalysisResult | VideoAnalysisResult;
  type: 'image' | 'audio' | 'video';
};

export function AnalysisResultCard({ result, type }: AnalysisResultCardProps) {
  const { classification, overallConfidence, overallJustification } = result;
  
  const [animatedOverall, setAnimatedOverall] = useState(0);
  const [animatedVisual, setAnimatedVisual] = useState(0);
  const [animatedAudio, setAnimatedAudio] = useState(0);

  const { copy } = useCopyToClipboard();

  useEffect(() => {
    const timer = setTimeout(() => {
        setAnimatedOverall(overallConfidence);
        if ('visualConfidence' in result) {
            setAnimatedVisual(result.visualConfidence);
        }
        if ('audioConfidence' in result) {
            setAnimatedAudio(result.audioConfidence);
        }
    }, 100);
    return () => clearTimeout(timer);
  }, [result, overallConfidence]);

  const getBadgeClass = () => {
    if (classification === 'Authentic') return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
    if (classification === 'Deepfake') return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
  }
  
  const getIcon = () => {
    if (classification === 'Authentic') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (classification === 'Deepfake') return <AlertCircle className="h-5 w-5 text-red-500" />;
    return <Sparkles className="h-5 w-5 text-yellow-500" />;
  }
  
  const JustificationBlock = ({ title, text }: { title?: string; text: string }) => (
    <div className="space-y-2">
      {title && <h4 className="text-sm font-semibold">{title}</h4>}
      <div className="group relative">
        <p className="text-xs text-muted-foreground pr-8">{text}</p>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => copy(text)}
        >
          <Clipboard className="h-3.5 w-3.5" />
          <span className="sr-only">Copy justification</span>
        </Button>
      </div>
    </div>
  );


  const renderVideoDetails = () => {
    if (type !== 'video' || !('visualConfidence' in result)) return null;
    const videoResult = result as VideoAnalysisResult;

    return (
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-sm font-semibold">Detailed Analysis</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <JustificationBlock title="Visual Analysis" text={videoResult.visualJustification} />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Confidence</span>
                        <span className="text-xs font-bold text-foreground">{videoResult.visualConfidence.toFixed(2)}%</span>
                    </div>
                    <Progress value={animatedVisual} className="h-1.5" />
                </div>
            </div>
            {videoResult.hasAudio && (
                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-muted-foreground" />
                        <JustificationBlock title="Audio Analysis" text={videoResult.audioJustification} />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-muted-foreground">Confidence</span>
                            <span className="text-xs font-bold text-foreground">{videoResult.audioConfidence.toFixed(2)}%</span>
                        </div>
                        <Progress value={animatedAudio} className="h-1.5" />
                    </div>
                </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                {getIcon()}
                <span>Analysis Result</span>
            </CardTitle>
            <Badge className={`text-sm ${getBadgeClass()}`}>{classification}</Badge>
        </div>
        <CardDescription>
            <div>
                <JustificationBlock text={overallJustification} />
            </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-muted-foreground">Overall Confidence Score</span>
            <span className="text-sm font-bold text-foreground">{overallConfidence.toFixed(2)}%</span>
          </div>
          <Progress value={animatedOverall} className="h-2" />
        </div>
        {renderVideoDetails()}
      </CardContent>
    </Card>
  );
}
