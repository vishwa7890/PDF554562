import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FileText, 
  Scissors, 
  FileArchive, 
  Image, 
  ScanText,
  Settings,
  User,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

const dockItems = [
  { path: '/', label: 'Dashboard', icon: Home, color: 'text-blue-500' },
  { path: '/merge', label: 'Merge PDFs', icon: FileText, color: 'text-green-500' },
  { path: '/split', label: 'Split PDF', icon: Scissors, color: 'text-orange-500' },
  { path: '/compress', label: 'Compress PDF', icon: FileArchive, color: 'text-purple-500' },
  { path: '/convert', label: 'PDF to Images', icon: Image, color: 'text-pink-500' },
  { path: '/ocr', label: 'OCR Text Extract', icon: ScanText, color: 'text-cyan-500' },
  { path: '/history', label: 'History', icon: History, color: 'text-yellow-500' },
  { path: '/profile', label: 'Profile', icon: User, color: 'text-indigo-500' },
  { path: '/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
];

export default function DockBar() {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      const mouseY = e.clientY;
      const threshold = windowHeight - 100; // Show dock when mouse is within 100px of bottom

      if (mouseY > threshold) {
        setIsVisible(true);
        clearTimeout(timeoutId);
      } else {
        timeoutId = setTimeout(() => {
          setIsVisible(false);
        }, 1000); // Hide after 1 second of mouse being away
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  const getContextualItems = () => {
    const baseItems = dockItems.filter(item => 
      ['/', '/merge', '/split', '/compress', '/convert', '/ocr'].includes(item.path)
    );
    
    const contextualItems = location !== '/' 
      ? [dockItems.find(item => item.path === '/')!] 
      : [];
    
    if (location === '/merge' || location === '/split') {
      contextualItems.push(dockItems.find(item => item.path === '/history')!);
    }
    
    contextualItems.push(
      dockItems.find(item => item.path === '/profile')!,
      dockItems.find(item => item.path === '/settings')!
    );
    
    return Array.from(
      new Map([...baseItems, ...contextualItems].map(item => [item.path, item])).values()
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 left-0 right-0 flex justify-center z-50 px-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: isVisible ? 0 : 100, 
          opacity: isVisible ? 1 : 0,
        }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ 
          type: "spring",
          damping: 25,
          stiffness: 300,
          mass: 0.5
        }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => {
          const timeout = setTimeout(() => setIsVisible(false), 1000);
          return () => clearTimeout(timeout);
        }}
      >
        <div className="bg-white/90 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl px-6 py-3 shadow-xl border border-gray-200/50 dark:border-gray-600/30">
          <div className="flex items-center justify-center gap-5">
            {getContextualItems().map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <motion.div
                  key={item.path}
                  className="relative"
                  whileHover={{ 
                    y: -5,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 10 
                    } 
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={item.path} className="block">
                    <div 
                      className={cn(
                        "p-3 rounded-xl transition-all duration-200 border-2",
                        isActive 
                          ? `bg-blue-500 border-blue-400 text-white shadow-md` 
                          : `border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-200`
                      )}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : item.color}`} />
                    </div>
                  </Link>
                  
                  <AnimatePresence>
                    {hoveredItem === item.path && (
                      <motion.div
                        className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded whitespace-nowrap pointer-events-none shadow-lg"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.label}
                        <div className="absolute -bottom-1 left-1/2 w-2 h-2 transform -translate-x-1/2 rotate-45 bg-gray-900" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}