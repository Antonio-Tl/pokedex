import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useDesign } from '@/lib/DesignContext';
import { DEFAULT_CHASSIS } from './dsData';
import './ds.css';

const Speaker = () => (
  <div className="side spk" aria-hidden="true">
    <div className="ds-speaker">
      {Array.from({ length: 12 }, (_, i) => <span key={i} />)}
    </div>
  </div>
);

const Chevron = ({ d }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const readChassis = () => {
  try { return localStorage.getItem('ds-chassis') || DEFAULT_CHASSIS; } catch { return DEFAULT_CHASSIS; }
};

function Legend() {
  return (
    <aside id="ds-legend" aria-label="Steuerung" className="ds-legend">
      <span className="ds-pixel" style={{ fontSize: 12, color: '#a3a9b8' }}>STEUERUNG</span>
      <div className="ds-legend-grid">
        <span aria-hidden="true" style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 26 26"><path d="M9 1 H17 V9 H25 V17 H17 V25 H9 V17 H1 V9 H9 Z" fill="#3a3c46" /></svg>
        </span><span>Blättern</span>
        <span aria-hidden="true" className="ds-legend-key">A</span><span>Weiter / Details</span>
        <span aria-hidden="true" className="ds-legend-key">B</span><span>Zurück</span>
        <span aria-hidden="true" className="ds-legend-key">X</span><span>Zufälliges Pokémon</span>
        <span aria-hidden="true" className="ds-legend-key">Y</span><span>Typ wechseln</span>
        <span aria-hidden="true" className="ds-legend-dot" />
        <span><span className="ds-pixel" style={{ fontSize: 10, color: '#a3a9b8' }}>START</span> Hell / Dunkel</span>
        <span aria-hidden="true" className="ds-legend-dot" />
        <span><span className="ds-pixel" style={{ fontSize: 10, color: '#a3a9b8' }}>SELECT</span> Raster / Liste</span>
      </div>
    </aside>
  );
}

/**
 * Dual-screen device frame.
 * - `top` / `bottom`: contents of the two screens (each brings its own .ds-screen)
 * - `embed`: alternative single large screen (used to host the Items page)
 * - `controls`: handlers for D-pad, A/B/X/Y, START/SELECT
 */
export default function DsDevice({ top, bottom, embed, controls = {} }) {
  const { theme, toggleTheme } = useTheme();
  const { setDesign } = useDesign();
  const { pathname } = useLocation();
  const [showLegend, setShowLegend] = useState(false);
  const [chassis] = useState(readChassis);
  const dark = theme === 'dark';
  const hasControls = !embed;

  const c = {
    onPrev: () => {}, onNext: () => {}, onA: () => {}, onB: () => {}, onX: () => {}, onY: () => {},
    onSelect: () => {}, aAria: 'Weiter', ...controls,
  };

  return (
    <div className="ds-root" data-screen={dark ? 'dark' : 'light'} style={{ '--ds-chassis': chassis }}>
      <div className="ds-page">
        <div className="ds-device">
          {/* ── upper half ── */}
          <div className="ds-shell ds-shell-top">
            {hasControls && <Speaker />}
            <div className="scr">
              <div className="ds-topbar">
                <span className="ds-pixel" style={{ fontSize: 16 }}>PokéApp</span>
                <div className="ds-topbar-r">
                  <nav aria-label="Hauptnavigation" className="ds-nav">
                    <Link to="/" className="ds-nav-btn hw" aria-current={pathname === '/' ? 'page' : undefined}>Pokédex</Link>
                    <Link to="/items" className="ds-nav-btn hw" aria-current={pathname === '/items' ? 'page' : undefined}>Items</Link>
                  </nav>
                  {hasControls && (
                    <button
                      className="ds-pill hw"
                      onClick={() => setShowLegend((v) => !v)}
                      aria-pressed={showLegend}
                      aria-controls="ds-legend"
                    >
                      <span aria-hidden="true" className="ds-key">?</span>Steuerung
                    </button>
                  )}
                  <button
                    className="ds-pill hw"
                    onClick={() => setDesign('classic')}
                    aria-label="Zum klassischen Design wechseln"
                    title="Klassisches Design"
                  >
                    <span aria-hidden="true" className="ds-key">◧</span>Klassisch
                  </button>
                </div>
              </div>
              <div className="ds-bezel">{embed ?? top}</div>
              {embed && (
                <div className="ds-footer">
                  <span>Fan-Projekt · Daten von <a href="https://pokeapi.co">PokeAPI</a></span>
                  <span>Pokémon © Nintendo, Game Freak, Creatures</span>
                </div>
              )}
            </div>
            {hasControls && <Speaker />}
          </div>

          {hasControls && (
            <>
              <div className="ds-hinge" aria-hidden="true">
                <span className="ds-hinge-knuckle" />
                <span className="ds-hinge-bar" />
                <span className="ds-hinge-knuckle" />
              </div>

              {/* ── lower half ── */}
              <div className="ds-shell ds-shell-bottom">
                <div className="side side-l" style={{ flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                  <div className="ds-dpad">
                    <span />
                    <button className="hw" aria-label="Vorheriger Eintrag" onClick={c.onPrev} style={{ borderRadius: '12px 12px 0 0' }}><Chevron d="M4 11.5 L9 6 L14 11.5" /></button>
                    <span />
                    <button className="hw" aria-label="Vorheriger Eintrag" onClick={c.onPrev} style={{ borderRadius: '12px 0 0 12px' }}><Chevron d="M11.5 4 L6 9 L11.5 14" /></button>
                    <span aria-hidden="true" className="ds-dpad-c"><span /></span>
                    <button className="hw" aria-label="Nächster Eintrag" onClick={c.onNext} style={{ borderRadius: '0 12px 12px 0' }}><Chevron d="M6.5 4 L12 9 L6.5 14" /></button>
                    <span />
                    <button className="hw" aria-label="Nächster Eintrag" onClick={c.onNext} style={{ borderRadius: '0 0 12px 12px' }}><Chevron d="M4 6.5 L9 12 L14 6.5" /></button>
                    <span />
                  </div>
                  <div className="ds-power">
                    <span aria-hidden="true" className="ds-power-led" />
                    <span className="ds-tiny">POWER</span>
                  </div>
                </div>

                <div className="scr">
                  <div className="ds-bezel">{bottom}</div>
                  <div className="ds-footer">
                    <span>Fan-Projekt · Daten von <a href="https://pokeapi.co">PokeAPI</a></span>
                    <span>Pokémon © Nintendo, Game Freak, Creatures</span>
                  </div>
                </div>

                <div className="side side-r" style={{ flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                  <div className="ds-abxy">
                    <span />
                    <button className="hw" onClick={c.onX} aria-label="Zufälliges Pokémon">X</button>
                    <span />
                    <button className="hw" onClick={c.onY} aria-label="Typ wechseln">Y</button>
                    <span />
                    <button className="hw" onClick={c.onA} aria-label={c.aAria}>A</button>
                    <span />
                    <button className="hw" onClick={c.onB} aria-label="Zurück">B</button>
                    <span />
                  </div>
                  <div className="ds-startsel">
                    <div>
                      <button
                        className="hw"
                        onClick={toggleTheme}
                        aria-label={`Start: ${dark ? 'Zum hellen Bildschirm wechseln' : 'Zum dunklen Bildschirm wechseln'}`}
                      />
                      <span>START</span>
                    </div>
                    <div>
                      <button className="hw" onClick={c.onSelect} aria-label="Select: Ansicht wechseln" />
                      <span>SELECT</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {hasControls && showLegend && <Legend />}
      </div>
    </div>
  );
}
