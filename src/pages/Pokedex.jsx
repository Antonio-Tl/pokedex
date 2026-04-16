import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PokemonCard from '@/components/pokedex/PokemonCard';
import PokemonDetail from '@/components/pokedex/PokemonDetail';
import SearchBar from '@/components/pokedex/SearchBar';
import TypeFilter from '@/components/pokedex/TypeFilter';
import LoadingSkeleton from '@/components/pokedex/LoadingSkeleton';

const PAGE_SIZE = 40;
// Total number of "real" pokemon (no forms/variants) — IDs 1-1025
const TOTAL_POKEMON = 1025;

const GENERATIONS = [
  { key: 'gen1', label: 'Gen 1', min: 1, max: 151 },
  { key: 'gen2', label: 'Gen 2', min: 152, max: 251 },
  { key: 'gen3', label: 'Gen 3', min: 252, max: 386 },
  { key: 'gen4', label: 'Gen 4', min: 387, max: 493 },
  { key: 'gen5', label: 'Gen 5', min: 494, max: 649 },
  { key: 'gen6', label: 'Gen 6', min: 650, max: 721 },
  { key: 'gen7', label: 'Gen 7', min: 722, max: 809 },
  { key: 'gen8', label: 'Gen 8', min: 810, max: 905 },
  { key: 'gen9', label: 'Gen 9', min: 906, max: 1025 },
];

export default function Pokedex() {
  // pokemonList: array of { id, name, url } — lightweight, loaded upfront
  const [pokemonList, setPokemonList] = useState([]);
  // pokemonCache: map of id -> full detail object, filled lazily
  const [pokemonCache, setPokemonCache] = useState({});
  // Which page of the filtered list we're showing
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [generationFilter, setGenerationFilter] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const fetchingRef = useRef(new Set());

  // Step 1: Load lightweight list of all pokemon names+ids upfront
  useEffect(() => {
    const loadList = async () => {
      setIsLoadingList(true);
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}&offset=0`);
      const data = await res.json();
      const list = data.results.map((p, i) => {
        const id = parseInt(p.url.split('/').filter(Boolean).pop());
        return { id, name: p.name, url: p.url };
      }).filter(p => p.id <= TOTAL_POKEMON);
      // Sort by id
      list.sort((a, b) => a.id - b.id);
      setPokemonList(list);
      setIsLoadingList(false);
    };
    loadList();
  }, []);

  const generationFilteredList = useMemo(() => {
    if (!generationFilter) return pokemonList;
    const selectedGen = GENERATIONS.find((g) => g.key === generationFilter);
    if (!selectedGen) return pokemonList;
    return pokemonList.filter((p) => p.id >= selectedGen.min && p.id <= selectedGen.max);
  }, [pokemonList, generationFilter]);

  // Step 2: Whenever the visible slice changes, fetch missing details
  const filteredList = useMemo(() => {
    if (!search && !typeFilter) return generationFilteredList;

    const s = search.toLowerCase();
    return generationFilteredList.filter(p => {
      const nameMatch = !search || p.name.includes(s) || String(p.id).includes(s);
      if (!nameMatch) return false;
      if (typeFilter) {
        const cached = pokemonCache[p.id];
        if (!cached) return true; // optimistically include until we know
        return cached.types?.some(t => t.type.name === typeFilter);
      }
      return true;
    });
  }, [generationFilteredList, search, typeFilter, pokemonCache]);

  const visibleSlice = filteredList.slice(0, displayedCount);

  // Fetch details for visible pokemon that aren't cached yet
  useEffect(() => {
    const missing = visibleSlice.filter(p => !pokemonCache[p.id] && !fetchingRef.current.has(p.id));
    if (missing.length === 0) return;

    missing.forEach(p => fetchingRef.current.add(p.id));

    const batchSize = 20;
    const fetchBatch = async (batch) => {
      const results = await Promise.all(
        batch.map(p => fetch(p.url).then(r => r.json()))
      );
      setPokemonCache(prev => {
        const next = { ...prev };
        results.forEach(r => { next[r.id] = r; });
        return next;
      });
    };

    for (let i = 0; i < missing.length; i += batchSize) {
      fetchBatch(missing.slice(i, i + batchSize));
    }
  }, [visibleSlice]);

  // After type filter: re-filter with actual cached type data
  const filteredWithTypes = useMemo(() => {
    if (!typeFilter) return filteredList;
    return filteredList.filter(p => {
      const cached = pokemonCache[p.id];
      if (!cached) return false; // exclude until fetched
      return cached.types?.some(t => t.type.name === typeFilter);
    });
  }, [filteredList, typeFilter, pokemonCache]);

  const finalList = typeFilter ? filteredWithTypes : filteredList;
  const displayedPokemon = finalList.slice(0, displayedCount).map(p => pokemonCache[p.id]).filter(Boolean);
  const hasMore = displayedCount < finalList.length;

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedCount(prev => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 200);
  };

  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
  }, [search, typeFilter, generationFilter]);

  const handlePokemonClick = (pokemon) => setSelectedPokemon(pokemon);

  const handleNavigate = useCallback(async (id) => {
    const cached = pokemonCache[id];
    if (cached) {
      setSelectedPokemon(cached);
      return;
    }
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (res.ok) {
      const data = await res.json();
      setPokemonCache(prev => ({ ...prev, [id]: data }));
      setSelectedPokemon(data);
    }
  }, [pokemonCache]);

  const loadingCards = visibleSlice.length - displayedPokemon.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        {/* Pokeball watermark */}
        <div className="absolute -right-20 -top-20 w-80 h-80 opacity-[0.03]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" />
            <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
                National Pokédex
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              Pokédex
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md">
              {isLoadingList
                ? 'Lade alle Pokémon…'
                : `Alle ${pokemonList.length} Pokémon aus allen Generationen.`}
            </p>
          </motion.div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start">
            <SearchBar value={search} onChange={setSearch} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              {isLoadingList ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{finalList.length} Pokémon</span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <TypeFilter selected={typeFilter} onSelect={setTypeFilter} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setGenerationFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all ${
                !generationFilter
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              All Gens
            </button>
            {GENERATIONS.map((gen) => (
              <button
                key={gen.key}
                onClick={() => setGenerationFilter(gen.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all ${
                  generationFilter === gen.key
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {gen.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Pokemon Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoadingList ? (
          <LoadingSkeleton />
        ) : finalList.length === 0 && typeFilter && Object.keys(pokemonCache).length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Kein Pokémon gefunden</h3>
            <p className="text-muted-foreground">Versuch einen anderen Suchbegriff oder Filter.</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayedPokemon.map((pokemon, index) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  onClick={handlePokemonClick}
                  index={index}
                />
              ))}
              {/* Skeleton placeholders for cards being fetched */}
              {loadingCards > 0 && Array.from({ length: Math.min(loadingCards, 6) }).map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-card rounded-2xl border border-border overflow-hidden p-4 animate-pulse">
                  <div className="flex justify-end mb-2"><div className="h-4 w-10 bg-secondary rounded" /></div>
                  <div className="flex justify-center mb-4"><div className="w-24 h-24 bg-secondary rounded-full" /></div>
                  <div className="h-5 w-24 bg-secondary rounded mb-2" />
                  <div className="flex gap-1.5"><div className="h-5 w-14 bg-secondary rounded-full" /></div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="rounded-xl px-8 h-11 font-heading"
                >
                  {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Mehr laden ({finalList.length - displayedCount} weitere)
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedPokemon && (
        <PokemonDetail
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}