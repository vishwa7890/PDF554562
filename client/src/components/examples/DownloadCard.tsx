import DownloadCard from '../DownloadCard';

export default function DownloadCardExample() {
  const handleDownload = () => {
    console.log('Download clicked');
  };

  const handleReset = () => {
    console.log('Reset clicked');
  };

  return (
    <div className="p-8">
      <DownloadCard
        fileName="merged.pdf"
        fileSize="2.5 MB"
        onDownload={handleDownload}
        onReset={handleReset}
      />
    </div>
  );
}
