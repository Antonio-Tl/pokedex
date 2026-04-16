import { getTypeColor, capitalize } from '@/lib/pokeUtils';

export default function TypeBadge({ type, size = 'sm' }) {
  const colors = getTypeColor(type);
  const sizeClasses = size === 'lg' 
    ? 'px-4 py-1.5 text-sm font-semibold' 
    : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span className={`${colors.bg} ${colors.text} ${colors.border} border rounded-full ${sizeClasses} font-heading tracking-wide`}>
      {capitalize(type)}
    </span>
  );
}