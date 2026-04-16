import { motion } from 'framer-motion';
import { capitalize } from '@/lib/pokeUtils';
import { Coins } from 'lucide-react';

const CATEGORY_COLORS = {
  'standard-balls': { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
  'medicine': { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' },
  'healing': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
  'held-items': { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
  'choice': { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20' },
  'evolution': { bg: 'bg-pink-500/10', text: 'text-pink-600', border: 'border-pink-500/20' },
  'berries': { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
  'vitamins': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/20' },
  'machines': { bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-500/20' },
  'stat-boosts': { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  'all-machines': { bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-500/20' },
  'default': { bg: 'bg-secondary', text: 'text-muted-foreground', border: 'border-border' },
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['default'];
}

export default function ItemCard({ item, onClick, index }) {
  const colors = getCategoryColor(item.category?.name);
  const sprite = item.sprites?.default;
  const moveName = item.machineMoveName;
  const generationLabel = item.machineGenerationLabel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: (index % 40) * 0.015 }}
      onClick={() => onClick(item)}
      className="group cursor-pointer"
    >
      <div className={`relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 p-4`}>
        {/* Category accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bg.replace('/10', '')}`} style={{ opacity: 0.4 }} />

        {/* Sprite */}
        <div className="flex justify-center mb-3">
          <div className={`w-16 h-16 rounded-xl ${colors.bg} flex items-center justify-center`}>
            {sprite ? (
              <img
                src={sprite}
                alt={item.name}
                className="w-10 h-10 object-contain image-rendering-pixelated transition-transform duration-300 group-hover:scale-125"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <span className="text-2xl">📦</span>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="font-heading font-semibold text-sm text-foreground text-center leading-tight mb-2">
          {capitalize(item.name.replace(/-/g, ' '))}
        </h3>

        {/* Category badge */}
        <div className="flex justify-center">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
            {capitalize((item.category?.name || 'misc').replace(/-/g, ' '))}
          </span>
        </div>

        {/* Machine move */}
        {item.category?.name === 'all-machines' && (
          <div className="mt-2 min-h-10">
            <p className="text-[11px] text-center font-mono text-muted-foreground leading-tight">
              {moveName ? capitalize(moveName.replace(/-/g, ' ')) : 'Move wird geladen…'}
            </p>
            <p className="text-[10px] text-center font-mono text-muted-foreground/80 leading-tight mt-0.5">
              {generationLabel || 'Gen wird geladen…'}
            </p>
          </div>
        )}

        {/* Cost */}
        {item.cost > 0 && (
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground font-mono">
            <Coins className="w-3 h-3" />
            {item.cost.toLocaleString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}