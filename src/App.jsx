import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Snackbar, Button } from '@mui/material';
import { AppProvider, useApp } from './context/AppContext';
import { SpeseProvider } from './context/SpeseContext';
import { AttivitaProvider } from './context/AttivitaContext';
import { ImpostazioniProvider } from './context/ImpostazioniContext';
import Home from './pages/Home';
import Spese from './pages/Spese';
import Attivita from './pages/Attivita';
import Statistiche from './pages/Statistiche';
import Calendario from './pages/Calendario';
import Benvenuto from './pages/Benvenuto';
import Impostazioni from './pages/Impostazioni';
import ImpostazioniProfilo from './pages/ImpostazioniProfilo';
import ImpostazioniTema from './pages/ImpostazioniTema';
import ImpostazioniUtenti from './pages/ImpostazioniUtenti';
import ImpostazioniCategorie from './pages/ImpostazioniCategorie';
import ImpostazioniCasa from './pages/ImpostazioniCasa';
import Navbar from './components/Layout/Navbar';
import BottomNav from './components/Layout/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';

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
    swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
  };

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const [preferenzaSistema, setPreferenzaSistema] = useState(mediaQuery.matches ? 'dark' : 'light');

  useEffect(() => {
    const handler = (e) => setPreferenzaSistema(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mediaQuery]);

  const modalitaUtente = utenteAttivo?.modalita || 'auto';
  const modalitaEffettiva = modalitaUtente === 'auto' ? preferenzaSistema : modalitaUtente;

  const theme = createTheme({
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
  });

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
      <div style={{ paddingBottom: mostraNav ? 'calc(70px + env(safe-area-inset-bottom))' : '0' }}>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {mostraNav && <BottomNav />}

      <Snackbar
        open={!!swReg}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message="🆕 Nuova versione disponibile"
        action={
          <Button color="inherit" size="small" fontWeight={700} onClick={aggiornaSW}>
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
    </ErrorBoundary>
  );
}

export default App;
