import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sword, Package, Moon, Sun, Gamepad2, X } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useDesign } from '@/lib/DesignContext';

const navItems = [
  { path: '/', label: 'Pokédex', icon: Sword },
  { path: '/items', label: 'Items', icon: Package },
];

const HINT_KEY = 'ds-hint-dismissed';
const hintDismissed = () => {
  try { return localStorage.getItem(HINT_KEY) === '1'; } catch { return false; }
};
const dismissHint = () => {
  try { localStorage.setItem(HINT_KEY, '1'); } catch { /* ignore */ }
};

/** Speech bubble pointing at the "DS-Design" button until it is used or dismissed. */
function DsHint({ onTry, onClose }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: [0, -5, 0], scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
        y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
      }}
      className="absolute right-0 top-full mt-3 w-72 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 p-4 z-50"
    >
      {/* arrow pointing up at the button */}
      <span
        aria-hidden="true"
        className="absolute -top-1.5 right-3 sm:right-[52px] w-3 h-3 rotate-45 bg-primary"
      />
      <button
        onClick={onClose}
        className="absolute top-2 right-2 h-6 w-6 rounded-full inline-flex items-center justify-center hover:bg-white/20 transition-colors"
        aria-label="Hinweis schließen"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <p className="font-heading font-bold text-sm pr-6">Neu: Der Pokédex im DS-Look!</p>
      <p className="text-xs mt-1 opacity-90 leading-relaxed">
        Zwei Bildschirme, Steuerkreuz, Pixel-Sprites, Pokémon-Rufe und alle Details auf einen Blick.
      </p>
      <button
        onClick={onTry}
        className="mt-3 h-8 px-3 rounded-lg bg-white text-primary text-xs font-heading font-bold inline-flex items-center gap-1.5 hover:bg-white/90 transition-colors"
      >
        <Gamepad2 className="w-3.5 h-3.5" />
        Jetzt ausprobieren
      </button>
    </motion.div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { setDesign } = useDesign();
  const [showHint, setShowHint] = useState(false);

  // Show the hint shortly after load, unless it was dismissed before.
  useEffect(() => {
    if (hintDismissed()) return undefined;
    const t = setTimeout(() => setShowHint(true), 700);
    return () => clearTimeout(t);
  }, []);

  const closeHint = () => { setShowHint(false); dismissHint(); };
  const switchToDs = () => { dismissHint(); setDesign('ds'); };

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

        <div className="relative mr-2">
          <button
            onClick={switchToDs}
            className={`relative h-9 px-3 rounded-lg border transition-all inline-flex items-center gap-2 text-sm font-heading font-medium ${
              showHint
                ? 'border-primary bg-primary/10 text-primary hover:bg-primary/15'
                : 'border-border bg-secondary text-foreground hover:bg-secondary/80'
            }`}
            aria-label="Zum Dual-Screen-Design wechseln"
            title="Dual-Screen-Design"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">DS-Design</span>
            {showHint && (
              <span aria-hidden="true" className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
              </span>
            )}
          </button>
          <AnimatePresence>
            {showHint && <DsHint onTry={switchToDs} onClose={closeHint} />}
          </AnimatePresence>
        </div>

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
