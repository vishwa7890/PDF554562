import { Loader2 } from 'lucide-react';

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = 'Processing your PDF...' }: LoaderProps) {
  return (
    <div className="bg-card rounded-xl p-12 text-center border border-card-border" data-testid="loader-container">
      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" data-testid="icon-spinner" />
      <p className="text-lg text-foreground" data-testid="text-loader-message">{message}</p>
    </div>
  );
}
