import { motion } from 'framer-motion';
import { getArtwork, formatPokemonId, capitalize, getTypeColor } from '@/lib/pokeUtils';
import TypeBadge from './TypeBadge';

export default function PokemonCard({ pokemon, onClick, index }) {
  const mainType = pokemon.types?.[0]?.type?.name || 'normal';
  const colors = getTypeColor(mainType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      onClick={() => onClick(pokemon)}
      className="group relative cursor-pointer"
    >
      <div className={`relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1`}>
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} to-transparent opacity-50`} />
        
        {/* ID Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="font-mono text-xs font-semibold text-muted-foreground/60">
            {formatPokemonId(pokemon.id)}
          </span>
        </div>

        {/* Pokemon Image */}
        <div className="relative pt-4 px-4 flex justify-center">
          <div className="relative w-32 h-32">
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 ${colors.solid} opacity-10 rounded-full blur-lg`} />
            <img
              src={getArtwork(pokemon.id)}
              alt={pokemon.name}
              className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        </div>

        {/* Info */}
        <div className="relative p-4 pt-2">
          <h3 className="font-heading font-bold text-base text-foreground mb-2">
            {capitalize(pokemon.name)}
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {pokemon.types?.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}