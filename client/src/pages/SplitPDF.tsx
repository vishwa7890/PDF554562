import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import Loader from '@/components/Loader';
import DownloadCard from '@/components/DownloadCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function SplitPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageRanges, setPageRanges] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const { toast } = useToast();

  const handleSplit = async () => {
    if (files.length === 0) {
      toast({
        title: 'Error',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    if (!pageRanges.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter page ranges',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('ranges', pageRanges);

    try {
      // TODO: Connect to FastAPI backend
      const response = await api.post('/split', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setDownloadReady(true);
      toast({
        title: 'Success',
        description: 'PDF split successfully!',
      });
    } catch (error) {
      // Demo fallback
      console.log('Split triggered - backend not connected yet');
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
      description: 'Your split PDFs are downloading...',
    });
  };

  const handleReset = () => {
    setFiles([]);
    setPageRanges('');
    setDownloadReady(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Split PDF</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Extract specific pages from your PDF document
        </p>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-card-border p-8">
        {isProcessing ? (
          <Loader message="Splitting your PDF..." />
        ) : downloadReady ? (
          <DownloadCard
            fileName="split_pages.zip"
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
            <div className="mt-6 space-y-2">
              <Label htmlFor="page-ranges" data-testid="label-page-ranges">
                Page ranges (e.g., 1-3, 5, 7-9)
              </Label>
              <Input
                id="page-ranges"
                type="text"
                placeholder="1-3, 5, 7-9"
                value={pageRanges}
                onChange={(e) => setPageRanges(e.target.value)}
                data-testid="input-page-ranges"
              />
              <p className="text-xs text-muted-foreground">
                Enter page numbers and ranges separated by commas
              </p>
            </div>
            <div className="mt-6">
              <Button
                size="lg"
                onClick={handleSplit}
                disabled={files.length === 0 || !pageRanges.trim()}
                className="w-full sm:w-auto"
                data-testid="button-split"
              >
                Split PDF
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
