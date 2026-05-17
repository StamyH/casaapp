import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Avatar, IconButton, Box } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useApp } from '../../context/AppContext';
import { useImpostazioni } from '../../context/ImpostazioniContext';

const TITOLI = {
  '/': 'Home',
  '/spese': 'Spese',
  '/attivita': 'Attività',
  '/impostazioni': 'Impostazioni',
  '/impostazioni/profilo': 'Profilo',
  '/impostazioni/tema': 'Tema',
  '/impostazioni/categorie': 'Categorie spese',
  '/impostazioni/casa': 'La tua casa',
};

function Navbar() {
  const { utente } = useApp();
  const { impostazioni } = useImpostazioni();
  const location = useLocation();
  const navigate = useNavigate();

  const titolo = TITOLI[location.pathname] || 'CasaApp';

  // Mostra il tasto indietro nelle sotto-pagine
  const isSottoPagina = location.pathname.split('/').length > 2;

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Tasto indietro nelle sotto-pagine */}
          {isSottoPagina && (
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.primary' }}>
              <ArrowBackRoundedIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {titolo}
          </Typography>
        </Box>

        {/* Avatar utente */}
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