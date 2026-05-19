import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AppProvider, useApp } from './context/AppContext';
import { SpeseProvider } from './context/SpeseContext';
import { AttivitaProvider } from './context/AttivitaContext';
import { ImpostazioniProvider } from './context/ImpostazioniContext';
import Home from './pages/Home';
import Spese from './pages/Spese';
import Attivita from './pages/Attivita';
import Statistiche from './pages/Statistiche';
import Benvenuto from './pages/Benvenuto';
import Navbar from './components/Layout/Navbar';
import BottomNav from './components/Layout/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';

function AuthGuard() {
  const { utenteAttivo } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

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
      <div style={{ paddingBottom: mostraNav ? '70px' : '0' }}>
        <Routes>
          <Route path="/benvenuto" element={<Benvenuto />} />
          <Route path="/" element={<Home />} />
          <Route path="/spese" element={<Spese />} />
          <Route path="/attivita" element={<Attivita />} />
          <Route path="/statistiche" element={<Statistiche />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {mostraNav && <BottomNav />}
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
