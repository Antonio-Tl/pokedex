import { Link, useLocation } from 'react-router-dom';
import { Sword, Package, Moon, Sun, Gamepad2 } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useDesign } from '@/lib/DesignContext';

const navItems = [
  { path: '/', label: 'Pokédex', icon: Sword },
  { path: '/items', label: 'Items', icon: Package },
];

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { setDesign } = useDesign();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6">
          <svg viewBox="0 0 100 100" className="w-7 h-7 text-primary">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" />
            <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" strokeWidth="8" />
            <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="8" />
            <circle cx="50" cy="50" r="6" fill="currentColor" />
          </svg>
          <span className="font-heading font-bold text-base text-foreground hidden sm:block">PokéApp</span>
        </div>

        {/* Nav links */}
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}

        <div className="ml-auto" />

        <button
          onClick={() => setDesign('ds')}
          className="h-9 px-3 mr-2 rounded-lg border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-all inline-flex items-center gap-2 text-sm font-heading font-medium"
          aria-label="Zum Dual-Screen-Design wechseln"
          title="Dual-Screen-Design"
        >
          <Gamepad2 className="w-4 h-4" />
          <span className="hidden sm:inline">DS-Design</span>
        </button>

        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-all inline-flex items-center justify-center"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
}
