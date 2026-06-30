import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errore: null, tentativi: 0 };
  }

  static getDerivedStateFromError(errore) {
    return { errore };
  }

  componentDidCatch(errore, info) {
    // Log dell'errore per debug
    console.error('[ErrorBoundary]', errore, info.componentStack);
  }

  handleRiprova = () => {
    const { tentativi } = this.state;
    // Dopo 2 tentativi falliti naviga alla root invece di ri-crashare
    if (tentativi >= 1) {
      window.location.href = '/';
    } else {
      this.setState({ errore: null, tentativi: tentativi + 1 });
    }
  };

  handleReimpostaApp = () => {
    // Cancella tutti i dati dell'app e ricarica da zero
    const chiavi = Object.keys(localStorage).filter(k => k.startsWith('casaapp_'));
    chiavi.forEach(k => localStorage.removeItem(k));
    window.location.href = '/';
  };

  render() {
    if (this.state.errore) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 4,
          textAlign: 'center',
          gap: 2,
        }}>
          <Typography variant="h2">😕</Typography>
          <Typography variant="h6" fontWeight={700}>
            Qualcosa è andato storto
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
            {this.state.errore.message}
          </Typography>
          <Button
            variant="contained"
            onClick={this.handleRiprova}
            sx={{ borderRadius: 3, mt: 1 }}
          >
            {this.state.tentativi >= 1 ? 'Torna alla Home' : 'Riprova'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={this.handleReimpostaApp}
            sx={{ borderRadius: 3 }}
          >
            Reimposta dati app
          </Button>
          <Typography variant="caption" color="text.disabled">
            "Reimposta dati" cancella tutti i dati salvati e ricomincia da capo
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;