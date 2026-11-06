import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Weight, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getArtwork, formatPokemonId, capitalize, getTypeColor } from '@/lib/pokeUtils';
import TypeBadge from './TypeBadge';
import StatBar from './StatBar';
import { getDefensiveMultipliers } from '@/lib/typeChart';

const formatMultiplier = (value) => {
  if (value === 0) return 'x0';
  if (value === 0.25) return 'x0.25';
  if (value === 0.5) return 'x0.5';
  if (value === 1) return 'x1';
  if (value === 2) return 'x2';
  if (value === 4) return 'x4';
  return `x${value}`;
};

export default function PokemonDetail({ pokemon, onClose, onNavigate }) {
  const [speciesData, setSpeciesData] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [isLoadingEvolution, setIsLoadingEvolution] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!pokemon) return;
    setSpeciesData(null);
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
      .then(r => r.json())
      .then(setSpeciesData);
  }, [pokemon?.id]);

  useEffect(() => {
    const evolutionUrl = speciesData?.evolution_chain?.url;
    if (!evolutionUrl) {
      setEvolutionChain(null);
      return;
    }

    setIsLoadingEvolution(true);
    fetch(evolutionUrl)
      .then((r) => r.json())
      .then(setEvolutionChain)
      .finally(() => setIsLoadingEvolution(false));
  }, [speciesData?.evolution_chain?.url]);

  const evolutionEntries = useMemo(() => {
    if (!evolutionChain?.chain) return [];

    const entries = [];
    const parseIdFromSpeciesUrl = (url) => {
      const rawId = url?.split('/').filter(Boolean).pop();
      const parsed = Number(rawId);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const walk = (node, fromRequirements = { minLevel: null, requiredItem: null }) => {
      if (!node?.species) return;

      entries.push({
        id: parseIdFromSpeciesUrl(node.species.url),
        name: node.species.name,
        minLevel: fromRequirements.minLevel,
        requiredItem: fromRequirements.requiredItem,
      });

      node.evolves_to?.forEach((nextNode) => {
        const evolutionDetail = nextNode.evolution_details?.find((d) => d.min_level != null || d.item != null)
          || nextNode.evolution_details?.[0]
          || null;
        const minLevel = evolutionDetail?.min_level ?? null;
        const requiredItem = evolutionDetail?.item?.name ?? null;
        walk(nextNode, {
          minLevel,
          requiredItem,
        });
      });
    };

    walk(evolutionChain.chain, { minLevel: null, requiredItem: null });

    const deduped = new Map();
    entries.forEach((entry) => {
      if (!entry.id) return;
      if (!deduped.has(entry.id)) {
        deduped.set(entry.id, entry);
        return;
      }

      const existing = deduped.get(entry.id);
      const hasExistingRequirement = existing.minLevel != null || existing.requiredItem != null;
      const hasIncomingRequirement = entry.minLevel != null || entry.requiredItem != null;
      if (!hasExistingRequirement && hasIncomingRequirement) {
        deduped.set(entry.id, entry);
      }
    });

    return Array.from(deduped.values()).sort((a, b) => a.id - b.id);
  }, [evolutionChain]);

  if (!pokemon) return null;

  const mainType = pokemon.types?.[0]?.type?.name || 'normal';
  const colors = getTypeColor(mainType);
  const description = speciesData?.flavor_text_entries
    ?.find(e => e.language.name === 'en')
    ?.flavor_text?.replace(/\f/g, ' ') || '';
  const genus = speciesData?.genera?.find(g => g.language.name === 'en')?.genus || '';
  const chainCount = evolutionEntries.length;
  const hasLongChain = chainCount >= 4;
  const isThreeStageChain = chainCount === 3;

  const cardWidthClass = hasLongChain
    ? 'w-[92px] sm:w-[102px] md:w-[110px]'
    : isThreeStageChain
      ? 'w-[120px] sm:w-[132px] md:w-[140px]'
      : 'w-[144px] sm:w-[160px] md:w-[172px]';

  const imageSizeClass = hasLongChain
    ? 'w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]'
    : isThreeStageChain
      ? 'w-[70px] h-[70px] sm:w-[78px] sm:h-[78px] md:w-[86px] md:h-[86px]'
      : 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28';

  const arrowWidthClass = hasLongChain ? 'w-9 sm:w-10 md:w-11' : 'w-11 sm:w-12 md:w-14';
  const MAX_POKEMON_ID = 1025;

  const typeEffectiveness = useMemo(() => {
    const defendingTypes = pokemon.types?.map((t) => t.type.name) || [];

    const entries = getDefensiveMultipliers(defendingTypes);

    const grouped = {
      strong: entries
        .filter((entry) => entry.multiplier < 1)
        .sort((a, b) => a.multiplier - b.multiplier || a.type.localeCompare(b.type)),
      neutral: entries
        .filter((entry) => entry.multiplier === 1)
        .sort((a, b) => a.type.localeCompare(b.type)),
      weak: entries
        .filter((entry) => entry.multiplier > 1)
        .sort((a, b) => b.multiplier - a.multiplier || a.type.localeCompare(b.type)),
    };

    return grouped;
  }, [pokemon.types]);

  const handleStepNavigate = async (targetId) => {
    if (!targetId || targetId < 1 || targetId > MAX_POKEMON_ID || isNavigating) return;
    setIsNavigating(true);
    try {
      await onNavigate(targetId);
    } finally {
      setIsNavigating(false);
    }
  };

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
          className="relative bg-card w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header with gradient */}
          <div className={`relative bg-gradient-to-br ${colors.gradient} to-transparent p-6 pb-20`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-sm font-semibold text-muted-foreground/70">
                  {formatPokemonId(pokemon.id)}
                </span>
                <h2 className="font-heading text-3xl font-bold text-foreground mt-1">
                  {capitalize(pokemon.name)}
                </h2>
                {genus && (
                  <p className="text-sm text-muted-foreground mt-1">{genus}</p>
                )}
                <div className="flex gap-2 mt-3">
                  {pokemon.types?.map((t) => (
                    <TypeBadge key={t.type.name} type={t.type.name} size="lg" />
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full bg-background/50 hover:bg-background/80"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation arrows */}
            <div className="absolute bottom-4 right-6 flex gap-2 z-20">
              {pokemon.id > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleStepNavigate(pokemon.id - 1)}
                  disabled={isNavigating || pokemon.id <= 1}
                  className="rounded-full bg-background/50 hover:bg-background/80 h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStepNavigate(pokemon.id + 1)}
                disabled={isNavigating || pokemon.id >= MAX_POKEMON_ID}
                className="rounded-full bg-background/50 hover:bg-background/80 h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Pokemon Image floating */}
          <div className="flex justify-center -mt-16 relative z-10">
            <motion.img
              key={pokemon.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={getArtwork(pokemon.id)}
              alt={pokemon.name}
              className="w-48 h-48 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}

            {/* Physical info */}
            <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
              <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Overview</h3>
              <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <Ruler className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="font-mono text-sm font-bold">{(pokemon.height / 10).toFixed(1)}m</p>
                <p className="text-xs text-muted-foreground">Height</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <Weight className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="font-mono text-sm font-bold">{(pokemon.weight / 10).toFixed(1)}kg</p>
                <p className="text-xs text-muted-foreground">Weight</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <Zap className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="font-mono text-sm font-bold">{pokemon.base_experience || '—'}</p>
                <p className="text-xs text-muted-foreground">Base XP</p>
              </div>
              </div>
            </div>

            {/* Abilities */}
            <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
              <h3 className="font-heading font-semibold text-sm text-foreground mb-2">Abilities</h3>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities?.map((a) => (
                  <span
                    key={a.ability.name}
                    className={`px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground ${a.is_hidden ? 'opacity-60 border border-dashed border-border' : ''}`}
                  >
                    {capitalize(a.ability.name.replace('-', ' '))}
                    {a.is_hidden && ' (Hidden)'}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
              <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Base Stats</h3>
              <div className="space-y-2.5">
                {pokemon.stats?.map((stat, i) => (
                  <StatBar key={stat.stat.name} stat={stat} delay={i * 0.08} />
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-muted-foreground">Total</span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {pokemon.stats?.reduce((sum, s) => sum + s.base_stat, 0)}
                </span>
              </div>
            </div>

            {/* Type Effectiveness */}
            <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
              <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Type Matchups</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                  <p className="font-mono text-xs text-muted-foreground mb-2">Strong to</p>
                  <div className="flex flex-wrap gap-1.5">
                    {typeEffectiveness.strong.map(({ type, multiplier }) => (
                      <span key={`strong-${type}`} className="inline-flex items-center gap-1">
                        <TypeBadge type={type} />
                        <span className="text-[10px] font-mono text-muted-foreground">{formatMultiplier(multiplier)}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                  <p className="font-mono text-xs text-muted-foreground mb-2">Neutral to</p>
                  <div className="flex flex-wrap gap-1.5">
                    {typeEffectiveness.neutral.map(({ type, multiplier }) => (
                      <span key={`neutral-${type}`} className="inline-flex items-center gap-1">
                        <TypeBadge type={type} />
                        <span className="text-[10px] font-mono text-muted-foreground">{formatMultiplier(multiplier)}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                  <p className="font-mono text-xs text-muted-foreground mb-2">Weak to</p>
                  <div className="flex flex-wrap gap-1.5">
                    {typeEffectiveness.weak.map(({ type, multiplier }) => (
                      <span key={`weak-${type}`} className="inline-flex items-center gap-1">
                        <TypeBadge type={type} />
                        <span className="text-[10px] font-mono text-muted-foreground">{formatMultiplier(multiplier)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Evolutions */}
            <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
              <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Evolution Chain</h3>
              {isLoadingEvolution ? (
                <p className="text-sm text-muted-foreground">Lade Evolutionen…</p>
              ) : evolutionEntries.length > 0 ? (
                <div className="overflow-x-auto pb-2">
                  <div className={`flex items-center gap-2 px-1 ${hasLongChain ? 'min-w-max' : 'w-full justify-center'}`}>
                    {evolutionEntries.map((entry, index) => {
                      const isCurrent = entry.id === pokemon.id;
                      const nextEntry = evolutionEntries[index + 1];

                      return (
                        <div key={entry.id} className="flex items-center gap-2">
                          <button
                            onClick={() => entry.id && onNavigate(entry.id)}
                            disabled={!entry.id}
                            className={`${cardWidthClass} rounded-xl p-2 border transition-all hover:bg-secondary/70 ${
                              isCurrent
                                ? 'bg-foreground text-background border-transparent'
                                : 'bg-card text-foreground border-border'
                            }`}
                          >
                            <img
                              src={getArtwork(entry.id)}
                              alt={entry.name}
                              className={`${imageSizeClass} mx-auto object-contain`}
                              loading="lazy"
                            />
                            <p className="text-[11px] sm:text-xs md:text-sm font-heading font-semibold text-center mt-1.5 truncate">
                              {capitalize(entry.name)}
                            </p>
                          </button>

                          {nextEntry && (
                            <div className={`flex flex-col items-center justify-center ${arrowWidthClass} shrink-0`}>
                              <span className="font-mono text-[10px] sm:text-xs font-semibold text-muted-foreground leading-none mb-1 text-center">
                                {nextEntry.requiredItem && nextEntry.minLevel != null
                                  ? `${capitalize(nextEntry.requiredItem.replace(/-/g, ' '))} • Lv ${nextEntry.minLevel}`
                                  : nextEntry.requiredItem
                                    ? capitalize(nextEntry.requiredItem.replace(/-/g, ' '))
                                    : nextEntry.minLevel != null
                                      ? `Lv ${nextEntry.minLevel}`
                                      : '—'}
                              </span>
                              <span className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-none">→</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Keine Evolution vorhanden.</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}