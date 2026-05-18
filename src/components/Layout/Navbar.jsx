import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Avatar, IconButton, Box, Menu, MenuItem, Divider } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
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
  const { utente, setUtente } = useApp();
  const { impostazioni } = useImpostazioni();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const titolo = TITOLI[location.pathname] || 'CasaApp';
  const isSottoPagina = location.pathname.split('/').length > 2;
  const coloreAvatar = utente === 'Riccardo' ? impostazioni.coloreRiccardo : impostazioni.coloreFederico;

  const apriMenu = (e) => setAnchorEl(e.currentTarget);
  const chiudiMenu = () => setAnchorEl(null);

  const cambiaUtente = () => {
    chiudiMenu();
    navigate('/benvenuto');
  };

  const logout = () => {
    chiudiMenu();
    setUtente(null);
    navigate('/benvenuto');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ background: 'white', borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isSottoPagina && (
            <IconButton onClick={() => navigate('/impostazioni')} size="small" sx={{ color: 'text.primary' }}>
              <ArrowBackRoundedIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {titolo}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">{utente}</Typography>
          <IconButton onClick={apriMenu} size="small">
            <Avatar sx={{ width: 34, height: 34, bgcolor: coloreAvatar, fontSize: '0.9rem', fontWeight: 700 }}>
              {utente?.[0]}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={chiudiMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem disabled sx={{ opacity: 1 }}>
            <Typography variant="caption" color="text.secondary">Connesso come <strong>{utente}</strong></Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={cambiaUtente}>
            <SwapHorizRoundedIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Cambia utente
          </MenuItem>
          <MenuItem onClick={logout} sx={{ color: 'error.main' }}>
            <LogoutRoundedIcon fontSize="small" sx={{ mr: 1.5 }} />
            Esci
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;