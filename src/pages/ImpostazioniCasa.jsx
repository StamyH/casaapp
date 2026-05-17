import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function ImpostazioniCasa() {
  const { impostazioni, aggiornaImpostazioni } = useApp();
  const [nomeCasa, setNomeCasa] = useState(impostazioni.nomeCasa);
  const [errore, setErrore] = useState('');
  const navigate = useNavigate();

  const salva = () => {
    if (!nomeCasa.trim()) {
      setErrore('Il nome della casa non può essere vuoto');
      return;
    }
    aggiornaImpostazioni({ nomeCasa: nomeCasa.trim() });
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
        onChange={e => { setNomeCasa(e.target.value); setErrore(''); }}
        placeholder="es. Casa Riccardo & Federico"
        error={!!errore}
        helperText={errore}
      />
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={salva}
        sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
      >
        Salva
      </Button>
    </Box>
  );
}

export default ImpostazioniCasa;