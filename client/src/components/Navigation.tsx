import { Link, useLocation } from 'wouter';
import { FileText, Scissors, FileArchive, Image } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Merge PDFs', icon: FileText },
  { path: '/split', label: 'Split PDF', icon: Scissors },
  { path: '/compress', label: 'Compress PDF', icon: FileArchive },
  { path: '/convert', label: 'PDF to Images', icon: Image },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="border-b border-border bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" data-testid="logo-icon" />
            <span className="text-xl font-bold" data-testid="text-logo">PDF Tools</span>
          </div>
          
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover-elevate'
                    }`}
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
