// Static labels, colors and formatting helpers for the dual-screen design.
// All Pokémon data itself comes live from the PokeAPI (see usePokeApi.js).

export const TOTAL_POKEMON = 1025;
export const DEFAULT_CHASSIS = '#c8303c';

// German type labels + pastel chip colors from the design file.
export const TYPES = {
  normal: ['Normal', '#C6C6A7'], fire: ['Feuer', '#F5AC78'], water: ['Wasser', '#9DB7F5'],
  electric: ['Elektro', '#FAE078'], grass: ['Pflanze', '#A7DB8D'], ice: ['Eis', '#BCE6E6'],
  fighting: ['Kampf', '#E89A94'], poison: ['Gift', '#D19ED1'], ground: ['Boden', '#EBD69D'],
  flying: ['Flug', '#C6B7F5'], psychic: ['Psycho', '#FA92B2'], bug: ['Käfer', '#C6D16E'],
  rock: ['Gestein', '#D1C17D'], ghost: ['Geist', '#B8A8D2'], dragon: ['Drache', '#B79BFA'],
  dark: ['Unlicht', '#B7A99F'], steel: ['Stahl', '#D1D1E0'], fairy: ['Fee', '#F4BDC9'],
};
export const typeLabel = (t) => TYPES[t]?.[0] ?? capitalize(t);
export const typeColor = (t) => TYPES[t]?.[1] ?? '#C6C6A7';

export const GEN_MAX = [151, 251, 386, 493, 649, 721, 809, 905, 1025];
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
export const genOf = (id) => {
  const i = GEN_MAX.findIndex((max) => id <= max);
  return i === -1 ? 9 : i + 1;
};

export const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
export const STAT_LABELS = ['KP', 'ANG', 'VERT', 'SP.A', 'SP.V', 'INIT'];

export const TABS = [
  ['abilities', 'Fähigkeiten'], ['training', 'Training'], ['zucht', 'Zucht'],
  ['types', 'Typen'], ['moves', 'Attacken'], ['locations', 'Fundorte'],
];

// [api learn method, chip label, first column header]
export const METHODS = [
  ['level-up', 'Level-Up', 'LV.'], ['machine', 'TM', 'TM'], ['egg', 'Ei', '—'], ['tutor', 'Lehrer', '—'],
];

export const SKEL = [70, 55, 82, 48, 64, 75];

