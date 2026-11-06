import { useMemo } from 'react';
import { getDefensiveMultipliers } from '@/lib/typeChart';
import {
  DAMAGE_CLASS, EGG_GROUPS, ENCOUNTER_METHODS, GROWTH, METHODS, MOVE_VERSION_GROUP_ALIASES, ROMAN,
  SKEL, STAT_KEYS, STAT_LABELS, TABS, chainPath, fmtMult, fmtNum, fmtPercent, idFromUrl, pickLang,
  prettyName, slugWords, typeColor, typeLabel,
} from './dsData';
import { usePoke, usePokeMany } from './usePokeApi';
import { EditionChips, Skel, TypePill } from './DsTopScreens';

const typesOf = (p) => (p?.types || []).slice().sort((a, b) => a.slot - b.slot).map((t) => t.type.name);

/** Bottom screen in detail mode. */
export default function DsTabs(props) {
  const { tab, setTab } = props;
  return (
    <section className="ds-screen is-bottom is-more" aria-label="Weitere Infos">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div role="tablist" aria-label="Info-Bereiche" className="ds-tabs ds-scroll">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              id={`ds-tab-${key}`}
              className="hw"
              role="tab"
              aria-selected={tab === key}
              aria-controls="ds-tabpanel"
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ds-label">A · NÄCHSTER TAB</span>
      </div>

      <div id="ds-tabpanel" role="tabpanel" aria-labelledby={`ds-tab-${tab}`} className="ds-results ds-scroll">
        {tab === 'abilities' && <Abilities {...props} />}
        {tab === 'training' && <Training {...props} />}
        {tab === 'zucht' && <Breeding {...props} />}
        {tab === 'types' && <TypesTab {...props} />}
        {tab === 'moves' && <Moves {...props} />}
        {tab === 'locations' && <Locations {...props} />}
      </div>
    </section>
  );
}

/* ── Fähigkeiten ───────────────────────────────────────────────────── */

