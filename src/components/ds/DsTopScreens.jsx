import { useEffect, useRef } from 'react';
import { getDefensiveMultipliers } from '@/lib/typeChart';
import {
  ROMAN, STAT_KEYS, STAT_LABELS, artworkUrl, dexNo, fmtDecimal, fmtMult, genOf, pickLang,
  pickSprite, pixelSpriteUrl, prettyName, typeColor, typeLabel,
} from './dsData';

export const Skel = ({ w = '100%', h = 12, r = 6, style }) => (
  <span className="ds-skel ds-skel-bar" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const Arrow = () => (
  <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true">
    <path d="M1 6 H19 M15 2 L19 6 L15 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Play = () => (
  <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 2 L12 7 L3 12 Z" fill="currentColor" /></svg>
);

export const TypePill = ({ type, small }) => (
  <span
    className="ds-type"
    style={{ background: typeColor(type), ...(small ? { padding: '2px 8px', fontSize: 12 } : null) }}
  >
    {typeLabel(type)}
  </span>
);

const typesOf = (pokemon) => (pokemon?.types || []).slice().sort((a, b) => a.slot - b.slot).map((t) => t.type.name);
export const genusOf = (species) => pickLang(species?.genera, 'genus');

/* ── overview (normal mode) ────────────────────────────────────────── */

export function TopOverview({ entry, pokemon, species, chain, onPick, onOpenMore }) {
  const id = entry?.id;
  const types = typesOf(pokemon);
  const stats = STAT_KEYS.map((k) => pokemon?.stats?.find((s) => s.stat.name === k)?.base_stat ?? 0);
  const total = stats.reduce((a, b) => a + b, 0);
  const matchups = types.length
    ? getDefensiveMultipliers(types).filter((x) => x.multiplier !== 1).sort((a, b) => b.multiplier - a.multiplier)
    : [];

  return (
    <article className="ds-screen ds-scroll" aria-label="Pokémon-Details" aria-busy={!pokemon}>
      <div className="ds-head">
        <div className="ds-col">
          <div className="ds-row" style={{ gap: '6px 12px' }}>
            <h1 className="ds-title">{entry ? prettyName(entry.name) : <Skel w={180} h={28} />}</h1>
            <div style={{ display: 'flex', gap: 6 }}>
              {pokemon ? types.map((t) => <TypePill key={t} type={t} />) : <Skel w={70} h={24} r={999} />}
            </div>
          </div>
          <div className="ds-row" style={{ alignItems: 'baseline', gap: '4px 12px' }}>
            <span className="ds-pixel ds-muted" style={{ fontSize: 13 }}>
              {id ? `${dexNo(id)} · GEN ${ROMAN[genOf(id) - 1]}` : '—'}
            </span>
            <span className="ds-muted" style={{ fontSize: 15 }}>{species ? genusOf(species) : <Skel w={110} h={12} />}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="ds-btn-key hw" onClick={onOpenMore} disabled={!entry}>
            <span aria-hidden="true" className="ds-key">A</span>Eintrag &amp; mehr
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        <div className="ds-stage" style={{ flex: '0 0 160px', height: 160 }}>
          <span aria-hidden="true" className="ds-stage-shadow" />
          {id ? (
            <img
              key={id}
              src={pokemon?.sprites?.other?.['official-artwork']?.front_default ?? artworkUrl(id)}
              alt={entry ? prettyName(entry.name) : ''}
              width={136}
              height={136}
            />
          ) : <span className="ds-pixel" style={{ fontSize: 17 }}>…</span>}
        </div>
        <div style={{ flex: '0 0 104px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="ds-chip-box">
            <span className="ds-label">GRÖSSE</span>
            <span style={{ fontSize: 19, fontWeight: 700 }}>{pokemon ? `${fmtDecimal(pokemon.height / 10)} m` : <Skel w={50} h={16} />}</span>
          </div>
          <div className="ds-chip-box">
            <span className="ds-label">GEWICHT</span>
            <span style={{ fontSize: 19, fontWeight: 700 }}>{pokemon ? `${fmtDecimal(pokemon.weight / 10)} kg` : <Skel w={60} h={16} />}</span>
          </div>
        </div>
        <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6 }}>
          <div className="ds-pixel ds-muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span>BASISWERTE</span>
            <span>GESAMT <span style={{ color: 'var(--ds-fg)' }}>{pokemon ? total : '—'}</span></span>
          </div>
          {STAT_LABELS.map((label, i) => (
            <div key={label} className="ds-stat">
              <span className="ds-pixel ds-muted" style={{ width: 46, fontSize: 11 }}>{label}</span>
              <span style={{ width: 30, textAlign: 'right', fontWeight: 700, fontSize: 15 }}>{pokemon ? stats[i] : '–'}</span>
              <div className="ds-stat-track">
                <div className="ds-stat-fill" style={{ width: `${Math.min(100, Math.round((stats[i] / 180) * 100))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ds-col">
        <h2 className="ds-h2">SCHWÄCHEN &amp; RESISTENZEN</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {pokemon
            ? matchups.map(({ type, multiplier }) => {
              const weak = multiplier > 1;
              return (
                <span key={type} className="ds-matchup">
                  <span style={{ background: typeColor(type), color: '#15161a' }}>{typeLabel(type)}</span>
                  <span style={{ background: weak ? 'var(--ds-weak-bg)' : 'var(--ds-res-bg)', color: weak ? 'var(--ds-weak-fg)' : 'var(--ds-res-fg)' }}>
                    {fmtMult(multiplier)}
                  </span>
                </span>
              );
            })
            : [64, 72, 58, 80, 66, 60].map((w, i) => <Skel key={i} w={w} h={22} r={999} />)}
        </div>
      </div>

      <div className="ds-col" style={{ gap: 8, paddingTop: 12, borderTop: '1px solid var(--ds-line)' }}>
        <h2 className="ds-h2">ENTWICKLUNG</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          {chain
            ? chain.map((e) => (
              <EvoStep key={e.id} e={e} current={e.id === id} onPick={onPick} />
            ))
            : [0, 1, 2].map((i) => <Skel key={i} w={130} h={48} r={12} style={{ flex: '1 1 110px' }} />)}
        </div>
      </div>
    </article>
  );
}

function EvoStep({ e, current, onPick }) {
  return (
    <>
      {e.depth > 0 && (
        <div className="ds-muted" style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 12 }}>
          <Arrow />
          <span>{e.req}</span>
        </div>
      )}
      <button className="ds-evo hw" onClick={() => onPick(e.id)} aria-current={current ? 'true' : 'false'}>
        <span aria-hidden="true" className="ds-thumb">
          <img src={pixelSpriteUrl(e.id)} alt="" loading="lazy" />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span className="ds-pixel" style={{ fontSize: 10, opacity: 0.8 }}>{dexNo(e.id)}</span>
          <span className="ds-ellipsis" style={{ fontWeight: 700, fontSize: 15 }}>{prettyName(e.name)}</span>
        </span>
      </button>
    </>
  );
}

/* ── Pokédex entry (detail mode) ───────────────────────────────────── */

export function TopEntry({
  entry, species, active, sprites, shiny, pixel, setShiny, setPixel,
  formChips, form, setForm, editions, edition, setEdition, onBack,
}) {
  const id = entry?.id;
  const audioRef = useRef(null);
  const ed = editions.find((e) => e.key === edition);

  const badges = [];
  if (id) badges.push({ label: `GEN ${ROMAN[genOf(id) - 1]}`, bg: 'var(--ds-chip)', fg: 'var(--ds-fg)' });
  if (species?.is_legendary) badges.push({ label: 'LEGENDÄR', bg: '#e0a800', fg: '#15161a' });
  if (species?.is_mythical) badges.push({ label: 'MYSTERIÖS', bg: '#5ad1c5', fg: '#15161a' });
  if (species?.is_baby) badges.push({ label: 'BABY', bg: '#ff8fb4', fg: '#15161a' });
  if (species?.varieties?.some((v) => v.pokemon.name.includes('-mega'))) badges.push({ label: 'MEGA', bg: '#7c5cff', fg: '#ffffff' });

  const img = pickSprite(sprites, { shiny, pixel, edition });
  const flavor = species && ed
    ? pickLang(species.flavor_text_entries, 'flavor_text', (f) => ed.versions.includes(f.version.name))
    : '';

  const play = (url) => {
    if (!url) return;
    audioRef.current?.pause();
    const audio = new Audio(url);
    audio.volume = 0.5;
    audioRef.current = audio;
    audio.play().catch(() => {});
  };
  const cries = active?.cries;

  return (
    <article className="ds-screen is-more ds-scroll" aria-label="Pokédex-Eintrag">
      <div className="ds-head">
        <div className="ds-col">
          <div className="ds-row" style={{ gap: '6px 10px' }}>
            <h1 className="ds-title">{entry ? prettyName(entry.name) : ''}</h1>
            {badges.map((b) => (
              <span key={b.label} className="ds-pixel" style={{ padding: '3px 10px', borderRadius: 999, background: b.bg, color: b.fg, fontSize: 10 }}>
                {b.label}
              </span>
            ))}
          </div>
          <div className="ds-row" style={{ alignItems: 'baseline', gap: '4px 12px' }}>
            <span className="ds-pixel ds-muted" style={{ fontSize: 12 }}>{id ? dexNo(id) : ''} · POKéDEX-EINTRAG</span>
            <span className="ds-muted" style={{ fontSize: 14 }}>{species ? genusOf(species) : <Skel w={110} />}</span>
          </div>
        </div>
        <button className="ds-btn-key is-chip hw" onClick={onBack}>
          <span aria-hidden="true" className="ds-key">B</span>Zurück
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ flex: '0 0 190px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className={`ds-stage${pixel ? ' is-pixel' : ''}`} style={{ height: 168 }}>
            {shiny && <span aria-hidden="true" style={{ position: 'absolute', top: 10, right: 12, fontSize: 16, color: '#e0a800', zIndex: 2 }}>✦</span>}
            <span aria-hidden="true" className="ds-stage-shadow" style={{ width: 100, marginLeft: -50 }} />
            {img ? (
              <img
                key={img}
                src={img}
                alt={`${entry ? prettyName(entry.name) : ''}${shiny ? ' (schillernd)' : ''}`}
                className={pixel ? 'is-pixel' : undefined}
                width={pixel ? 128 : 144}
                height={pixel ? 128 : 144}
              />
            ) : sprites ? (
              <>
                <span className="ds-pixel" style={{ fontSize: 16 }}>{id ? dexNo(id) : ''}</span>
                <span className="ds-muted" style={{ fontSize: 12, textAlign: 'center', padding: '0 10px' }}>Kein Sprite verfügbar</span>
              </>
            ) : <Skel w={110} h={110} r={16} />}
          </div>
          <div role="group" aria-label="Darstellung" className="ds-seg is-fg" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', borderRadius: 10 }}>
            <button className="hw" aria-pressed={!shiny} onClick={() => setShiny(false)}>Normal</button>
            <button className="hw" aria-pressed={shiny} onClick={() => setShiny(true)}>✦ Schillernd</button>
            <button className="hw" aria-pressed={!pixel} onClick={() => setPixel(false)}>Artwork</button>
            <button className="hw ds-pixel" aria-pressed={pixel} onClick={() => setPixel(true)} style={{ fontSize: 11 }}>Pixel</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 4 }}>
            <button
              className="hw"
              onClick={() => play(cries?.latest)}
              disabled={!cries?.latest}
              aria-label="Ruf abspielen"
              style={{ minHeight: 32, border: 0, borderRadius: 8, background: 'var(--ds-chassis)', color: '#ffffff', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Play />Ruf
            </button>
            <button
              className="hw"
              onClick={() => play(cries?.legacy)}
              disabled={!cries?.legacy}
              aria-label="Klassischen Ruf abspielen"
              style={{ minHeight: 32, border: 0, borderRadius: 8, background: 'var(--ds-chip)', color: 'var(--ds-fg)', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Play />Klassisch
            </button>
          </div>
        </div>

        <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {formChips.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span className="ds-label">FORMEN</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {formChips.map((f) => (
                  <button key={f.key ?? 'std'} className="ds-form hw" aria-pressed={form === f.key} onClick={() => setForm(f.key)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="ds-label">EDITION</span>
            <EditionChips editions={editions} edition={edition} setEdition={setEdition} />
            <p style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--ds-chip)', fontSize: 16, lineHeight: 1.6 }}>
              {!species ? <Skel w="80%" h={14} />
                : flavor || <span className="ds-muted">Kein Pokédex-Eintrag für {ed?.label ?? 'diese Edition'}.</span>}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function EditionChips({ editions, edition, setEdition }) {
  const rowRef = useRef(null);
  // keep the selected edition visible in the horizontally scrolling row
  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector('[aria-pressed="true"]');
    if (!row || !chip) return;
    const left = chip.offsetLeft; // row is the offsetParent (position: relative)
    if (left < row.scrollLeft || left + chip.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollLeft = left - (row.clientWidth - chip.offsetWidth) / 2;
    }
  }, [edition, editions.length]);
  if (!editions.length) return <Skel w="70%" h={30} r={8} />;
  return (
    <div ref={rowRef} className="ds-chiprow ds-scroll" role="group" aria-label="Edition" style={{ position: 'relative' }}>
      {editions.map((e) => (
        <button key={e.key} className="ds-ed hw" aria-pressed={e.key === edition} onClick={() => setEdition(e.key)}>
          {e.label}
        </button>
      ))}
    </div>
  );
}
