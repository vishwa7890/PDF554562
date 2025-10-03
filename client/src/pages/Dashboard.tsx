import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Scissors, 
  FileArchive, 
  Image, 
  ScanText,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const tools = [
  {
    path: '/merge',
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into a single document',
    icon: FileText,
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400',
    features: ['Unlimited files', 'Preserve quality', 'Custom order']
  },
  {
    path: '/split',
    title: 'Split PDF',
    description: 'Extract specific pages or split into multiple files',
    icon: Scissors,
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-600 dark:text-orange-400',
    features: ['Page ranges', 'Individual pages', 'Batch processing']
  },
  {
    path: '/compress',
    title: 'Compress PDF',
    description: 'Reduce file size while maintaining quality',
    icon: FileArchive,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    features: ['Smart compression', 'Quality control', 'Size optimization']
  },
  {
    path: '/convert',
    title: 'PDF to Images',
    description: 'Convert PDF pages to high-quality images',
    icon: Image,
    color: 'from-pink-400 to-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    textColor: 'text-pink-600 dark:text-pink-400',
    features: ['Multiple formats', 'Custom DPI', 'Batch export']
  },
  {
    path: '/ocr',
    title: 'OCR Text Extract',
    description: 'Extract text from scanned PDFs and images',
    icon: ScanText,
    color: 'from-cyan-400 to-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    features: ['Multi-language', 'Searchable PDFs', 'High accuracy'],
    isNew: true
  }
];

const stats = [
  { label: 'Files Processed', value: '10,000+', icon: TrendingUp },
  { label: 'Processing Time', value: '< 30s', icon: Clock },
  { label: 'User Rating', value: '4.9/5', icon: Star }
];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process files in seconds with our optimized algorithms'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your files are processed securely and deleted after use'
  },
  {
    icon: Smartphone,
    title: 'All Devices',
    description: 'Works perfectly on desktop, tablet, and mobile devices'
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              PDF Master
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Your complete PDF toolkit with advanced OCR capabilities. 
              Process, convert, and extract text from PDFs with ease.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful PDF Tools
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose from our comprehensive suite of PDF processing tools, 
            each designed for maximum efficiency and ease of use.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${tool.bgColor}`}>
                        <Icon className={`w-6 h-6 ${tool.textColor}`} />
                      </div>
                      {tool.isNew && (
                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          New
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={tool.path}>
                      <Button 
                        className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white border-0`}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose PDF Master?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built with modern technology and user experience in mind
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}