function Abilities({ active }) {
  const abilities = (active?.abilities || []).slice().sort((a, b) => a.slot - b.slot);
  const qs = usePokeMany(abilities.map((a) => a.ability.url));
  if (!active) return <SkelPanels n={2} />;
  let n = 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {abilities.map((a, i) => {
        const d = qs[i]?.data;
        const name = d ? pickLang(d.names, 'name') || slugWords(a.ability.name) : slugWords(a.ability.name);
        const desc = d ? (pickLang(d.flavor_text_entries, 'flavor_text') || pickLang(d.effect_entries, 'short_effect')) : null;
        if (!a.is_hidden) n += 1;
        return (
          <div key={a.ability.name} className="ds-ability">
            <span aria-hidden="true" className={`ds-ability-num${a.is_hidden ? ' is-hidden' : ''}`}>{a.is_hidden ? '?' : n}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
              <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 17 }}>{name}</span>
                {a.is_hidden && <span className="ds-badge">VERSTECKT</span>}
              </span>
              <span className="ds-muted" style={{ fontSize: 14, lineHeight: 1.5 }}>
                {desc ?? <Skel w="85%" h={12} />}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Training ─────────────────────────────────────────────────────── */

function Training({ active, species }) {
  const growthQ = usePoke(species?.growth_rate?.url);
  if (!active || !species) return <SkelPanels n={3} />;

  const ev = STAT_KEYS.map((k) => active.stats.find((s) => s.stat.name === k)?.effort ?? 0);
  const evTotal = ev.reduce((a, b) => a + b, 0);
  const catchRate = species.capture_rate ?? 0;
  const catchLabel = catchRate >= 150 ? 'leicht' : catchRate >= 45 ? 'mittel' : catchRate >= 10 ? 'schwer' : 'sehr schwer';
  const happy = species.base_happiness;
  const growthName = species.growth_rate?.name;
  const [growthLabel, pips] = GROWTH[growthName]
    ?? [pickLang(growthQ.data?.descriptions, 'description') || slugWords(growthName), 3];
  const exp100 = growthQ.data?.levels?.find((l) => l.level === 100)?.experience;

  return (
    <div className="ds-grid2">
      <div className="ds-panel ds-span-all" style={{ gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="ds-label">EV-ERTRAG BEIM BESIEGEN</span>
          <span className="ds-muted" style={{ fontSize: 12 }}>{evTotal} EV gesamt</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 5 }}>
          {ev.map((v, i) => (
            <div key={STAT_LABELS[i]} className={`ds-ev${v ? ' is-on' : ''}`}>
              <span className="ds-pixel" style={{ fontSize: 10, opacity: 0.85 }}>{STAT_LABELS[i]}</span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{v ? `+${v}` : '–'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ds-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <span className="ds-label">FANGRATE</span>
          <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--ds-chip)', fontSize: 11, fontWeight: 700 }}>{catchLabel}</span>
        </div>
        <span className="ds-big">{catchRate} <small>/ 255</small></span>
        <div className="ds-meter"><div style={{ width: `${Math.round((catchRate / 255) * 100)}%` }} /></div>
      </div>

      <div className="ds-panel">
        <span className="ds-label">BASIS-FREUNDSCHAFT</span>
        <span className="ds-big">{happy ?? '—'} <small>/ 255</small></span>
        <div className="ds-meter"><div style={{ width: `${Math.round(((happy ?? 0) / 255) * 100)}%` }} /></div>
      </div>

      <div className="ds-panel">
        <span className="ds-label">BASIS-EP</span>
        <span className="ds-big">{active.base_experience ?? '—'}</span>
        <span className="ds-muted" style={{ fontSize: 12 }}>Grundwert für EP nach einem Sieg</span>
      </div>

      <div className="ds-panel">
        <span className="ds-label">WACHSTUM</span>
        <span style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.1 }}>{growthLabel}</span>
        <div style={{ display: 'flex', gap: 3 }} aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ flex: 1, height: 8, borderRadius: 3, background: i <= pips ? 'var(--ds-chassis)' : 'var(--ds-track)' }} />
          ))}
        </div>
        <span className="ds-muted" style={{ fontSize: 12 }}>
          {exp100 != null ? `${fmtNum(exp100)} EP bis Lv. 100` : <Skel w={120} h={10} />}
        </span>
      </div>
    </div>
  );
}

/* ── Zucht ────────────────────────────────────────────────────────── */

