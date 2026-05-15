import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Avatar, IconButton, Box } from '@mui/material';
import { useApp } from '../../context/AppContext';

// Titoli per ogni schermata
const TITOLI = {
  '/': 'Home',
  '/spese': 'Spese',
  '/attivita': 'Attività',
  '/impostazioni': 'Impostazioni',
};

function Navbar() {
  const { utente, impostazioni } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const titolo = TITOLI[location.pathname] || 'CasaApp';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Titolo schermata */}
        <Typography
          variant="h6"
          fontWeight={700}
          color="text.primary"
        >
          {titolo}
        </Typography>

        {/* Avatar utente — clicca per cambiare utente */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {utente}
          </Typography>
          <IconButton onClick={() => navigate('/benvenuto')} size="small">
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: impostazioni.colore,
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {utente?.[0]}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;