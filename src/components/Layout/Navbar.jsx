import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Avatar, IconButton, Box } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useApp } from '../../context/AppContext';
import ImpostazioniDrawer from '../ImpostazioniDrawer';

const TITOLI = {
  '/': 'Home',
  '/spese': 'Spese',
  '/attivita': 'Attività',
  '/statistiche': 'Statistiche',
};

function Navbar() {
  const { utenteAttivo } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerAperto, setDrawerAperto] = useState(false);

  const titolo = TITOLI[location.pathname] || 'CasaApp';
  const isSottoPagina = location.pathname.split('/').length > 2;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ background: 'white', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isSottoPagina && (
              <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.primary' }}>
                <ArrowBackRoundedIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {titolo}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">{utenteAttivo?.nome}</Typography>
            <IconButton onClick={() => setDrawerAperto(true)} size="small">
              <Avatar sx={{ width: 34, height: 34, bgcolor: utenteAttivo?.coloreAvatar, fontSize: '0.9rem', fontWeight: 700 }}>
                {utenteAttivo?.nome?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <ImpostazioniDrawer aperto={drawerAperto} onChiudi={() => setDrawerAperto(false)} />
    </>
  );
}

export default Navbar;
