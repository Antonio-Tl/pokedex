# PokéApp – Pokédex + Item-Dex

A modern React app built with Vite that loads data directly from the [PokéAPI](https://pokeapi.co/).

The app includes two main sections:

- **Pokédex**: Browse all Pokémon (National Dex), search, filter by type and generation, and open a detail view.
- **Items**: Explore items with search, category filters, berry mode, and machine generation support.

---

## Features

### Pokédex (`/`)

- Loads the full Pokémon list (up to ID 1025), sorted by National Dex ID.
- **Search** by name or ID.
- **Type filter** and **generation filter** (Gen 1 to Gen 9).
- Card grid with “Load more” pagination.
- Detail modal with previous/next Pokémon navigation.
- Skeleton/loading states for smoother UX.

### Items (`/items`)

- Loads the full item list and lazily caches item details.
- **Search** by item name or ID.
- **Category filters** (including Balls, Healing, Medicine, Vitamins, Held Items, Evolution, Berries, Machines).
- Dedicated **berry mode** with berry-specific data.
- For `all-machines`: generation-based machine lookup and filtering.
- Item detail view with additional metadata.

### Dual-Screen-Design (optional)

- Second, selectable design in the look of a dual-screen handheld (`DS-Design` button in the navbar, `Klassisch` on the device to switch back; persisted in `localStorage`, or via `?design=ds` / `?design=classic`).
- Upper screen: details of the selected Pokémon; lower screen: search, type/generation filter, grid/list.
- Button **A** / "Eintrag & mehr" opens the Pokédex entry (sprites incl. shiny/pixel, cries, forms, per-edition flavor text) and tabs for abilities, training, breeding, types, moves and locations — all live from the PokeAPI.
- Device buttons and keyboard: arrows = browse, A/Enter = details / next tab, B/Escape = back, X = random, Y = cycle type, START = light/dark, SELECT = grid/list.
- Design reference: `docs/design/pokedex-ds-design.html`.

### App-wide UX

- Sticky navigation between Pokédex and Items routes.
- **Light/Dark mode** with persistence via `localStorage`.
- Responsive layout (mobile to desktop).
- Toast integration and reusable UI component system.

---

## Tech Stack

- **React 18** + **Vite 6**
- **React Router v6**
- **Tailwind CSS**
- **TanStack Query**
- **Framer Motion**
- **Radix UI / shadcn-ui** components
- Data source: **PokéAPI**

---

## Local Development

### Requirements

- Node.js **18+** (latest LTS recommended)
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open in your browser:

```text
http://localhost:5173
```

---

## Available Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – create a production build
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint
- `npm run lint:fix` – auto-fix ESLint issues where possible
- `npm run typecheck` – run type checking via `tsc -p ./jsconfig.json`

---

## Project Structure (Quick Overview)

```text
src/
   components/
      layout/         # App layout and navigation
      pokedex/        # Pokémon-specific UI components
      items/          # Item-specific UI components
      ui/             # Reusable UI primitives/components
   pages/
      Pokedex.jsx     # Pokémon main page
      Items.jsx       # Items main page
   lib/
      pokeUtils.js    # Utility helpers and color maps
      query-client.js # TanStack Query client
   App.jsx           # Route setup
```

---

## Data Source & Notes

- All content is fetched live from the **PokéAPI**.
- No `.env` setup is currently required for local development.
- Initial requests can take longer on slower connections; the app uses lazy loading and in-memory caching to improve perceived performance.

---

## Roadmap Ideas

- Favorites with persistence (e.g. `localStorage`)
- Pokémon stat comparison view
- Server-side caching/proxy layer for more stable API latency
- Tests for critical filter/mapping logic
