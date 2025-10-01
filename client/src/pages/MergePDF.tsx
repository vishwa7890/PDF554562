import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import Loader from '@/components/Loader';
import DownloadCard from '@/components/DownloadCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const { toast } = useToast();

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: 'Error',
        description: 'Please upload at least 2 PDF files to merge',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      // TODO: Connect to FastAPI backend
      const response = await api.post('/merge', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      // Simulate processing for demo
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setDownloadReady(true);
      toast({
        title: 'Success',
        description: 'PDFs merged successfully!',
      });
    } catch (error) {
      // Demo fallback
      console.log('Merge triggered - backend not connected yet');
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
      description: 'Your merged PDF is downloading...',
    });
  };

  const handleReset = () => {
    setFiles([]);
    setDownloadReady(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Merge PDFs</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Combine multiple PDF files into a single document
        </p>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-card-border p-8">
        {isProcessing ? (
          <Loader message="Merging your PDFs..." />
        ) : downloadReady ? (
          <DownloadCard
            fileName="merged.pdf"
            onDownload={handleDownload}
            onReset={handleReset}
          />
        ) : (
          <>
            <FileUploader
              files={files}
              onFilesChange={setFiles}
              multiple={true}
            />
            <div className="mt-6">
              <Button
                size="lg"
                onClick={handleMerge}
                disabled={files.length < 2}
                className="w-full sm:w-auto"
                data-testid="button-merge"
              >
                Merge PDFs ({files.length} files)
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
