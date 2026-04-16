// @ts-nocheck
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Loader2, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { capitalize } from '@/lib/pokeUtils';
import ItemCard from '@/components/items/ItemCard';
import ItemDetail from '@/components/items/ItemDetail';

const PAGE_SIZE = 48;

const CATEGORIES = [
  'standard-balls', 'healing', 'medicine', 'vitamins', 'held-items',
  'evolution', 'berries', 'stat-boosts', 'all-machines',
];

const GENERATION_ORDER = [
  'generation-i',
  'generation-ii',
  'generation-iii',
  'generation-iv',
  'generation-v',
  'generation-vi',
  'generation-vii',
  'generation-viii',
  'generation-ix',
];

const VERSION_GROUP_TO_GENERATION = {
  'red-blue': 'generation-i',
  yellow: 'generation-i',
  'gold-silver': 'generation-ii',
  crystal: 'generation-ii',
  'ruby-sapphire': 'generation-iii',
  emerald: 'generation-iii',
  'firered-leafgreen': 'generation-iii',
  colosseum: 'generation-iii',
  xd: 'generation-iii',
  'diamond-pearl': 'generation-iv',
  platinum: 'generation-iv',
  'heartgold-soulsilver': 'generation-iv',
  'black-white': 'generation-v',
  'black-2-white-2': 'generation-v',
  'x-y': 'generation-vi',
  'omega-ruby-alpha-sapphire': 'generation-vi',
  'sun-moon': 'generation-vii',
  'ultra-sun-ultra-moon': 'generation-vii',
  'lets-go-pikachu-lets-go-eevee': 'generation-vii',
  'sword-shield': 'generation-viii',
  'brilliant-diamond-and-shining-pearl': 'generation-viii',
  'legends-arceus': 'generation-viii',
  'scarlet-violet': 'generation-ix',
};

const toGenerationLabel = (generationKey) => {
  const roman = generationKey?.replace('generation-', '').toUpperCase();
  return roman ? `Gen ${roman}` : 'Gen ?';
};

const enrichMachineItem = (item) => {
  if (item?.category?.name !== 'all-machines') return item;

  const generations = Array.from(new Set(
    (item.machines || [])
      .map((m) => VERSION_GROUP_TO_GENERATION[m.version_group?.name])
      .filter(Boolean)
  )).sort((a, b) => GENERATION_ORDER.indexOf(a) - GENERATION_ORDER.indexOf(b));

  return {
    ...item,
    machineGenerations: generations,
    machinePrimaryGeneration: generations[generations.length - 1] || null,
    machineGenerationLabel: generations.length > 0
      ? generations.map(toGenerationLabel).join(', ')
      : null,
  };
};

const mapBerryToDisplayItem = (berry) => {
  const topFlavors = (berry.flavors || [])
    .filter((f) => f.potency > 0)
    .sort((a, b) => b.potency - a.potency)
    .slice(0, 4)
    .map((f) => ({ name: `${f.flavor.name}-${f.potency}` }));

  return {
    id: berry.id,
    name: berry.name,
    url: `https://pokeapi.co/api/v2/berry/${berry.id}/`,
    category: { name: 'berries' },
    sprites: { default: null },
    cost: 0,
    effect_entries: [{
      language: { name: 'en' },
      short_effect: `Growth: ${berry.growth_time}h. Max harvest: ${berry.max_harvest}. Size: ${berry.size}.`,
    }],
    flavor_text_entries: [{
      language: { name: 'en' },
      text: `Natural Gift: ${berry.natural_gift_type?.name || 'unknown'} (${berry.natural_gift_power ?? 'n/a'})`,
    }],
    attributes: [
      berry.firmness?.name ? { name: `firmness-${berry.firmness.name}` } : null,
      ...topFlavors,
    ].filter(Boolean),
    __resourceType: 'berry',
    berry,
  };
};

