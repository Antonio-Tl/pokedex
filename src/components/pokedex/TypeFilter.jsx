import { getTypeColor, capitalize } from '@/lib/pokeUtils';

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export default function TypeFilter({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all ${
          !selected
            ? 'bg-foreground text-background'
            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
        }`}
      >
        All
      </button>
      {ALL_TYPES.map(type => {
        const colors = getTypeColor(type);
        const isActive = selected === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(isActive ? null : type)}
            className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold border transition-all ${
              isActive
                ? `${colors.bg} ${colors.text} ${colors.border}`
                : 'bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80'
            }`}
          >
            {capitalize(type)}
          </button>
        );
      })}
    </div>
  );
}