import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { useApp } from '../context/AppContext';

// Schermata iniziale — selezione utente
// Viene mostrata solo se nessun utente è ancora attivo
function Benvenuto() {
  const { setUtente, impostazioni } = useApp();
  const navigate = useNavigate();

  const selezionaUtente = (nome) => {
    setUtente(nome);
    navigate('/');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #5C6BC0 0%, #26A69A 100%)',
      gap: 4,
      p: 3,
    }}>
      {/* Titolo */}
      <Box sx={{ textAlign: 'center', color: 'white' }}>
        <Typography variant="h3" fontWeight={800} mb={1}>
          🏠
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {impostazioni.nomeCasa}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
          Chi sei?
        </Typography>
      </Box>

      {/* Bottoni utente */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {['Riccardo', 'Federico'].map((nome) => (
          <Button
            key={nome}
            onClick={() => selezionaUtente(nome)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 3,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              width: 130,
              height: 150,
              '&:hover': {
                background: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease',
              }
            }}
          >
            <Avatar sx={{
              width: 64,
              height: 64,
              fontSize: '1.8rem',
              background: 'rgba(255,255,255,0.3)',
            }}>
              {nome[0]}
            </Avatar>
            <Typography fontWeight={700} fontSize='1.1rem'>
              {nome}
            </Typography>
          </Button>
        ))}
      </Box>
    </Box>
  );
}

export default Benvenuto;