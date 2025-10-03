import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import Loader from '@/components/Loader';
import DownloadCard from '@/components/DownloadCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';

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

    try {
      // Step 1: Upload file
      const uploadFormData = new FormData();
      uploadFormData.append('file', files[0]);
      
      const uploadResponse = await api.post('/pdf/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const fileId = uploadResponse.data.id;

      // Step 2: Split PDF
      // Parse page ranges (e.g., "1-3,5,7-9" -> [1,2,3,5,7,8,9])
      const pages = pageRanges.split(',').flatMap(range => {
        const [start, end] = range.trim().split('-').map(n => parseInt(n));
        if (end) {
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        return [start];
      });

      // Make the request with responseType: 'blob' to handle binary response
      const response = await api({
        method: 'post',
        url: '/pdf/split',
        data: { file_id: fileId, pages },
        responseType: 'blob',
      });
      
      // Create a blob URL for the downloaded file
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'split_pages.zip';
      
      // Extract filename from content-disposition header if available
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          // Remove surrounding quotes if present and trim any whitespace
          filename = filenameMatch[1].replace(/['"]/g, '').trim();
          // Ensure the filename has a .zip extension
          if (!filename.toLowerCase().endsWith('.zip')) {
            filename = `${filename}.zip`;
          }
        }
      }
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      toast({
        title: 'Success',
        description: 'PDF split and downloaded successfully!',
      });
      
      // Reset the form
      handleReset();
    } catch (error) {
      console.error('Error splitting PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to split PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    // This will be called if the user clicks the download button in the DownloadCard
    // But we're already handling the download in handleSplit, so we can leave this empty
    // or add a message to the user
    toast({
      title: 'Info',
      description: 'The download should have started automatically. If not, please try splitting the PDF again.',
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
