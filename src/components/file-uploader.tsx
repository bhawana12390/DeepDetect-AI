'use client';

import { useRef, ChangeEvent } from 'react';
import { UploadCloud, File as FileIcon, X, HardDrive, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  accept: string;
  fileName: string | null;
  filePreview: string | null;
  mediaType: 'image' | 'audio' | 'video';
  fileSize?: number | null;
  fileType?: string | null; 
}

export function FileUploader({ onFileChange, accept, fileName, filePreview, mediaType, fileSize, fileType }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    if (inputRef.current) {
        inputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const renderPreview = () => {
    if (!filePreview) return null;

    if (mediaType === 'image') {
      return <Image src={filePreview} alt="Image preview" width={100} height={100} className="rounded-md object-cover" unoptimized />;
    }
    if (mediaType === 'audio') {
      return <audio src={filePreview} controls className="w-full" />;
    }
    if (mediaType === 'video') {
      return <video src={filePreview} controls className="w-full rounded-md" />;
    }
    return null;
  };

  if (fileName || filePreview) {
    return (
      <div className="p-4 border rounded-lg flex flex-col items-center bg-muted/20 gap-4">
        {fileName && 
          <div className="w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <FileIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{fileName}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            {(fileSize || fileType) && (
              <div className="mt-2 text-xs text-muted-foreground space-y-1 pl-9">
                  {fileSize && (
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-3 w-3" />
                      <span>{formatFileSize(fileSize)}</span>
                    </div>
                  )}
                  {fileType && (
                    <div className="flex items-center gap-2">
                       <Type className="h-3 w-3" />
                      <span>{fileType}</span>
                    </div>
                  )}
              </div>
            )}
          </div>
        }
        <div className="w-full">
            {renderPreview()}
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors border-border hover:border-primary/50"
      onClick={() => inputRef.current?.click()}
    >
      <Input
        type="file"
        ref={inputRef}
        onChange={handleFileSelect}
        accept={accept}
        className="hidden"
      />
      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-4 text-muted-foreground">
        Click to select a file
      </p>
    </div>
  );
}
