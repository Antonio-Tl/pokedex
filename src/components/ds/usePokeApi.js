import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ALL_TYPES } from '@/lib/typeChart';
import { TOTAL_POKEMON, idFromUrl } from './dsData';

const API = 'https://pokeapi.co/api/v2/';

/** "https://pokeapi.co/api/v2/pokemon/6/" or "pokemon/6" → "pokemon/6" */
const toPath = (pathOrUrl) => String(pathOrUrl).replace(API, '').replace(/\/$/, '');

const fetchPoke = async (path) => {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`PokeAPI ${res.status}: ${path}`);
  return res.json();
};

// PokeAPI data is static: fetch every resource once per session and keep it.
const pokeQuery = (pathOrUrl) => {
  const path = pathOrUrl ? toPath(pathOrUrl) : null;
  return {
    queryKey: ['pokeapi', path],
    queryFn: () => fetchPoke(path),
    enabled: !!path,
    staleTime: Infinity,
    gcTime: Infinity,
  };
};

/** One PokeAPI resource; pass a path ("pokemon/25"), a full URL, or null to skip. */
export const usePoke = (pathOrUrl) => useQuery(pokeQuery(pathOrUrl));

/** Several resources at once; returns [{ data, isLoading, ... }] in input order. */
export const usePokeMany = (pathsOrUrls) => useQueries({ queries: pathsOrUrls.map(pokeQuery) });

/**
 * National Dex index: [{ id, name }] for all species, plus a map id → [types]
 * built from the 18 /type/{name} endpoints (18 requests instead of 1025).
 */
export function useDexIndex() {
  const listQ = usePoke(`pokemon-species?limit=${TOTAL_POKEMON}`);
  const typeQs = usePokeMany(ALL_TYPES.map((t) => `type/${t}`));

  const list = useMemo(() => (
    (listQ.data?.results || [])
      .map((r) => ({ id: idFromUrl(r.url), name: r.name }))
      .filter((p) => p.id <= TOTAL_POKEMON)
      .sort((a, b) => a.id - b.id)
  ), [listQ.data]);

  const typeData = typeQs.map((q) => q.data);
  const typesById = useMemo(() => {
    const slots = new Map();
    typeData.forEach((data, i) => {
      if (!data) return;
      data.pokemon.forEach(({ pokemon, slot }) => {
        const id = idFromUrl(pokemon.url);
        if (id > TOTAL_POKEMON) return;
        if (!slots.has(id)) slots.set(id, []);
        slots.get(id).push([slot, ALL_TYPES[i]]);
      });
    });
    const out = {};
    slots.forEach((arr, id) => { out[id] = arr.sort((a, b) => a[0] - b[0]).map((x) => x[1]); });
    return out;
  }, typeData);

  const loadedTypes = useMemo(
    () => new Set(ALL_TYPES.filter((_, i) => typeData[i])),
    typeData
  );

  return { list, typesById, loadedTypes, isLoading: listQ.isLoading, isError: listQ.isError };
}
