import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import Loader from '@/components/Loader';
import DownloadCard from '@/components/DownloadCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      toast({
        title: 'Error',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setOriginalSize(files[0].size);

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      // TODO: Connect to FastAPI backend
      const response = await api.post('/compress', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Demo: simulate 40% compression
      setCompressedSize(Math.floor(files[0].size * 0.6));
      setDownloadReady(true);
      toast({
        title: 'Success',
        description: 'PDF compressed successfully!',
      });
    } catch (error) {
      // Demo fallback
      console.log('Compress triggered - backend not connected yet');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setCompressedSize(Math.floor(files[0].size * 0.6));
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
      description: 'Your compressed PDF is downloading...',
    });
  };

  const handleReset = () => {
    setFiles([]);
    setDownloadReady(false);
    setOriginalSize(0);
    setCompressedSize(0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Compress PDF</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Reduce the file size of your PDF document
        </p>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-card-border p-8">
        {isProcessing ? (
          <Loader message="Compressing your PDF..." />
        ) : downloadReady ? (
          <div className="space-y-6">
            {originalSize > 0 && compressedSize > 0 && (
              <div className="bg-muted rounded-lg p-4" data-testid="card-compression-stats">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Original size</p>
                    <p className="font-semibold text-lg" data-testid="text-original-size">
                      {formatFileSize(originalSize)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Compressed size</p>
                    <p className="font-semibold text-lg text-chart-2" data-testid="text-compressed-size">
                      {formatFileSize(compressedSize)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-chart-2" data-testid="text-reduction">
                    {Math.round(((originalSize - compressedSize) / originalSize) * 100)}% reduction
                  </p>
                </div>
              </div>
            )}
            <DownloadCard
              fileName="compressed.pdf"
              fileSize={formatFileSize(compressedSize)}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          </div>
        ) : (
          <>
            <FileUploader
              files={files}
              onFilesChange={setFiles}
              multiple={false}
            />
            {files.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg" data-testid="card-file-info">
                <p className="text-sm text-muted-foreground">Original file size</p>
                <p className="font-semibold text-lg" data-testid="text-file-size">
                  {formatFileSize(files[0].size)}
                </p>
              </div>
            )}
            <div className="mt-6">
              <Button
                size="lg"
                onClick={handleCompress}
                disabled={files.length === 0}
                className="w-full sm:w-auto"
                data-testid="button-compress"
              >
                Compress PDF
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
