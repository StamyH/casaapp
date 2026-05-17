import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errore: null };
  }

  static getDerivedStateFromError(errore) {
    return { errore };
  }

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
          <Typography variant="body2" color="text.secondary">
            {this.state.errore.message}
          </Typography>
          <Button
            variant="contained"
            onClick={() => this.setState({ errore: null })}
            sx={{ borderRadius: 3, mt: 1 }}
          >
            Riprova
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;