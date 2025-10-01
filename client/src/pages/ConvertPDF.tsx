import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import Loader from '@/components/Loader';
import DownloadCard from '@/components/DownloadCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function ConvertPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: 'Error',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('format', format);

    try {
      // TODO: Connect to FastAPI backend
      const response = await api.post('/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setDownloadReady(true);
      toast({
        title: 'Success',
        description: 'PDF converted successfully!',
      });
    } catch (error) {
      // Demo fallback
      console.log('Convert triggered - backend not connected yet');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setDownloadReady(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    // TODO: Implement actual download
    console.log('Download triggered');
    toast({
      title: 'Download started',
      description: 'Your images are downloading...',
    });
  };

  const handleReset = () => {
    setFiles([]);
    setFormat('png');
    setDownloadReady(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Convert PDF to Images</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Convert each page of your PDF into separate images
        </p>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-card-border p-8">
        {isProcessing ? (
          <Loader message="Converting your PDF..." />
        ) : downloadReady ? (
          <DownloadCard
            fileName={`images.zip`}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        ) : (
          <>
            <FileUploader
              files={files}
              onFilesChange={setFiles}
              multiple={false}
            />
            <div className="mt-6 space-y-3">
              <Label data-testid="label-image-format">Image format</Label>
              <RadioGroup value={format} onValueChange={setFormat}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="png" id="png" data-testid="radio-png" />
                  <Label htmlFor="png" className="font-normal cursor-pointer">
                    PNG (best quality, larger file size)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jpg" id="jpg" data-testid="radio-jpg" />
                  <Label htmlFor="jpg" className="font-normal cursor-pointer">
                    JPG (smaller file size, good quality)
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="mt-6">
              <Button
                size="lg"
                onClick={handleConvert}
                disabled={files.length === 0}
                className="w-full sm:w-auto"
                data-testid="button-convert"
              >
                Convert to {format.toUpperCase()}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