export default function Items() {
  const [itemList, setItemList] = useState([]);       // lightweight {name, url, id}
  const [itemCache, setItemCache] = useState({});     // id -> full item data
  const [berryList, setBerryList] = useState([]);     // lightweight {name, url, id}
  const [berryCache, setBerryCache] = useState({});   // id -> full berry data
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingBerries, setIsLoadingBerries] = useState(false);
  const [isLoadingMachineGen, setIsLoadingMachineGen] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [machineGenerationFilter, setMachineGenerationFilter] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const fetchingRef = useRef(new Set());
  const berryFetchingRef = useRef(new Set());
  const machineFetchingRef = useRef(new Set());

  const isBerryMode = categoryFilter === 'berries';
  const isMachineMode = categoryFilter === 'all-machines';

  // Load full item list upfront (just names + urls)
  useEffect(() => {
    const load = async () => {
      setIsLoadingList(true);
      const res = await fetch('https://pokeapi.co/api/v2/item?limit=2000&offset=0');
      const data = await res.json();
      const list = data.results.map(item => {
        const id = parseInt(item.url.split('/').filter(Boolean).pop());
        return { id, name: item.name, url: item.url };
      });
      list.sort((a, b) => a.id - b.id);
      setItemList(list);
      setIsLoadingList(false);
    };
    load();
  }, []);

  // Load berry list only when berry category is selected
  useEffect(() => {
    const loadBerries = async () => {
      if (!isBerryMode || berryList.length > 0) return;
      setIsLoadingBerries(true);
      const res = await fetch('https://pokeapi.co/api/v2/berry?limit=1000&offset=0');
      const data = await res.json();
      const list = data.results.map((berry) => {
        const id = parseInt(berry.url.split('/').filter(Boolean).pop());
        return { id, name: berry.name, url: berry.url };
      });
      list.sort((a, b) => a.id - b.id);
      setBerryList(list);
      setIsLoadingBerries(false);
    };
    loadBerries();
  }, [isBerryMode, berryList.length]);

  // Filter by name
  const sourceList = isBerryMode ? berryList : itemList;
  const nameFiltered = useMemo(() => {
    if (!search) return sourceList;
    const s = search.toLowerCase();
    return sourceList.filter(p => p.name.includes(s) || String(p.id).includes(s));
  }, [sourceList, search]);

  const categoryFilteredList = useMemo(() => {
    if (isBerryMode) return nameFiltered;
    if (!categoryFilter) return nameFiltered;

    return nameFiltered.filter((item) => {
      const cached = itemCache[item.id];
      if (!cached) return true; // optimistic include until fetched
      return cached.category?.name === categoryFilter;
    });
  }, [nameFiltered, isBerryMode, categoryFilter, itemCache]);

  // Apply category filter (needs cached data)
  const finalList = useMemo(() => {
    if (categoryFilter === 'all-machines' && machineGenerationFilter) {
      return categoryFilteredList.filter((item) => {
        const cached = itemCache[item.id];
        if (!cached) return false;
        const generations = cached.machineGenerations || [];
        return generations.includes(machineGenerationFilter);
      });
    }

    return categoryFilteredList;
  }, [categoryFilter, machineGenerationFilter, categoryFilteredList, itemCache]);

  const visibleSlice = finalList.slice(0, displayedCount);

  const parseIdFromUrl = (url) => {
    const rawId = url?.split('/').filter(Boolean).pop();
    const parsed = Number(rawId);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  // Lazily fetch details for visible items
  useEffect(() => {
    if (isBerryMode) {
      const missingBerries = visibleSlice.filter(p => !berryCache[p.id] && !berryFetchingRef.current.has(p.id));
      if (!missingBerries.length) return;
      missingBerries.forEach(p => berryFetchingRef.current.add(p.id));

      const batchFetchBerries = async (batch) => {
        const results = await Promise.all(batch.map(p => fetch(p.url).then(r => r.json())));
        setBerryCache(prev => {
          const next = { ...prev };
          results.forEach(r => { next[r.id] = r; });
          return next;
        });
      };

      for (let i = 0; i < missingBerries.length; i += 20) {
        batchFetchBerries(missingBerries.slice(i, i + 20));
      }
      return;
    }

    const missing = visibleSlice.filter(p => !itemCache[p.id] && !fetchingRef.current.has(p.id));
    if (!missing.length) return;
    missing.forEach(p => fetchingRef.current.add(p.id));

    const batchFetch = async (batch) => {
      const results = await Promise.all(batch.map(p => fetch(p.url).then(r => r.json())));
      setItemCache(prev => {
        const next = { ...prev };
          results.forEach(r => { next[r.id] = enrichMachineItem(r); });
        return next;
      });
    };

    for (let i = 0; i < missing.length; i += 20) {
      batchFetch(missing.slice(i, i + 20));
    }
  }, [visibleSlice, isBerryMode, berryCache, itemCache]);

  // For all-machines items, fetch machine endpoint only after user selected a generation
  useEffect(() => {
    if (isBerryMode || categoryFilter !== 'all-machines' || !machineGenerationFilter) {
      setIsLoadingMachineGen(false);
      return;
    }

    const hasResolvedGeneration = (item, generationKey) => {
      if (!item?.machineMoveByGeneration) return false;
      return Object.prototype.hasOwnProperty.call(item.machineMoveByGeneration, generationKey);
    };

    const machineItems = categoryFilteredList
      .slice(0, displayedCount)
      .map((p) => itemCache[p.id])
      .filter((item) => (
        item
        && item.category?.name === 'all-machines'
        && item.machines?.length > 0
        && !hasResolvedGeneration(item, machineGenerationFilter)
        && !machineFetchingRef.current.has(`${item.id}:${machineGenerationFilter}`)
      ));

    if (machineItems.length === 0) {
      setIsLoadingMachineGen(false);
      return;
    }

    setIsLoadingMachineGen(true);

    machineItems.forEach((item) => machineFetchingRef.current.add(`${item.id}:${machineGenerationFilter}`));

    const resolveMachineMove = async (item, generationKey) => {
      try {
        const candidates = item.machines
          .filter((m) => VERSION_GROUP_TO_GENERATION[m.version_group?.name] === generationKey && !!m.machine?.url)
          .sort((a, b) => parseIdFromUrl(b.machine.url) - parseIdFromUrl(a.machine.url));

        const preferredMachine = candidates[0];
        if (!preferredMachine?.machine?.url) {
          setItemCache((prev) => ({
            ...prev,
            [item.id]: {
              ...prev[item.id],
              machineMoveByGeneration: {
                ...(prev[item.id]?.machineMoveByGeneration || {}),
                [generationKey]: null,
              },
            },
          }));
          return;
        }

        const res = await fetch(preferredMachine.machine.url);
        const machineData = res.ok ? await res.json() : null;

        setItemCache((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            machineMoveName: machineData?.move?.name || null,
            machineApiId: machineData?.id || null,
            machineMoveByGeneration: {
              ...(prev[item.id]?.machineMoveByGeneration || {}),
              [generationKey]: machineData?.move?.name || null,
            },
          },
        }));
      } catch {
        setItemCache((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            machineMoveByGeneration: {
              ...(prev[item.id]?.machineMoveByGeneration || {}),
              [generationKey]: null,
            },
          },
        }));
      }
    };

    Promise.all(machineItems.map((item) => resolveMachineMove(item, machineGenerationFilter)))
      .finally(() => setIsLoadingMachineGen(false));
  }, [categoryFilteredList, displayedCount, itemCache, categoryFilter, isBerryMode, machineGenerationFilter]);

  // After category filter: exclude items that are cached and don't match
  const displayedWithTypes = useMemo(() => {
    if (isBerryMode) {
      return visibleSlice
        .filter(p => !!berryCache[p.id])
        .map(p => mapBerryToDisplayItem(berryCache[p.id]));
    }

    if (!categoryFilter) return visibleSlice.map(p => itemCache[p.id]).filter(Boolean);
    return visibleSlice
      .filter(p => {
        const cached = itemCache[p.id];
        if (!cached) return false;
        return cached.category?.name === categoryFilter;
      })
      .map(p => {
        const cached = itemCache[p.id];
        if (categoryFilter === 'all-machines' && machineGenerationFilter) {
          return {
            ...cached,
            machineMoveName: cached.machineMoveByGeneration?.[machineGenerationFilter] ?? null,
            machineGenerationLabel: toGenerationLabel(machineGenerationFilter),
          };
        }
        return cached;
      });
  }, [visibleSlice, categoryFilter, itemCache, isBerryMode, berryCache, machineGenerationFilter]);

  const displayedItems = categoryFilter ? displayedWithTypes : visibleSlice.map(p => itemCache[p.id]).filter(Boolean);
  const loadingCount = visibleSlice.length - displayedItems.length;
  const hasMore = displayedCount < finalList.length;

  useEffect(() => { setDisplayedCount(PAGE_SIZE); }, [search, categoryFilter, machineGenerationFilter]);

  const handleNavigate = useCallback(async (id) => {
    const isBerrySelection = selectedItem?.__resourceType === 'berry' || categoryFilter === 'berries';

    if (isBerrySelection) {
      const cachedBerry = berryCache[id];
      if (cachedBerry) {
        setSelectedItem(mapBerryToDisplayItem(cachedBerry));
        return;
      }
      const res = await fetch(`https://pokeapi.co/api/v2/berry/${id}`);
      if (res.ok) {
        const berryData = await res.json();
        setBerryCache(prev => ({ ...prev, [berryData.id]: berryData }));
        setSelectedItem(mapBerryToDisplayItem(berryData));
      }
      return;
    }

    const cached = itemCache[id];
    if (cached) {
      if (categoryFilter === 'all-machines' && machineGenerationFilter) {
        setSelectedItem({
          ...cached,
          machineMoveName: cached.machineMoveByGeneration?.[machineGenerationFilter] ?? cached.machineMoveName ?? null,
          machineGenerationLabel: toGenerationLabel(machineGenerationFilter),
        });
      } else {
        setSelectedItem(cached);
      }
      return;
    }
    const res = await fetch(`https://pokeapi.co/api/v2/item/${id}`);
    if (res.ok) {
      const data = await res.json();
      const enriched = enrichMachineItem(data);
      setItemCache(prev => ({ ...prev, [data.id]: enriched }));
      if (categoryFilter === 'all-machines' && machineGenerationFilter) {
        setSelectedItem({
          ...enriched,
          machineMoveName: enriched.machineMoveByGeneration?.[machineGenerationFilter] ?? enriched.machineMoveName ?? null,
          machineGenerationLabel: toGenerationLabel(machineGenerationFilter),
        });
      } else {
        setSelectedItem(enriched);
      }
    }
  }, [itemCache, berryCache, selectedItem, categoryFilter, machineGenerationFilter]);

  useEffect(() => {
    if (!isMachineMode) {
      setMachineGenerationFilter(null);
    }
  }, [isMachineMode]);

  const isLoadingActive = isLoadingList || (isBerryMode && isLoadingBerries) || (isMachineMode && !!machineGenerationFilter && isLoadingMachineGen);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5" />
        <div className="absolute -right-16 -top-16 w-64 h-64 opacity-[0.04]">
          <Package className="w-full h-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
              <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
                Item Database
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              Items
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md">
              {isLoadingActive
                ? (isBerryMode ? 'Lade alle Beeren…' : 'Lade alle Items…')
                : (isBerryMode
                  ? `Alle ${berryList.length} Beeren aus allen Generationen.`
                  : `Alle ${itemList.length} Items aus allen Generationen.`)}
            </p>
          </motion.div>

          {/* Search */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Item suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 pr-10 h-12 rounded-xl bg-card border-border font-heading text-sm"
              />
              {search && (
                <Button variant="ghost" size="icon" onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full">
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              {isLoadingActive
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <span>{finalList.length} {isBerryMode ? 'Beeren' : 'Items'}</span>}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all ${
                !categoryFilter ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold border transition-all ${
                  categoryFilter === cat
                    ? 'bg-foreground text-background border-transparent'
                    : 'bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80'
                }`}
              >
                {capitalize(cat.replace(/-/g, ' '))}
              </button>
            ))}
          </div>

          {isMachineMode && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-mono text-muted-foreground">Gen:</span>
              <button
                onClick={() => setMachineGenerationFilter(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-heading font-semibold transition-all ${
                  !machineGenerationFilter
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                All
              </button>
              {GENERATION_ORDER.map((generationKey) => (
                <button
                  key={generationKey}
                  onClick={() => setMachineGenerationFilter(generationKey)}
                  className={`px-2.5 py-1 rounded-full text-xs font-heading font-semibold transition-all ${
                    machineGenerationFilter === generationKey
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {toGenerationLabel(generationKey)}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoadingActive ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
                <div className="w-12 h-12 bg-secondary rounded-xl mx-auto mb-3" />
                <div className="h-4 bg-secondary rounded mx-auto w-3/4 mb-2" />
                <div className="h-3 bg-secondary rounded mx-auto w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {displayedItems.map((item, index) => (
                <ItemCard key={item.id} item={item} onClick={setSelectedItem} index={index} />
              ))}
              {loadingCount > 0 && Array.from({ length: Math.min(loadingCount, 8) }).map((_, i) => (
                <div key={`sk-${i}`} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
                  <div className="w-12 h-12 bg-secondary rounded-xl mx-auto mb-3" />
                  <div className="h-4 bg-secondary rounded mx-auto w-3/4 mb-2" />
                  <div className="h-3 bg-secondary rounded mx-auto w-1/2" />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button
                  onClick={() => setDisplayedCount(prev => prev + PAGE_SIZE)}
                  variant="outline"
                  className="rounded-xl px-8 h-11 font-heading"
                >
                  Mehr laden ({finalList.length - displayedCount} weitere)
                </Button>
              </div>
            )}

            {!isLoadingList && displayedItems.length === 0 && Object.keys(itemCache).length > 10 && (
              <div className="text-center py-20">
                <p className="text-6xl mb-4">🔍</p>
                <h3 className="font-heading text-xl font-semibold mb-2">Kein Item gefunden</h3>
                <p className="text-muted-foreground">Versuch einen anderen Suchbegriff.</p>
              </div>
            )}
          </>
        )}
      </main>

      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}