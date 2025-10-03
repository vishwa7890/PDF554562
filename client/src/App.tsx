import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import DockBar from "@/components/DockBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import MergePDF from "@/pages/MergePDF";
import SplitPDF from "@/pages/SplitPDF";
import CompressPDF from "@/pages/CompressPDF";
import ConvertPDF from "@/pages/ConvertPDF";
import OCRPage from "@/pages/OCRPage";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/merge">
        {() => (
          <ProtectedRoute>
            <MergePDF />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/split">
        {() => (
          <ProtectedRoute>
            <SplitPDF />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/compress">
        {() => (
          <ProtectedRoute>
            <CompressPDF />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/convert">
        {() => (
          <ProtectedRoute>
            <ConvertPDF />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/ocr">
        {() => (
          <ProtectedRoute>
            <OCRPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <Navigation />
            <main className="pb-20">
              <Router />
            </main>
            <DockBar />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
