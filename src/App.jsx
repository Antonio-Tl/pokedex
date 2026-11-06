import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { ThemeProvider } from './lib/ThemeContext';
import { DesignProvider, useDesign } from './lib/DesignContext';
import Pokedex from './pages/Pokedex';
import Items from './pages/Items';
import DsPokedex from './pages/DsPokedex';
import DsItems from './pages/DsItems';
import AppLayout from './components/layout/AppLayout';
// Add page imports here

// Renders the page variant of the currently selected design.
function ByDesign({ classic, ds }) {
  const { design } = useDesign();
  return design === 'ds' ? ds : classic;
}

function App() {

  return (
    <QueryClientProvider client={queryClientInstance}>
      <ThemeProvider>
        <DesignProvider>
          <Router>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<ByDesign classic={<Pokedex />} ds={<DsPokedex />} />} />
                <Route path="/items" element={<ByDesign classic={<Items />} ds={<DsItems />} />} />
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </DesignProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
