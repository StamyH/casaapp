import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AppProvider, useApp } from './context/AppContext';
import Home from './pages/Home';
import Spese from './pages/Spese';
import Attivita from './pages/Attivita';
import BottomNav from './components/Layout/BottomNav';
import Benvenuto from './pages/Benvenuto';
import Impostazioni from './pages/Impostazioni';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';

// Tema personalizzato dell'app — colori, font, stile generale
const theme = createTheme({
  palette: {
    primary: {
      main: '#5C6BC0', // viola/indaco — colore principale
    },
    secondary: {
      main: '#26A69A', // verde acqua — colore secondario
    },
    background: {
      default: '#F5F5F5', // sfondo grigio chiaro
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 16, // angoli arrotondati ovunque
  },
});

// Componente che controlla se c'è un utente attivo
// Se no, reindirizza alla schermata di benvenuto
function AuthGuard({ children }) {
  const { utente } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!utente && location.pathname !== '/benvenuto') {
      navigate('/benvenuto');
    }
  }, [utente, navigate, location]);

  // Nasconde il BottomNav nella schermata di benvenuto
  const mostraNav = location.pathname !== '/benvenuto';

  return (
    <>
      {mostraNav && <Navbar />}
      <div style={{ paddingBottom: mostraNav ? '70px' : '0' }}>
        <Routes>
          <Route path="/benvenuto" element={<Benvenuto />} />
          <Route path="/" element={<Home />} />
          <Route path="/spese" element={<Spese />} />
          <Route path="/attivita" element={<Attivita />} />
          <Route path="/impostazioni" element={<Impostazioni />} />
        </Routes>
      </div>
      {mostraNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthGuard />
        </BrowserRouter>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;