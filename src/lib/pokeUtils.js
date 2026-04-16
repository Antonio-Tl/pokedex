export const TYPE_COLORS = {
  normal: { bg: 'bg-gray-500/15', text: 'text-gray-700', border: 'border-gray-500/30', solid: 'bg-gray-500', gradient: 'from-gray-500/20' },
  fire: { bg: 'bg-orange-500/15', text: 'text-orange-700', border: 'border-orange-500/30', solid: 'bg-orange-500', gradient: 'from-orange-500/20' },
  water: { bg: 'bg-blue-500/15', text: 'text-blue-700', border: 'border-blue-500/30', solid: 'bg-blue-500', gradient: 'from-blue-500/20' },
  electric: { bg: 'bg-yellow-500/15', text: 'text-yellow-700', border: 'border-yellow-500/30', solid: 'bg-yellow-500', gradient: 'from-yellow-500/20' },
  grass: { bg: 'bg-green-500/15', text: 'text-green-700', border: 'border-green-500/30', solid: 'bg-green-500', gradient: 'from-green-500/20' },
  ice: { bg: 'bg-cyan-500/15', text: 'text-cyan-700', border: 'border-cyan-500/30', solid: 'bg-cyan-500', gradient: 'from-cyan-500/20' },
  fighting: { bg: 'bg-red-500/15', text: 'text-red-700', border: 'border-red-500/30', solid: 'bg-red-500', gradient: 'from-red-500/20' },
  poison: { bg: 'bg-purple-500/15', text: 'text-purple-700', border: 'border-purple-500/30', solid: 'bg-purple-500', gradient: 'from-purple-500/20' },
  ground: { bg: 'bg-amber-500/15', text: 'text-amber-700', border: 'border-amber-500/30', solid: 'bg-amber-500', gradient: 'from-amber-500/20' },
  flying: { bg: 'bg-sky-500/15', text: 'text-sky-700', border: 'border-sky-500/30', solid: 'bg-sky-500', gradient: 'from-sky-500/20' },
  psychic: { bg: 'bg-pink-500/15', text: 'text-pink-700', border: 'border-pink-500/30', solid: 'bg-pink-500', gradient: 'from-pink-500/20' },
  bug: { bg: 'bg-lime-500/15', text: 'text-lime-700', border: 'border-lime-500/30', solid: 'bg-lime-500', gradient: 'from-lime-500/20' },
  rock: { bg: 'bg-stone-500/15', text: 'text-stone-700', border: 'border-stone-500/30', solid: 'bg-stone-500', gradient: 'from-stone-500/20' },
  ghost: { bg: 'bg-indigo-500/15', text: 'text-indigo-700', border: 'border-indigo-500/30', solid: 'bg-indigo-500', gradient: 'from-indigo-500/20' },
  dragon: { bg: 'bg-indigo-500/15', text: 'text-indigo-700', border: 'border-indigo-500/30', solid: 'bg-indigo-500', gradient: 'from-indigo-500/20' },
  dark: { bg: 'bg-slate-500/15', text: 'text-slate-700', border: 'border-slate-500/30', solid: 'bg-slate-500', gradient: 'from-slate-500/20' },
  steel: { bg: 'bg-slate-500/15', text: 'text-slate-700', border: 'border-slate-500/30', solid: 'bg-slate-500', gradient: 'from-slate-500/20' },
  fairy: { bg: 'bg-rose-500/15', text: 'text-rose-700', border: 'border-rose-500/30', solid: 'bg-rose-500', gradient: 'from-rose-500/20' },
};

export const getTypeColor = (type) => TYPE_COLORS[type] || TYPE_COLORS.normal;

export const formatPokemonId = (id) => `#${String(id).padStart(3, '0')}`;

export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const getArtwork = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const STAT_LABELS = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  speed: 'SPD',
};

export const STAT_COLORS = {
  hp: 'bg-red-500',
  attack: 'bg-orange-500',
  defense: 'bg-yellow-500',
  'special-attack': 'bg-blue-500',
  'special-defense': 'bg-green-500',
  speed: 'bg-pink-500',
};