import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useApp } from '../context/AppContext';

function ImpostazioniProfilo() {
  const { utenteAttivo } = useApp();

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: utenteAttivo?.coloreAvatar, fontSize: '2rem', fontWeight: 700 }}>
          {utenteAttivo?.nome?.[0]}
        </Avatar>
      </Box>

      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>Nome</Typography>
        <Typography variant="body1">{utenteAttivo?.nome}</Typography>
        <Typography variant="caption" color="text.disabled">
          Puoi modificare il nome dalla sezione Utenti nelle impostazioni.
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Per cambiare il colore del tuo avatar vai su Tema.
      </Typography>

    </Box>
  );
}

export default ImpostazioniProfilo;
