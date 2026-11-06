import { useEffect, useRef, useState } from 'react';
import { ALL_TYPES } from '@/lib/typeChart';
import { ROMAN, SKEL, TOTAL_POKEMON, dexNo, pixelSpriteUrl, prettyName, typeColor, typeLabel } from './dsData';
import { Skel, TypePill } from './DsTopScreens';

const PAGE = 120;

/** Bottom screen in normal mode: search, type + generation filter, grid / list. */
export default function DsBrowser({
  rows, loading, typesById, sel, onPick, q, setQ, type, setType, gen, setGen, view, setView,
}) {
  const resultsRef = useRef(null);
  const sentinelRef = useRef(null);
  const [limit, setLimit] = useState(PAGE);
  const isGrid = view === 'grid';

  // Render progressively; always include the selected entry.
  useEffect(() => { setLimit(PAGE); }, [q, type, gen]);
  const selIndex = rows.findIndex((r) => r.id === sel);
  useEffect(() => {
    if (selIndex >= limit) setLimit(selIndex + PAGE);
  }, [selIndex, limit]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([hit]) => { if (hit.isIntersecting) setLimit((l) => l + PAGE); },
      { root: resultsRef.current, rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rows.length, view, limit]);

  // Keep the cursor visible while stepping with the D-pad.
  useEffect(() => {
    const box = resultsRef.current;
    const el = box?.querySelector(`[data-id="${sel}"]`);
    if (!box || !el) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.top < b.top) box.scrollTop -= b.top - r.top + 4;
    else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom + 4;
  }, [sel, view]);

  const visible = rows.slice(0, limit);

  return (
    <section className="ds-screen is-bottom" aria-label="Pokémon-Auswahl">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <div className="ds-search">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <path d="M15.5 15.5 L20 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <label htmlFor="ds-search" className="ds-sr">Suche nach Name oder Nummer</label>
          <input
            id="ds-search"
            type="search"
            placeholder="Name oder Nr. suchen"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
          />
        </div>
        <span className="ds-pixel ds-muted" style={{ fontSize: 12 }}>{loading ? '…' : rows.length} / {TOTAL_POKEMON}</span>
        <div role="group" aria-label="Ansicht" className="ds-seg ds-view">
          <button className="hw" aria-pressed={isGrid} onClick={() => setView('grid')} aria-label="Rasteransicht">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              {[[4, 4], [13.5, 4], [4, 13.5], [13.5, 13.5]].map(([x, y]) => (
                <rect key={`${x}-${y}`} x={x} y={y} width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
              ))}
            </svg>
          </button>
          <button className="hw" aria-pressed={!isGrid} onClick={() => setView('list')} aria-label="Listenansicht">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6 H20 M4 12 H20 M4 18 H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="ds-typechips ds-scroll" role="group" aria-label="Typ-Filter">
        <button className="ds-typechip hw" aria-pressed={type === null} onClick={() => setType(null)} style={{ background: 'var(--ds-all-chip)' }}>Alle</button>
        {ALL_TYPES.map((t) => (
          <button key={t} className="ds-typechip hw" aria-pressed={type === t} onClick={() => setType(t)} style={{ background: typeColor(t) }}>
            {typeLabel(t)}
          </button>
        ))}
      </div>

      <div className="ds-gens" role="group" aria-label="Generation">
        <button className="hw" aria-pressed={gen === null} onClick={() => setGen(null)}>Alle</button>
        {ROMAN.map((r, i) => (
          <button key={r} className="hw" aria-pressed={gen === i + 1} onClick={() => setGen(i + 1)} aria-label={`Generation ${r}`}>{r}</button>
        ))}
      </div>

      <div className="ds-results ds-scroll" ref={resultsRef}>
        {loading ? (
          <div className="ds-tiles">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="ds-tile ds-skel" style={{ cursor: 'default' }}>
                <span className="ds-thumb" />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <Skel w={40} h={8} />
                  <Skel w={`${SKEL[i % SKEL.length]}%`} h={12} />
                </span>
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="ds-empty">Kein Pokémon gefunden.</div>
        ) : isGrid ? (
          <div className="ds-tiles">
            {visible.map((r) => {
              const on = r.id === sel;
              const types = typesById[r.id] || [];
              return (
                <button key={r.id} data-id={r.id} className="ds-tile hw" onClick={() => onPick(r.id)} aria-current={on ? 'true' : 'false'}>
                  <span aria-hidden="true" className="ds-thumb">
                    <img src={pixelSpriteUrl(r.id)} alt="" loading="lazy" width={40} height={40} />
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: 1 }}>
                    <span className="ds-pixel" style={{ fontSize: 10, opacity: 0.8 }}>{dexNo(r.id)}</span>
                    <span className="ds-ellipsis" style={{ fontWeight: 700, fontSize: 15 }}>{prettyName(r.name)}</span>
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {types.map((t) => <span key={t} className="ds-dot" style={{ background: typeColor(t) }} title={typeLabel(t)} />)}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="ds-list">
            {visible.map((r) => {
              const on = r.id === sel;
              return (
                <button key={r.id} data-id={r.id} className="ds-li hw" onClick={() => onPick(r.id)} aria-current={on ? 'true' : 'false'}>
                  <span aria-hidden="true" style={{ width: 10, fontSize: 12 }}>{on ? '▶' : ''}</span>
                  <span className="ds-pixel" style={{ fontSize: 12, opacity: 0.8, width: 60 }}>{dexNo(r.id)}</span>
                  <span className="ds-ellipsis" style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 16 }}>{prettyName(r.name)}</span>
                  <span style={{ display: 'flex', gap: 4 }}>
                    {(typesById[r.id] || []).map((t) => <TypePill key={t} type={t} small />)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {!loading && visible.length < rows.length && <div ref={sentinelRef} style={{ height: 1 }} />}
      </div>
    </section>
  );
}
