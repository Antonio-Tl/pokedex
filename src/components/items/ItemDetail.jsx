import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { capitalize } from '@/lib/pokeUtils';
import { getCategoryColor } from './ItemCard';

export default function ItemDetail({ item, onClose, onNavigate }) {
  if (!item) return null;

  const colors = getCategoryColor(item.category?.name);
  const sprite = item.sprites?.default;
  const effectEn = item.effect_entries?.find(e => e.language.name === 'en');
  const flavorEn = item.flavor_text_entries?.filter(e => e.language.name === 'en')?.pop();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className={`relative ${colors.bg} p-6`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-wider">
                  {capitalize((item.category?.name || 'misc').replace(/-/g, ' '))}
                </span>
                <h2 className="font-heading text-2xl font-bold text-foreground mt-1">
                  {capitalize(item.name.replace(/-/g, ' '))}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full bg-background/50 hover:bg-background/80 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

          </div>

          {/* Sprite centered */}
          <div className="flex justify-center -mt-10 relative z-10">
            <div className="w-24 h-24 bg-card rounded-2xl shadow-xl border border-border flex items-center justify-center">
              {sprite ? (
                <motion.img
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={sprite}
                  alt={item.name}
                  className="w-14 h-14 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <span className="text-4xl">📦</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Flavor text */}
            {flavorEn && (
              <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-border pl-3">
                "{flavorEn.text.replace(/\f/g, ' ').replace(/\n/g, ' ')}"
              </p>
            )}

            {/* Effect */}
            {effectEn && (
              <div>
                <h3 className="font-heading font-semibold text-sm text-foreground mb-1.5">Effect</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {effectEn.short_effect || effectEn.effect}
                </p>
              </div>
            )}

            {/* Machine move */}
            {item.category?.name === 'all-machines' && (
              <div>
                <h3 className="font-heading font-semibold text-sm text-foreground mb-1.5">Attack / Move</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                  {item.machineMoveName
                    ? capitalize(item.machineMoveName.replace(/-/g, ' '))
                    : 'Wird aus Machine API geladen…'}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed font-mono mt-1">
                  {item.machineGenerationLabel || 'Gen wird geladen…'}
                </p>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Coins className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Price</span>
                </div>
                <p className="font-mono font-bold text-sm">
                  {item.cost > 0 ? `${item.cost.toLocaleString()} ₽` : 'Not sold'}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Category</span>
                </div>
                <p className="font-mono font-bold text-sm">
                  {capitalize((item.category?.name || '—').replace(/-/g, ' '))}
                </p>
              </div>
            </div>

            {/* Attributes */}
            {item.attributes?.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold text-sm text-foreground mb-2">Attributes</h3>
                <div className="flex flex-wrap gap-2">
                  {item.attributes.map(a => (
                    <span key={a.name} className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-secondary-foreground">
                      {capitalize(a.name.replace(/-/g, ' '))}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}