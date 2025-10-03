import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ScanText, 
  Upload, 
  FileText, 
  Download, 
  Languages, 
  Zap,
  Eye,
  Copy,
  Search,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import FileUploader from '@/components/FileUploader';
import api from '@/lib/api';

const languages = [
  { code: 'eng', name: 'English', flag: '🇺🇸' },
  { code: 'fra', name: 'French', flag: '🇫🇷' },
  { code: 'deu', name: 'German', flag: '🇩🇪' },
  { code: 'spa', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ita', name: 'Italian', flag: '🇮🇹' },
  { code: 'por', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'rus', name: 'Russian', flag: '🇷🇺' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'jpn', name: 'Japanese', flag: '🇯🇵' },
  { code: 'kor', name: 'Korean', flag: '🇰🇷' },
];

const features = [
  {
    icon: Zap,
    title: 'High Accuracy',
    description: 'Advanced OCR engine with 99%+ accuracy'
  },
  {
    icon: Languages,
    title: 'Multi-Language',
    description: 'Support for 100+ languages and scripts'
  },
  {
    icon: Search,
    title: 'Searchable PDFs',
    description: 'Create searchable PDFs with text layers'
  },
  {
    icon: Eye,
    title: 'Preview Results',
    description: 'Preview extracted text before downloading'
  }
];

export default function OCRPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [ocrResults, setOcrResults] = useState<any>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  const handleFileUpload = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      setExtractedText('');
      setOcrResults(null);
      setUploadedFileId(null);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    return response.data.id;
  };

  const handleExtractText = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      // First upload the file if not already uploaded
      let fileId = uploadedFileId;
      if (!fileId) {
        setProgress(30);
        fileId = await uploadFile(files[0]);
        setUploadedFileId(fileId);
      }

      setProgress(50);

      // Call OCR API
      const response = await api.post('/ocr/extract-text', {
        file_id: fileId,
        language: selectedLanguage
      });

      setProgress(90);

      const { extracted_text, confidence, processing_time } = response.data;
      
      setExtractedText(extracted_text);
      setOcrResults({
        pages: 1,
        confidence: confidence || 95.0,
        processingTime: processing_time || 2.5,
        language: selectedLanguage,
        wordCount: extracted_text.split(' ').length
      });
      setProgress(100);

    } catch (error: any) {
      console.error('OCR processing failed:', error);
      
      // Fallback to mock data if API fails
      const mockText = `SAMPLE EXTRACTED TEXT (API Connection Failed)

This is a demonstration of the OCR text extraction feature. The backend API is not responding, so this is mock data.

To connect to the real backend:
1. Ensure the backend server is running on port 8000
2. Check that VITE_API_URL is set to http://localhost:8000
3. Verify authentication token is valid

Key Features:
• High accuracy text recognition
• Multi-language support
• Preserves formatting where possible
• Handles various document types

Error: ${error.response?.data?.detail || error.message || 'Unknown error'}`;

      setExtractedText(mockText);
      setOcrResults({
        pages: 1,
        confidence: 0,
        processingTime: 0,
        language: selectedLanguage,
        wordCount: mockText.split(' ').length
      });
      setProgress(100);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const handleDownloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mb-6">
            <ScanText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
            OCR Text Extraction
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Extract text from scanned PDFs and images with advanced OCR technology. 
            Support for multiple languages and high accuracy recognition.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="text-center border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl mb-4">
                    <Icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload and Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload & Configure
                </CardTitle>
                <CardDescription>
                  Upload your PDF or image file and configure OCR settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select File
                  </label>
                  <FileUploader
                    files={files}
                    onFilesChange={handleFileUpload}
                    multiple={false}
                    accept={{ 
                      'application/pdf': ['.pdf'],
                      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']
                    }}
                  />
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OCR Language
                  </label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Processing Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Output Options
                  </label>
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text">Extract Text</TabsTrigger>
                      <TabsTrigger value="searchable">Searchable PDF</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Process Button */}
                <Button
                  onClick={handleExtractText}
                  disabled={files.length === 0 || isProcessing}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ScanText className="w-4 h-4 mr-2" />
                      Extract Text
                    </>
                  )}
                </Button>

                {/* Progress */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Extracted Text
                </CardTitle>
                <CardDescription>
                  Review and download the extracted text content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ocrResults && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{ocrResults.confidence}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{ocrResults.wordCount}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Words</div>
                    </div>
                  </div>
                )}

                <Textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Extracted text will appear here..."
                  className="min-h-[400px] font-mono text-sm"
                  readOnly={!extractedText}
                />

                {extractedText && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyText}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={handleDownloadText}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}