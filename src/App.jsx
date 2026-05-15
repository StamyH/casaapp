import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from './pages/Home';
import Spese from './pages/Spese';
import Attivita from './pages/Attivita';
import BottomNav from './components/Layout/BottomNav';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline normalizza gli stili di default del browser */}
      <CssBaseline />
      <BrowserRouter>
        <div style={{ paddingBottom: '70px' }}>
          {/* Routes definisce quale pagina mostrare in base all'URL */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/spese" element={<Spese />} />
            <Route path="/attivita" element={<Attivita />} />
          </Routes>
        </div>
        {/* BottomNav è sempre visibile in fondo */}
        <BottomNav />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
