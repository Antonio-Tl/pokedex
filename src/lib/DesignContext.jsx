import { createContext, useCallback, useContext, useState } from 'react';

// Selectable UI design: 'classic' (the original card grid) or 'ds' (dual-screen device).
// Persisted in localStorage; `?design=ds` / `?design=classic` in the URL overrides it.

export const DESIGNS = ['classic', 'ds'];
const STORAGE_KEY = 'design';

const DesignContext = createContext({ design: 'classic', setDesign: () => {} });

const readInitialDesign = () => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('design');
    if (DESIGNS.includes(fromUrl)) {
      localStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (DESIGNS.includes(saved)) return saved;
  } catch {
    // storage unavailable – use default
  }
  return 'classic';
};

export function DesignProvider({ children }) {
  const [design, setDesignState] = useState(readInitialDesign);

  const setDesign = useCallback((next) => {
    if (!DESIGNS.includes(next)) return;
    setDesignState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  }, []);

  return (
    <DesignContext.Provider value={{ design, setDesign }}>
      {children}
    </DesignContext.Provider>
  );
}

export const useDesign = () => useContext(DesignContext);
