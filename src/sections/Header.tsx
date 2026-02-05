import { useState } from 'react';
import { 
  Newspaper, 
  Users, 
  Building2, 
  BarChart3, 
  Menu, 
  X,
  Search,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearch?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
  { id: 'medias', label: 'Médias', icon: Newspaper },
  { id: 'personnes', label: 'Personnes', icon: Users },
  { id: 'organisations', label: 'Organisations', icon: Building2 },
  { id: 'reseau', label: 'Réseau', icon: Network },
];

export function Header({ 
  activeTab, 
  setActiveTab, 
  onSearch
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <img 
              src="/logo.png" 
              alt="Médias Français" 
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold leading-tight">Médias Français</h1>
              <p className="text-xs text-muted-foreground">Propriété & Concentration</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Search & Mobile Menu */}
          <div className="flex items-center gap-2">
            {onSearch && (
              <>
                {/* Desktop: bouton complet avec texte */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSearch}
                  className="hidden md:flex items-center gap-2 text-muted-foreground"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Rechercher</span>
                  <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground ml-2">
                    <span className="text-xs">Ctrl</span>K
                  </kbd>
                </Button>
                {/* Mobile: icône seule */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSearch}
                  className="md:hidden text-muted-foreground"
                  aria-label="Rechercher"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