function Breeding({ species, chain, entry }) {
  if (!species) return <SkelPanels n={3} />;
  const rate = species.gender_rate;
  const genderless = rate === -1;
  const female = genderless ? 0 : (rate / 8) * 100;
  const male = 100 - female;
  const cycles = species.hatch_counter ?? 0;
  const path = chain ? chainPath(chain, entry.id) : [];
  const stageIdx = path.findIndex((p) => p.id === entry.id);
  const stageText = !chain ? '' : path.length <= 1 ? 'Keine Entwicklung' : `Stufe ${stageIdx + 1} von ${path.length}`;

  return (
    <div className="ds-grid2">
      <div className="ds-panel ds-span-all" style={{ gap: 10 }}>
        <span className="ds-label">GESCHLECHTERVERTEILUNG</span>
        {genderless ? (
          <span style={{ fontWeight: 700, fontSize: 16 }}>Geschlechtslos</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>
              <span aria-label="männlich" style={{ color: '#3b7ddd' }}>♂</span> {fmtPercent(male)}
            </span>
            <div aria-hidden="true" style={{ flex: 1, display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden' }}>
              <span style={{ width: `${male}%`, background: '#6aa6ff' }} />
              <span style={{ flex: 1, background: '#ff8fb4' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>
              {fmtPercent(female)} <span aria-label="weiblich" style={{ color: '#d2477a' }}>♀</span>
            </span>
          </div>
        )}
      </div>

      <div className="ds-panel" style={{ gap: 8 }}>
        <span className="ds-label">EI-GRUPPEN</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {species.egg_groups.map((g) => (
            <span key={g.name} style={{ padding: '4px 11px', borderRadius: 999, background: 'var(--ds-chip)', fontWeight: 700, fontSize: 14 }}>
              {EGG_GROUPS[g.name] ?? slugWords(g.name)}
            </span>
          ))}
        </div>
      </div>

      <div className="ds-panel" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <svg width="30" height="36" viewBox="0 0 30 36" aria-hidden="true">
          <path d="M15 2 C7 2 2 14 2 22 C2 29 8 34 15 34 C22 34 28 29 28 22 C28 14 23 2 15 2 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M6 21 L11 17 L15 21 L19 17 L24 21" fill="none" stroke="var(--ds-chassis)" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="ds-label">EI-ZYKLEN</span>
          <span style={{ fontWeight: 700, fontSize: 24, lineHeight: 1 }}>{cycles}</span>
          <span className="ds-muted" style={{ fontSize: 12 }}>≈ {fmtNum(cycles * 257)} Schritte</span>
        </div>
      </div>

      <div className="ds-panel ds-span-all" style={{ gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="ds-label">ENTWICKLUNGSSTUFE</span>
          <span className="ds-muted" style={{ fontSize: 12 }}>{stageText}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {!chain ? <Skel w="100%" h={18} /> : path.map((st, i) => {
            const done = i <= stageIdx;
            return [
              i > 0 && (
                <span key={`l${st.id}`} aria-hidden="true" style={{ flex: 1, height: 3, marginTop: 8, borderRadius: 2, background: done ? 'var(--ds-chassis)' : 'var(--ds-track)' }} />
              ),
              <div key={st.id} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 70 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: done ? 'var(--ds-chassis)' : 'var(--ds-track)',
                    boxShadow: i === stageIdx ? '0 0 0 4px var(--ds-chip)' : 'none',
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{prettyName(st.name)}</span>
              </div>,
            ];
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Typen ────────────────────────────────────────────────────────── */

function TypesTab({ active, entry }) {
  const types = typesOf(active);
  if (!active) return <SkelPanels n={2} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span className="ds-muted" style={{ fontSize: 13 }}>
        Schaden, den {prettyName(entry.name)} von Angriffen jedes Typs nimmt
      </span>
      <div className="ds-typegrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 5 }}>
        {getDefensiveMultipliers(types).map(({ type, multiplier: m }) => (
          <div key={type} className="ds-typecell">
            <span style={{ padding: '4px 2px', background: typeColor(type), color: '#15161a', fontSize: 11, fontWeight: 700 }}>{typeLabel(type)}</span>
            <span
              className="ds-pixel"
              style={{
                padding: '5px 2px', fontSize: 13,
                background: m > 1 ? 'var(--ds-weak-bg)' : m < 1 ? 'var(--ds-res-bg)' : 'var(--ds-neut-bg)',
                color: m > 1 ? 'var(--ds-weak-fg)' : m < 1 ? 'var(--ds-res-fg)' : 'var(--ds-neut-fg)',
              }}
            >
              {fmtMult(m)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Attacken ─────────────────────────────────────────────────────── */

const vgKey = (name) => MOVE_VERSION_GROUP_ALIASES[name] ?? name;

function Moves({ active, entry, edition, editions, method, setMethod }) {
  const ed = editions.find((e) => e.key === edition);
  const [, , colLabel] = METHODS.find((m) => m[0] === method) ?? METHODS[0];

  const learnable = useMemo(() => {
    if (!active) return [];
    const out = [];
    active.moves.forEach((m) => {
      const hits = m.version_group_details.filter(
        (d) => vgKey(d.version_group.name) === edition && d.move_learn_method.name === method
      );
      if (hits.length) out.push({ name: m.move.name, url: m.move.url, level: Math.min(...hits.map((h) => h.level_learned_at)) });
    });
    return out;
  }, [active, edition, method]);

  const moveQs = usePokeMany(learnable.map((m) => m.url));
  const machineUrls = method === 'machine'
    ? moveQs.map((q) => q.data?.machines?.find((x) => vgKey(x.version_group.name) === edition)?.machine.url ?? null)
    : [];
  const machineQs = usePokeMany(machineUrls);

  const rows = learnable.map((m, i) => {
    const d = moveQs[i]?.data;
    const machine = machineQs[i]?.data?.item?.name;
    return { ...m, data: d, machine };
  });
  const tmNo = (s) => {
    const n = Number(String(s || '').replace(/\D/g, ''));
    return (String(s).startsWith('hm') ? 1000 : 0) + (Number.isNaN(n) ? 9999 : n);
  };
  rows.sort((a, b) => (
    method === 'level-up' ? a.level - b.level || a.name.localeCompare(b.name)
      : method === 'machine' ? tmNo(a.machine) - tmNo(b.machine)
        : a.name.localeCompare(b.name)
  ));
  const firstCol = (r) => {
    if (method === 'level-up') return r.level > 0 ? r.level : 'Evo';
    if (method === 'machine') {
      if (!r.machine) return r.data ? '—' : '';
      return r.machine.replace(/^tm/, 'TM').replace(/^hm/, 'VM').replace(/^tr/, 'TR');
    }
    return '—';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <div className="ds-seg" role="group" aria-label="Lernart">
          {METHODS.map(([key, label]) => (
            <button key={key} className="hw" aria-pressed={method === key} onClick={() => setMethod(key)} style={{ padding: '0 10px' }}>{label}</button>
          ))}
        </div>
        <span className="ds-muted" style={{ fontSize: 12 }}>
          Edition: <strong style={{ color: 'var(--ds-fg)' }}>{ed?.label ?? '—'}</strong>
        </span>
      </div>
      <div className="ds-table">
        <div className="ds-tr moves is-head">
          <span>{colLabel}</span><span>ATTACKE</span><span>TYP</span><span>KAT.</span><span>STÄ.</span><span>GEN.</span>
        </div>
        {!active ? <SkelMoveRows /> : rows.length === 0 ? (
          <div className="ds-tr ds-muted" style={{ display: 'block' }}>Keine Attacken für diese Lernart in {ed?.label ?? 'dieser Edition'}.</div>
        ) : rows.map((r, i) => (r.data ? (
          <div key={r.name} className="ds-tr moves">
            <span className="ds-pixel" style={{ fontSize: 12 }}>{firstCol(r)}</span>
            <span className="ds-ellipsis" style={{ fontWeight: 700 }}>{pickLang(r.data.names, 'name') || slugWords(r.name)}</span>
            <span><TypePill type={r.data.type.name} small /></span>
            <span>
              {DAMAGE_CLASS[r.data.damage_class?.name] && (
                <span
                  className="ds-dmg"
                  title={DAMAGE_CLASS[r.data.damage_class.name][1]}
                  aria-label={DAMAGE_CLASS[r.data.damage_class.name][1]}
                  style={{ background: DAMAGE_CLASS[r.data.damage_class.name][2] }}
                >
                  {DAMAGE_CLASS[r.data.damage_class.name][0]}
                </span>
              )}
            </span>
            <span style={{ fontWeight: 700 }}>{r.data.power ?? '—'}</span>
            <span className="ds-pixel ds-muted" style={{ fontSize: 11 }}>{ROMAN[idFromUrl(r.data.generation.url) - 1] ?? '—'}</span>
          </div>
        ) : <SkelMoveRow key={r.name} w={SKEL[i % SKEL.length]} />))}
      </div>
      <span className="ds-muted" style={{ fontSize: 12 }}>
        Live aus PokeAPI · /pokemon/{active?.id ?? entry.id} → moves, gefiltert nach Edition und Lernart
      </span>
    </div>
  );
}

const SkelMoveRow = ({ w }) => (
  <div className="ds-tr moves ds-skel">
    <span className="ds-skel-bar" style={{ height: 10, width: 24, borderRadius: 5 }} />
    <span className="ds-skel-bar" style={{ height: 12, width: `${w}%` }} />
    <span className="ds-skel-bar" style={{ height: 18, width: 60, borderRadius: 999 }} />
    <span className="ds-skel-bar" style={{ height: 18, width: 18, borderRadius: 5 }} />
    <span className="ds-skel-bar" style={{ height: 10, width: 26, borderRadius: 5 }} />
    <span className="ds-skel-bar" style={{ height: 10, width: 22, borderRadius: 5 }} />
  </div>
);
const SkelMoveRows = () => SKEL.map((w, i) => <SkelMoveRow key={i} w={w} />);

/* ── Fundorte ─────────────────────────────────────────────────────── */

const Pin = () => (
  <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true" style={{ flex: '0 0 auto' }}>
    <path d="M6 13 C6 13 1 8 1 5 A5 5 0 0 1 11 5 C11 8 6 13 6 13 Z" fill="none" stroke="var(--ds-muted)" strokeWidth="1.6" />
  </svg>
);

const placeName = (area) => slugWords(area.replace(/-area$/, ''));

function Locations({ encounters, encountersLoading, entry, edition, editions, setEdition }) {
  const ed = editions.find((e) => e.key === edition);

  const rows = useMemo(() => {
    if (!encounters || !ed) return [];
    const map = new Map();
    encounters.forEach((enc) => {
      enc.version_details
        .filter((v) => ed.versions.includes(v.version.name))
        .forEach((v) => v.encounter_details.forEach((d) => {
          const key = `${enc.location_area.name}|${d.method.name}`;
          const cur = map.get(key) ?? { area: enc.location_area.name, method: d.method.name, min: Infinity, max: 0, chance: 0 };
          cur.min = Math.min(cur.min, d.min_level);
          cur.max = Math.max(cur.max, d.max_level);
          // best chance across the edition's versions
          cur.chance = Math.max(cur.chance, v.max_chance);
          map.set(key, cur);
        }));
    });
    return [...map.values()].sort((a, b) => a.area.localeCompare(b.area));
  }, [encounters, ed]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <EditionChips editions={editions} edition={edition} setEdition={setEdition} />
      <div className="ds-table">
        <div className="ds-tr locs is-head"><span>ORT</span><span>METHODE</span><span>LEVEL</span><span>CHANCE</span></div>
        {encountersLoading ? SKEL.map((w, i) => (
          <div key={i} className="ds-tr locs ds-skel">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Pin /><span className="ds-skel-bar" style={{ height: 12, width: `${w}%` }} /></span>
            <span className="ds-skel-bar" style={{ height: 18, width: '70%', borderRadius: 999 }} />
            <span className="ds-skel-bar" style={{ height: 10, width: 40, borderRadius: 5 }} />
            <span className="ds-skel-bar" style={{ height: 10, width: 32, borderRadius: 5 }} />
          </div>
        )) : rows.length === 0 ? (
          <div className="ds-tr ds-muted" style={{ display: 'block' }}>
            In {ed?.label ?? 'dieser Edition'} nicht in freier Wildbahn anzutreffen.
          </div>
        ) : rows.map((r) => (
          <div key={`${r.area}|${r.method}`} className="ds-tr locs">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Pin /><span className="ds-ellipsis" style={{ fontWeight: 700 }}>{placeName(r.area)}</span>
            </span>
            <span>
              <span className="ds-ellipsis" style={{ display: 'inline-block', maxWidth: '100%', padding: '2px 8px', borderRadius: 999, background: 'var(--ds-chip)', fontSize: 12, fontWeight: 700 }}>
                {ENCOUNTER_METHODS[r.method] ?? slugWords(r.method)}
              </span>
            </span>
            <span className="ds-pixel" style={{ fontSize: 12 }}>{r.min === r.max ? r.min : `${r.min}–${r.max}`}</span>
            <span style={{ fontWeight: 700 }}>{Math.min(100, r.chance)} %</span>
          </div>
        ))}
      </div>
      <span className="ds-muted" style={{ fontSize: 12 }}>
        Live aus PokeAPI · /pokemon/{entry.id}/encounters · Edition {ed?.label ?? '—'}
      </span>
    </div>
  );
}

/* ── shared skeleton ──────────────────────────────────────────────── */

const SkelPanels = ({ n }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className="ds-panel ds-skel" style={{ gap: 8 }}>
        <span className="ds-skel-bar" style={{ height: 10, width: 90 }} />
        <span className="ds-skel-bar" style={{ height: 14, width: `${SKEL[i % SKEL.length]}%` }} />
      </div>
    ))}
  </div>
);
