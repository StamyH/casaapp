import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function ImpostazioniCasa() {
  const { impostazioni, aggiornaImpostazioni } = useApp();
  const [nomeCasa, setNomeCasa] = useState(impostazioni.nomeCasa);
  const navigate = useNavigate();

  const salva = () => {
    aggiornaImpostazioni({ nomeCasa });
    navigate('/impostazioni');
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Questo nome appare nella schermata di benvenuto e nelle impostazioni.
      </Typography>
      <TextField
        label="Nome della casa"
        fullWidth
        value={nomeCasa}
        onChange={e => setNomeCasa(e.target.value)}
        placeholder="es. Casa Riccardo & Federico"
      />
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={salva}
        disabled={!nomeCasa}
        sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
      >
        Salva
      </Button>
    </Box>
  );
}

export default ImpostazioniCasa;