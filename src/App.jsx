import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Snackbar, Button, Box, CircularProgress } from '@mui/material';
import { AppProvider, useApp } from './context/AppContext';
import { SpeseProvider } from './context/SpeseContext';
import { AttivitaProvider } from './context/AttivitaContext';
import { ImpostazioniProvider } from './context/ImpostazioniContext';
import { BackendProvider } from './context/BackendContext';
import Navbar from './components/Layout/Navbar';
import BottomNav from './components/Layout/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
// Pagine principali — caricate subito
import Home from './pages/Home';
import Spese from './pages/Spese';
import Attivita from './pages/Attivita';
import Benvenuto from './pages/Benvenuto';
// Pagine secondarie — caricate solo quando necessario (lazy)
const Statistiche = lazy(() => import('./pages/Statistiche'));
const Calendario = lazy(() => import('./pages/Calendario'));
const Impostazioni = lazy(() => import('./pages/Impostazioni'));
const ImpostazioniProfilo = lazy(() => import('./pages/ImpostazioniProfilo'));
const ImpostazioniTema = lazy(() => import('./pages/ImpostazioniTema'));
const ImpostazioniUtenti = lazy(() => import('./pages/ImpostazioniUtenti'));
const ImpostazioniCategorie = lazy(() => import('./pages/ImpostazioniCategorie'));
const ImpostazioniCasa = lazy(() => import('./pages/ImpostazioniCasa'));
const ImpostazioniBackend = lazy(() => import('./pages/ImpostazioniBackend'));

function AuthGuard() {
  const { utenteAttivo } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [swReg, setSwReg] = useState(null);

  useEffect(() => {
    const handler = (e) => setSwReg(e.detail);
    window.addEventListener('swUpdateAvailable', handler);
    return () => window.removeEventListener('swUpdateAvailable', handler);
  }, []);

  const aggiornaSW = () => {
    if (!swReg?.waiting) return;
    // Ricarica la pagina quando il nuovo service worker prende il controllo
    const reloadOnce = () => window.location.reload();
    navigator.serviceWorker.addEventListener('controllerchange', reloadOnce, { once: true });
    swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  const mediaQuery = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)'), []);
  const [preferenzaSistema, setPreferenzaSistema] = useState(mediaQuery.matches ? 'dark' : 'light');

  useEffect(() => {
    const handler = (e) => setPreferenzaSistema(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mediaQuery]);

  const modalitaUtente = utenteAttivo?.modalita || 'auto';
  const modalitaEffettiva = modalitaUtente === 'auto' ? preferenzaSistema : modalitaUtente;

  const theme = useMemo(() => createTheme({
    palette: {
      mode: modalitaEffettiva,
      primary: { main: utenteAttivo?.coloreApp || '#5C6BC0' },
      secondary: { main: '#26A69A' },
      background: {
        default: modalitaEffettiva === 'dark' ? '#121212' : '#F5F5F5',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
      h6: { fontWeight: 700 },
    },
    shape: { borderRadius: 16 },
  }), [modalitaEffettiva, utenteAttivo?.coloreApp]);

  useEffect(() => {
    if (!utenteAttivo && location.pathname !== '/benvenuto') {
      navigate('/benvenuto');
    }
  }, [utenteAttivo, navigate, location]);

  const mostraNav = location.pathname !== '/benvenuto';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {mostraNav && <Navbar />}
      <Box
        key={location.key}
        sx={{
          paddingBottom: mostraNav ? 'calc(70px + env(safe-area-inset-bottom))' : '0',
          animationName: 'pageEnter',
          animationDuration: 'var(--dur-md)',
          animationTimingFunction: 'var(--spring-gentle)',
          animationFillMode: 'both',
        }}
      >
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 10 }}>
            <CircularProgress />
          </Box>
        }>
        <Routes>
          <Route path="/benvenuto" element={<Benvenuto />} />
          <Route path="/" element={<Home />} />
          <Route path="/spese" element={<Spese />} />
          <Route path="/attivita" element={<Attivita />} />
          <Route path="/statistiche" element={<Statistiche />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/impostazioni" element={<Impostazioni />} />
          <Route path="/impostazioni/profilo" element={<ImpostazioniProfilo />} />
          <Route path="/impostazioni/tema" element={<ImpostazioniTema />} />
          <Route path="/impostazioni/utenti" element={<ImpostazioniUtenti />} />
          <Route path="/impostazioni/categorie" element={<ImpostazioniCategorie />} />
          <Route path="/impostazioni/casa" element={<ImpostazioniCasa />} />
          <Route path="/impostazioni/backend" element={<ImpostazioniBackend />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Box>
      {mostraNav && <BottomNav />}

      <Snackbar
        open={!!swReg}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message="🆕 Nuova versione disponibile"
        action={
          <Button color="inherit" size="small" sx={{ fontWeight: 700 }} onClick={aggiornaSW}>
            Aggiorna
          </Button>
        }
        sx={{ top: 'calc(env(safe-area-inset-top) + 8px)' }}
      />
    </ThemeProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BackendProvider>
        <AppProvider>
          <SpeseProvider>
            <AttivitaProvider>
              <ImpostazioniProvider>
                <BrowserRouter>
                  <AuthGuard />
                </BrowserRouter>
              </ImpostazioniProvider>
            </AttivitaProvider>
          </SpeseProvider>
        </AppProvider>
      </BackendProvider>
    </ErrorBoundary>
  );
}

export default App;