// Editions = PokeAPI version groups (moves are keyed by version group,
// flavor texts and encounters by version).
export const EDITIONS = [
  { key: 'red-blue', label: 'Rot / Blau', gen: 1, versions: ['red', 'blue'], sprite: ['generation-i', 'red-blue'] },
  { key: 'yellow', label: 'Gelb', gen: 1, versions: ['yellow'], sprite: ['generation-i', 'yellow'] },
  { key: 'gold-silver', label: 'Gold / Silber', gen: 2, versions: ['gold', 'silver'], sprite: ['generation-ii', 'gold'] },
  { key: 'crystal', label: 'Kristall', gen: 2, versions: ['crystal'], sprite: ['generation-ii', 'crystal'] },
  { key: 'ruby-sapphire', label: 'Rubin / Saphir', gen: 3, versions: ['ruby', 'sapphire'], sprite: ['generation-iii', 'ruby-sapphire'] },
  { key: 'emerald', label: 'Smaragd', gen: 3, versions: ['emerald'], sprite: ['generation-iii', 'emerald'] },
  { key: 'firered-leafgreen', label: 'Feuerrot / Blattgrün', gen: 3, versions: ['firered', 'leafgreen'], sprite: ['generation-iii', 'firered-leafgreen'] },
  { key: 'diamond-pearl', label: 'Diamant / Perl', gen: 4, versions: ['diamond', 'pearl'], sprite: ['generation-iv', 'diamond-pearl'] },
  { key: 'platinum', label: 'Platin', gen: 4, versions: ['platinum'], sprite: ['generation-iv', 'platinum'] },
  { key: 'heartgold-soulsilver', label: 'HeartGold / SoulSilver', gen: 4, versions: ['heartgold', 'soulsilver'], sprite: ['generation-iv', 'heartgold-soulsilver'] },
  { key: 'black-white', label: 'Schwarz / Weiß', gen: 5, versions: ['black', 'white'], sprite: ['generation-v', 'black-white'] },
  { key: 'black-2-white-2', label: 'Schwarz 2 / Weiß 2', gen: 5, versions: ['black-2', 'white-2'], sprite: ['generation-v', 'black-white'] },
  { key: 'x-y', label: 'X / Y', gen: 6, versions: ['x', 'y'], sprite: ['generation-vi', 'x-y'] },
  { key: 'omega-ruby-alpha-sapphire', label: 'Omega Rubin / Alpha Saphir', gen: 6, versions: ['omega-ruby', 'alpha-sapphire'], sprite: ['generation-vi', 'omega-ruby-alpha-sapphire'] },
  { key: 'sun-moon', label: 'Sonne / Mond', gen: 7, versions: ['sun', 'moon'], sprite: null },
  { key: 'ultra-sun-ultra-moon', label: 'Ultrasonne / Ultramond', gen: 7, versions: ['ultra-sun', 'ultra-moon'], sprite: ['generation-vii', 'ultra-sun-ultra-moon'] },
  { key: 'lets-go-pikachu-lets-go-eevee', label: "Let's Go", gen: 7, versions: ['lets-go-pikachu', 'lets-go-eevee'], sprite: ['generation-vii', 'lets-go-pikachu-lets-go-eevee'] },
  { key: 'sword-shield', label: 'Schwert / Schild', gen: 8, versions: ['sword', 'shield', 'the-isle-of-armor-sword', 'the-isle-of-armor-shield', 'the-crown-tundra-sword', 'the-crown-tundra-shield'], sprite: ['generation-viii', 'sword-shield'] },
  { key: 'brilliant-diamond-shining-pearl', label: 'Strahlender Diamant / Leuchtende Perle', gen: 8, versions: ['brilliant-diamond', 'shining-pearl'], sprite: ['generation-viii', 'brilliant-diamond-shining-pearl'] },
  { key: 'legends-arceus', label: 'Legenden: Arceus', gen: 8, versions: ['legends-arceus'], sprite: ['generation-viii', 'legends-arceus'] },
  { key: 'scarlet-violet', label: 'Karmesin / Purpur', gen: 9, versions: ['scarlet', 'violet', 'the-teal-mask-scarlet', 'the-teal-mask-violet', 'the-indigo-disk-scarlet', 'the-indigo-disk-violet'], sprite: ['generation-ix', 'scarlet-violet'] },
  { key: 'legends-za', label: 'Legenden: Z-A', gen: 9, versions: ['legends-za', 'mega-dimension'], sprite: ['generation-ix', 'legends-za'] },
  { key: 'champions', label: 'Champions', gen: 9, versions: ['champions'], sprite: ['generation-ix', 'champions'] },
];
export const MOVE_VERSION_GROUP_ALIASES = {
  // DLC version groups whose moves belong to the base edition chip
  'the-isle-of-armor': 'sword-shield', 'the-crown-tundra': 'sword-shield',
  'the-teal-mask': 'scarlet-violet', 'the-indigo-disk': 'scarlet-violet',
  'mega-dimension': 'legends-za',
};
export const editionOfVersion = (version) => EDITIONS.find((e) => e.versions.includes(version))?.key ?? null;

export const EGG_GROUPS = {
  monster: 'Monster', water1: 'Wasser 1', water2: 'Wasser 2', water3: 'Wasser 3', bug: 'Käfer',
  flying: 'Flug', ground: 'Feld', fairy: 'Fee', plant: 'Pflanze', humanshape: 'Humanotyp',
  mineral: 'Mineral', indeterminate: 'Amorph', ditto: 'Ditto', dragon: 'Drache', 'no-eggs': 'Unbekannt',
};

// growth-rate name → [German label, pips filled (of 5)]
export const GROWTH = {
  'slow-then-very-fast': ['Unregelmäßig', 1],
  fast: ['Schnell', 2],
  medium: ['Mittelschnell', 3],
  'medium-slow': ['Mittellangsam', 4],
  slow: ['Langsam', 5],
  'fast-then-very-slow': ['Schwankend', 5],
};

