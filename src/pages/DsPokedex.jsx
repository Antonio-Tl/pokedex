import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_TYPES } from '@/lib/typeChart';
import DsDevice from '@/components/ds/DsDevice';
import DsBrowser from '@/components/ds/DsBrowser';
import DsTabs from '@/components/ds/DsTabs';
import { TopEntry, TopOverview } from '@/components/ds/DsTopScreens';
import { useDexIndex, usePoke } from '@/components/ds/usePokeApi';
import {
  EDITIONS, MOVE_VERSION_GROUP_ALIASES, TABS, editionOfVersion, flattenChain, formLabel, genOf, prettyName,
} from '@/components/ds/dsData';

const TYPE_CYCLE = [null, ...ALL_TYPES];

/** Pokédex in the dual-screen design. */
export default function DsPokedex() {
  const { list, typesById, loadedTypes, isLoading } = useDexIndex();

  const [sel, setSel] = useState(25);
  const [q, setQ] = useState('');
  const [type, setType] = useState(null);
  const [gen, setGen] = useState(null);
  const [view, setView] = useState('grid');
  const [more, setMore] = useState(false);
  const [tab, setTab] = useState('abilities');
  const [shiny, setShiny] = useState(false);
  const [pixel, setPixel] = useState(false);
  const [form, setForm] = useState(null);
  const [edition, setEdition] = useState(null);
  const [method, setMethod] = useState('level-up');

  // ── filtered list ──────────────────────────────────────────────────
  const typePending = !!type && !loadedTypes.has(type);
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase().replace(/^(no\.?|#)\s*/, '');
    const num = /^\d+$/.test(term) ? parseInt(term, 10) : null;
    return list.filter((p) => {
      const okQ = !term
        || p.name.includes(term)
        || prettyName(p.name).toLowerCase().includes(term)
        || (num !== null && p.id === num);
      const okT = !type || (typesById[p.id] || []).includes(type);
      const okG = !gen || genOf(p.id) === gen;
      return okQ && okT && okG;
    });
  }, [list, q, type, gen, typesById]);

  const select = (id) => { setSel(id); setForm(null); setEdition(null); };

  // ── selected Pokémon ───────────────────────────────────────────────
  const entry = list.find((p) => p.id === sel) ?? (list.length ? null : { id: sel, name: '' });
  const pokemonQ = usePoke(`pokemon/${sel}`);
  const speciesQ = usePoke(`pokemon-species/${sel}`);
  const chainQ = usePoke(speciesQ.data?.evolution_chain?.url);
  const encountersQ = usePoke(more ? `pokemon/${sel}/encounters` : null);
  const pokemon = pokemonQ.data;
  const species = speciesQ.data;
  const chain = useMemo(() => (chainQ.data ? flattenChain(chainQ.data.chain) : null), [chainQ.data]);
  const displayEntry = entry ?? { id: sel, name: species?.name ?? pokemon?.name ?? '' };

  // forms: species varieties (Mega, Gigadynamax, regional …) + cosmetic forms
  const formChips = useMemo(() => {
    if (!pokemon || !species) return [];
    const chips = [{ key: null, label: 'Standard' }];
    species.varieties.filter((v) => !v.is_default).forEach((v) => {
      chips.push({ key: `pokemon/${v.pokemon.name}`, label: formLabel(v.pokemon.name, species.name) });
    });
    pokemon.forms.slice(1).forEach((f) => {
      chips.push({ key: `pokemon-form/${f.name}`, label: formLabel(f.name, species.name) });
    });
    return chips;
  }, [pokemon, species]);
  const formQ = usePoke(form);
  const isVariety = form?.startsWith('pokemon/');
  const active = isVariety ? formQ.data : pokemon; // data for sprite, abilities, EVs, types, moves
  const sprites = form ? formQ.data?.sprites : pokemon?.sprites;

  // editions with any data for this Pokémon, in release order
  const editions = useMemo(() => {
    const keys = new Set();
    species?.flavor_text_entries?.forEach((f) => {
      const k = editionOfVersion(f.version?.name);
      if (k) keys.add(k);
    });
    (active ?? pokemon)?.moves?.forEach((m) => m.version_group_details.forEach((d) => {
      keys.add(MOVE_VERSION_GROUP_ALIASES[d.version_group.name] ?? d.version_group.name);
    }));
    encountersQ.data?.forEach((enc) => enc.version_details.forEach((v) => {
      const k = editionOfVersion(v.version.name);
      if (k) keys.add(k);
    }));
    return EDITIONS.filter((e) => keys.has(e.key));
  }, [species, active, pokemon, encountersQ.data]);

  const defaultEdition = useMemo(() => {
    const withText = editions.filter((e) => species?.flavor_text_entries?.some(
      (f) => e.versions.includes(f.version.name) && ['de', 'en'].includes(f.language.name)
    ));
    return (withText[withText.length - 1] ?? editions[editions.length - 1])?.key ?? null;
  }, [editions, species]);
  const currentEdition = editions.some((e) => e.key === edition) ? edition : defaultEdition;

  // ── device controls ────────────────────────────────────────────────
  const step = (d) => {
    if (!rows.length) return;
    const i = rows.findIndex((r) => r.id === sel);
    const n = i === -1 ? 0 : (i + d + rows.length) % rows.length;
    select(rows[n].id);
  };
  const pressA = () => {
    if (!more) { setMore(true); return; }
    const i = TABS.findIndex(([k]) => k === tab);
    setTab(TABS[(i + 1) % TABS.length][0]);
  };
  const pressB = () => {
    if (more) setMore(false);
    else { setQ(''); setType(null); setGen(null); }
  };
  const random = () => {
    const pool = rows.length ? rows : list;
    if (pool.length) select(pool[Math.floor(Math.random() * pool.length)].id);
  };
  const cycleType = () => setType((t) => TYPE_CYCLE[(TYPE_CYCLE.indexOf(t) + 1) % TYPE_CYCLE.length]);
  const toggleView = () => setView((v) => (v === 'grid' ? 'list' : 'grid'));

  const controls = {
    onPrev: () => step(-1), onNext: () => step(1), onA: pressA, onB: pressB, onX: random, onY: cycleType,
    onSelect: toggleView, aAria: more ? 'Nächster Tab' : 'Pokédex-Eintrag öffnen',
  };

  // keyboard: arrows, A/B/X/Y, Enter, Escape
  const keyRef = useRef(controls);
  keyRef.current = controls;
  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target;
      const inField = el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      const onButton = el instanceof HTMLElement && el.closest('button, a');
      const k = e.key;
      const c = keyRef.current;
      let fn = null;
      if (k === 'ArrowUp' || (k === 'ArrowLeft' && !inField)) fn = c.onPrev;
      else if (k === 'ArrowDown' || (k === 'ArrowRight' && !inField)) fn = c.onNext;
      else if (k === 'Enter' && !onButton) fn = c.onA;
      else if (k === 'Escape') fn = c.onB;
      else if (!inField) {
        const low = k.toLowerCase();
        if (low === 'a') fn = c.onA;
        else if (low === 'b') fn = c.onB;
        else if (low === 'x') fn = c.onX;
        else if (low === 'y') fn = c.onY;
      }
      if (!fn) return;
      e.preventDefault();
      fn();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── screens ────────────────────────────────────────────────────────
  const top = more ? (
    <TopEntry
      entry={displayEntry}
      species={species}
      active={active}
      sprites={sprites}
      shiny={shiny}
      pixel={pixel}
      setShiny={setShiny}
      setPixel={setPixel}
      formChips={formChips}
      form={form}
      setForm={setForm}
      editions={editions}
      edition={currentEdition}
      setEdition={setEdition}
      onBack={pressB}
    />
  ) : (
    <TopOverview
      entry={entry}
      pokemon={pokemon}
      species={species}
      chain={chain}
      onPick={(id) => { setQ(''); setType(null); setGen(null); select(id); }}
      onOpenMore={() => setMore(true)}
    />
  );

  const bottom = more ? (
    <DsTabs
      tab={tab}
      setTab={setTab}
      entry={displayEntry}
      active={active}
      species={species}
      chain={chain}
      editions={editions}
      edition={currentEdition}
      setEdition={setEdition}
      method={method}
      setMethod={setMethod}
      encounters={encountersQ.data}
      encountersLoading={encountersQ.isLoading}
    />
  ) : (
    <DsBrowser
      rows={rows}
      loading={isLoading || typePending}
      typesById={typesById}
      sel={sel}
      onPick={select}
      q={q}
      setQ={setQ}
      type={type}
      setType={setType}
      gen={gen}
      setGen={setGen}
      view={view}
      setView={setView}
    />
  );

  return <DsDevice top={top} bottom={bottom} controls={controls} />;
}
