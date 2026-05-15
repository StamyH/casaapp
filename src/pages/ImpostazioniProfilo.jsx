import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Avatar } from '@mui/material';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function ImpostazioniProfilo() {
  const { utente, setUtente, impostazioni } = useApp();
  const [nome, setNome] = useState(utente);
  const navigate = useNavigate();

  const salva = () => {
    setUtente(nome);
    navigate('/impostazioni');
  };

  return (
    <Box sx={{ p: 2 }}>

      {/* Anteprima avatar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar sx={{
          width: 80,
          height: 80,
          bgcolor: impostazioni.colore,
          fontSize: '2rem',
          fontWeight: 700,
        }}>
          {nome?.[0]}
        </Avatar>
      </Box>

      <TextField
        label="Il tuo nome"
        fullWidth
        value={nome}
        onChange={e => setNome(e.target.value)}
        sx={{ mb: 3 }}
      />
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={salva}
        disabled={!nome}
        sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
      >
        Salva
      </Button>
    </Box>
  );
}

export default ImpostazioniProfilo;