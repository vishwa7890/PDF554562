import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, ArrowRight, Plus, X, GripVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import FileUploader from '@/components/FileUploader';
import DownloadCard from '@/components/DownloadCard';
import Loader from '@/components/Loader';
import api from '@/utils/api';

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

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
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Step 1: Upload all files
      const fileIds: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', files[i]);
        
        const uploadResponse = await api.post('/pdf/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        fileIds.push(uploadResponse.data.id);
        
        // Update progress during upload
        const uploadProgress = ((i + 1) / files.length) * 50;
        setProgress(uploadProgress);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Step 2: Merge PDFs and handle file download
      const response = await api({
        method: 'post',
        url: '/pdf/merge',
        data: { file_ids: fileIds },
        responseType: 'blob', // Important for handling binary response
      });
      
      // Create a blob URL for the downloaded file
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'merged.pdf';
      
      // Extract filename from content-disposition header if available
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          // Remove surrounding quotes if present and trim any whitespace
          filename = filenameMatch[1].replace(/['"]/g, '').trim();
          // Ensure the filename has a .pdf extension
          if (!filename.toLowerCase().endsWith('.pdf')) {
            filename = `${filename}.pdf`;
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
        description: 'PDFs merged and downloaded successfully!',
      });
      
      // Reset the form
      handleReset();
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast({
        title: 'Error',
        description: 'Failed to merge PDFs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      clearInterval(progressInterval);
      setProgress(100);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) {
      toast({
        title: 'Error',
        description: 'Download URL not available',
        variant: 'destructive',
      });
      return;
    }

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = downloadUrl.split('/').pop() || 'merged.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Download started',
      description: 'Your merged PDF is downloading...',
    });
  };

  const handleReset = () => {
    setFiles([]);
    setDownloadReady(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4" data-testid="text-page-title">
            Merge PDF Files
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" data-testid="text-page-description">
            Combine multiple PDF files into a single document. 
            Drag and drop to reorder files before merging.
          </p>
        </motion.div>

        {isProcessing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="pt-8">
                <Loader message="Merging your PDFs..." />
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Processing files...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : downloadReady ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <DownloadCard
              fileName="merged.pdf"
              onDownload={handleDownload}
              onReset={handleReset}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload and File Management */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload PDF Files
                  </CardTitle>
                  <CardDescription>
                    Select multiple PDF files to merge into one document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    files={files}
                    onFilesChange={handleFilesChange}
                    multiple={true}
                    className="border-2 border-dashed border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600"
                  />
                  
                  {files.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Selected Files ({files.length})
                        </h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(1)} MB total
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {files.map((file, index) => (
                          <motion.div
                            key={`${file.name}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {index + 1}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {files.length >= 2 && (
                <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardContent className="pt-6">
                    <Button
                      onClick={handleMerge}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      size="lg"
                      data-testid="button-merge"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Merge {files.length} Files
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    How to Merge PDFs
                  </CardTitle>
                  <CardDescription>
                    Follow these simple steps to combine your PDF files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Upload Files</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Click or drag and drop your PDF files into the upload area
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Arrange Order</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Drag files to reorder them as needed for your final document
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Merge & Download</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Click merge to combine files and download your result
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Pro Tips</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                      <li>• Upload up to 10 files at once</li>
                      <li>• Maximum file size: 50MB per file</li>
                      <li>• Files are processed securely and deleted after use</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}