import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AppProvider, useApp } from './context/AppContext';
import { SpeseProvider } from './context/SpeseContext';
import { AttivitaProvider } from './context/AttivitaContext';
import { ImpostazioniProvider, useImpostazioni } from './context/ImpostazioniContext';
import Home from './pages/Home';
import Spese from './pages/Spese';
import Attivita from './pages/Attivita';
import Impostazioni from './pages/Impostazioni';
import ImpostazioniProfilo from './pages/ImpostazioniProfilo';
import ImpostazioniTema from './pages/ImpostazioniTema';
import ImpostazioniCategorie from './pages/ImpostazioniCategorie';
import ImpostazioniCasa from './pages/ImpostazioniCasa';
import Benvenuto from './pages/Benvenuto';
import Navbar from './components/Layout/Navbar';
import BottomNav from './components/Layout/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';

function AuthGuard() {
  const { utente } = useApp();
  const { impostazioni } = useImpostazioni();
  const navigate = useNavigate();
  const location = useLocation();

  const preferenzaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const modalitaEffettiva = impostazioni.modalita === 'auto' ? preferenzaSistema : impostazioni.modalita;

  const theme = createTheme({
    palette: {
      mode: modalitaEffettiva,
      primary: { main: impostazioni.colore },
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
    if (!utente && location.pathname !== '/benvenuto') {
      navigate('/benvenuto');
    }
  }, [utente, navigate, location]);

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
          <Route path="/impostazioni" element={<Impostazioni />} />
          <Route path="/impostazioni/profilo" element={<ImpostazioniProfilo />} />
          <Route path="/impostazioni/tema" element={<ImpostazioniTema />} />
          <Route path="/impostazioni/categorie" element={<ImpostazioniCategorie />} />
          <Route path="/impostazioni/casa" element={<ImpostazioniCasa />} />
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