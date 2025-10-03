import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect to login if we're not loading and definitely not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: Redirecting to login - not authenticated');
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading while authentication is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect via useEffect)
  if (!isAuthenticated || !user || !token) {
    return null;
  }

  return <>{children}</>;
}
