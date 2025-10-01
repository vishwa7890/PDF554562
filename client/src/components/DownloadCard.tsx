import { CheckCircle, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadCardProps {
  fileName?: string;
  fileSize?: string;
  onDownload: () => void;
  onReset: () => void;
}

export default function DownloadCard({
  fileName = 'processed.pdf',
  fileSize,
  onDownload,
  onReset,
}: DownloadCardProps) {
  return (
    <div className="bg-card rounded-xl p-8 text-center border border-card-border space-y-6" data-testid="card-download">
      <CheckCircle className="w-16 h-16 text-chart-2 mx-auto" data-testid="icon-success" />
      <div>
        <h3 className="text-2xl font-bold mb-2" data-testid="text-success-title">Your file is ready!</h3>
        <p className="text-muted-foreground" data-testid="text-filename">{fileName}</p>
        {fileSize && (
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-filesize">
            Size: {fileSize}
          </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          size="lg"
          onClick={onDownload}
          className="bg-chart-2 hover:bg-chart-2/90 text-white"
          data-testid="button-download"
        >
          <Download className="w-5 h-5 mr-2" />
          Download File
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onReset}
          data-testid="button-process-another"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Process Another File
        </Button>
      </div>
    </div>
  );
}
