import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: Record<string, string[]>;
}

export default function FileUploader({
  files,
  onFilesChange,
  multiple = false,
  accept = { 'application/pdf': ['.pdf'] },
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (multiple) {
        onFilesChange([...files, ...acceptedFiles]);
      } else {
        onFilesChange(acceptedFiles);
      }
    },
    [files, onFilesChange, multiple]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`min-h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card/50 hover-elevate'
        }`}
        data-testid="dropzone-upload"
      >
        <input {...getInputProps()} data-testid="input-file" />
        <Upload className="w-24 h-24 text-muted-foreground mb-4" />
        <p className="text-xl font-semibold text-foreground mb-2" data-testid="text-upload-title">
          {isDragActive ? 'Drop PDF files here' : 'Drop PDF files here'}
        </p>
        <p className="text-sm text-muted-foreground" data-testid="text-upload-subtitle">
          or click to browse
        </p>
        {multiple && (
          <p className="text-xs text-muted-foreground mt-2">
            You can upload multiple files
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="bg-card rounded-lg p-4 border border-card-border flex items-center gap-3 hover-elevate"
              data-testid={`card-file-${index}`}
            >
              <File className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" data-testid={`text-filename-${index}`}>
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-filesize-${index}`}>
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                data-testid={`button-remove-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