export const ENCOUNTER_METHODS = {
  walk: 'Gras / Höhle', surf: 'Surfen', 'old-rod': 'Angel', 'good-rod': 'Profiangel', 'super-rod': 'Super-Angel',
  'rock-smash': 'Zertrümmerer', headbutt: 'Kopfnuss', gift: 'Geschenk', 'gift-egg': 'Ei-Geschenk', 'only-one': 'Einmalig',
  'dark-grass': 'Dunkles Gras', 'grass-spots': 'Raschelndes Gras', 'cave-spots': 'Staubwolke', 'surf-spots': 'Wellen',
  'super-rod-spots': 'Angel (Schatten)', 'bridge-spots': 'Brückenschatten', 'pokeflute': 'Pokéflöte',
  'npc-trade': 'Tausch', 'roaming-grass': 'Umherstreifend', 'roaming-water': 'Umherstreifend',
  'yellow-flowers': 'Gelbe Blumen', 'purple-flowers': 'Lila Blumen', 'red-flowers': 'Rote Blumen',
  'rough-terrain': 'Unwegsames Gelände', 'seaweed': 'Seetang', 'squirt-bottle': 'Gießkanne', 'wailmer-pail': 'Gießkanne',
  'devon-scope': 'Devon-Scope', 'overworld': 'Oberwelt', 'overworld-flying': 'Oberwelt (Luft)', 'overworld-water': 'Oberwelt (Wasser)',
};

export const DAMAGE_CLASS = {
  physical: ['P', 'Physisch', '#e8643c'],
  special: ['S', 'Spezial', '#4a7fd8'],
  status: ['–', 'Status', '#9a9ca5'],
};

// ── formatting ──────────────────────────────────────────────────────────

export const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
export const digits = (id) => String(id).padStart(3, '0');
export const dexNo = (id) => `No.${digits(id)}`;
export const fmtNum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const fmtDecimal = (n, frac = 1) => n.toFixed(frac).replace('.', ',');
export const fmtPercent = (n) => `${String(Math.round(n * 10) / 10).replace('.', ',')} %`;
export const fmtMult = (m) => (m === 0 ? '×0' : m === 0.25 ? '×¼' : m === 0.5 ? '×½' : `×${m}`);
export const idFromUrl = (url) => Number(url?.split('/').filter(Boolean).pop());
export const slugWords = (s) => (s || '').split('-').map(capitalize).join(' ');

const NAME_OVERRIDES = {
  'nidoran-f': 'Nidoran♀', 'nidoran-m': 'Nidoran♂', 'mr-mime': 'Mr. Mime', 'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime', farfetchd: "Farfetch'd", sirfetchd: "Sirfetch'd", 'type-null': 'Type: Null',
  'ho-oh': 'Ho-Oh', 'porygon-z': 'Porygon-Z', 'jangmo-o': 'Jangmo-o', 'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o', flabebe: 'Flabébé', 'chi-yu': 'Chi-Yu', 'ting-lu': 'Ting-Lu',
  'wo-chien': 'Wo-Chien', 'chien-pao': 'Chien-Pao',
};
/** Display name of a species slug ("tapu-koko" → "Tapu Koko"). */
export const prettyName = (slug) => NAME_OVERRIDES[slug] ?? slugWords(slug);

/** Pick the localized entry: German first, English as fallback. */
export const pickLang = (entries, field, filter = () => true) => {
  const list = (entries || []).filter(filter);
  const de = list.filter((e) => e.language?.name === 'de');
  const en = list.filter((e) => e.language?.name === 'en');
  const hit = de[de.length - 1] ?? en[en.length - 1];
  return hit ? cleanText(hit[field]) : '';
};
export const cleanText = (s) => (s || '').replace(/[\f\n\r­]+/g, ' ').replace(/\s+/g, ' ').trim();

// ── sprites ─────────────────────────────────────────────────────────────

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
export const pixelSpriteUrl = (id) => `${SPRITE_BASE}/${id}.png`;
export const artworkUrl = (id) => `${SPRITE_BASE}/other/official-artwork/${id}.png`;

