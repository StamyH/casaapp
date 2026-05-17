import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useApp } from '../context/AppContext';
import { useImpostazioni } from '../context/ImpostazioniContext';

function ImpostazioniProfilo() {
  const { utente } = useApp();
  const { impostazioni } = useImpostazioni();
  const chiaveColore = utente === 'Riccardo' ? 'coloreRiccardo' : 'coloreFederico';
  const coloreAvatar = impostazioni[chiaveColore];

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: coloreAvatar, fontSize: '2rem', fontWeight: 700 }}>
          {utente?.[0]}
        </Avatar>
      </Box>

      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Nome
        </Typography>
        <Typography variant="body1">{utente}</Typography>
        <Typography variant="caption" color="text.disabled">
          Il nome si cambia dalla schermata di selezione utente.
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Per cambiare il colore del tuo avatar vai su Tema.
      </Typography>

    </Box>
  );
}

export default ImpostazioniProfilo;