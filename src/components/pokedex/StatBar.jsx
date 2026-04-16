import { motion } from 'framer-motion';
import { STAT_LABELS, STAT_COLORS } from '@/lib/pokeUtils';

export default function StatBar({ stat, delay = 0 }) {
  const label = STAT_LABELS[stat.stat.name] || stat.stat.name;
  const color = STAT_COLORS[stat.stat.name] || 'bg-primary';
  const percentage = Math.min((stat.base_stat / 255) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs font-semibold text-muted-foreground w-8 text-right">
        {label}
      </span>
      <span className="font-mono text-sm font-bold w-8 text-right text-foreground">
        {stat.base_stat}
      </span>
      <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}