/** Image for the entry stage: artwork or pixel sprite, normal or shiny. */
export const pickSprite = (sprites, { shiny, pixel, edition }) => {
  if (!sprites) return null;
  if (!pixel) {
    const art = sprites.other?.['official-artwork'];
    return (shiny ? art?.front_shiny : art?.front_default)
      ?? (shiny ? sprites.front_shiny : sprites.front_default) ?? null;
  }
  const ed = EDITIONS.find((e) => e.key === edition);
  if (ed?.sprite) {
    const v = sprites.versions?.[ed.sprite[0]]?.[ed.sprite[1]];
    const hit = shiny ? v?.front_shiny : v?.front_default;
    if (hit) return hit;
  }
  return (shiny ? sprites.front_shiny : sprites.front_default) ?? null;
};

// ── evolution ───────────────────────────────────────────────────────────

const ITEM_OVERRIDES = {
  'fire-stone': 'Feuerstein', 'water-stone': 'Wasserstein', 'thunder-stone': 'Donnerstein',
  'leaf-stone': 'Blattstein', 'moon-stone': 'Mondstein', 'sun-stone': 'Sonnenstein',
  'shiny-stone': 'Leuchtstein', 'dusk-stone': 'Finsterstein', 'dawn-stone': 'Funkelstein',
  'ice-stone': 'Eisstein', 'oval-stone': 'Ovaler Stein',
};
const TIME_OF_DAY = { day: 'Tag', night: 'Nacht', dusk: 'Abend' };

/** Short German label for how a species evolves from its predecessor. */
export const evoRequirement = (details) => {
  const d = details?.find((x) => x.min_level != null || x.item) ?? details?.[0];
  if (!d) return '—';
  const parts = [];
  const trigger = d.trigger?.name;
  if (d.min_level != null) parts.push(`Lv. ${d.min_level}`);
  if (d.item) parts.push(ITEM_OVERRIDES[d.item.name] ?? slugWords(d.item.name));
  if (trigger === 'trade') parts.push(d.held_item ? `Tausch + ${slugWords(d.held_item.name)}` : 'Tausch');
  if (d.min_happiness != null) parts.push('Freundschaft');
  if (d.min_affection != null) parts.push('Zuneigung');
  if (d.known_move) parts.push(slugWords(d.known_move.name));
  if (d.known_move_type) parts.push(`${typeLabel(d.known_move_type.name)}-Attacke`);
  if (d.location && !parts.length) parts.push(slugWords(d.location.name));
  if (d.time_of_day && TIME_OF_DAY[d.time_of_day]) parts.push(TIME_OF_DAY[d.time_of_day]);
  if (!parts.length && trigger) parts.push(slugWords(trigger));
  return parts.join(' · ') || '—';
};

/**
 * Flatten an evolution chain depth-first.
 * Returns [{ id, name, depth, parentId, req }].
 */
export const flattenChain = (chain) => {
  const out = [];
  const walk = (node, depth, parentId) => {
    if (!node?.species) return;
    const id = idFromUrl(node.species.url);
    out.push({ id, name: node.species.name, depth, parentId, req: depth ? evoRequirement(node.evolution_details) : '' });
    node.evolves_to?.forEach((n) => walk(n, depth + 1, id));
  };
  walk(chain, 0, null);
  return out;
};

/** The single line through the chain that contains `id` (ancestors + first descendants). */
export const chainPath = (entries, id) => {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const path = [];
  let cur = byId.get(id);
  while (cur) { path.unshift(cur); cur = byId.get(cur.parentId); }
  let tail = entries.find((e) => e.parentId === id);
  while (tail) { path.push(tail); tail = entries.find((e) => e.parentId === tail.id); }
  return path;
};

// ── forms ───────────────────────────────────────────────────────────────

const FORM_WORDS = {
  mega: 'Mega', gmax: 'Gigadynamax', alola: 'Alola', galar: 'Galar', hisui: 'Hisui', paldea: 'Paldea',
  primal: 'Proto', origin: 'Urform', therian: 'Tiergeist', incarnate: 'Inkarnation', totem: 'Totem',
  starter: 'Partner', eternamax: 'Unendynamax',
};
/** "charizard-mega-x" (species "charizard") → "Mega X". */
export const formLabel = (formName, speciesName) => {
  const rest = formName.startsWith(`${speciesName}-`) ? formName.slice(speciesName.length + 1) : formName;
  return rest.split('-').map((w) => FORM_WORDS[w] ?? capitalize(w)).join(' ');
};
