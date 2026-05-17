import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Avatar } from '@mui/material';
import { useApp } from '../context/AppContext';
import { useImpostazioni } from '../context/ImpostazioniContext';
import { useNavigate } from 'react-router-dom';

const COLORI_AVATAR = [
  { valore: '#5C6BC0', nome: 'Indaco' },
  { valore: '#26A69A', nome: 'Verde acqua' },
  { valore: '#FF7043', nome: 'Arancione' },
  { valore: '#EC407A', nome: 'Rosa' },
  { valore: '#AB47BC', nome: 'Viola' },
  { valore: '#42A5F5', nome: 'Azzurro' },
];

function ImpostazioniProfilo() {
  const { utente } = useApp();
  const { impostazioni, aggiornaImpostazioni } = useImpostazioni();
  const navigate = useNavigate();

  const chiaveColore = utente === 'Riccardo' ? 'coloreRiccardo' : 'coloreFederico';
  const [errore, setErrore] = useState('');
  const [colore, setColore] = useState(impostazioni[chiaveColore]);

  const salva = () => {
    if (!utente.trim()) {
      setErrore('Il nome non può essere vuoto');
      return;
    }
    aggiornaImpostazioni({ [chiaveColore]: colore });
    navigate('/impostazioni');
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Anteprima avatar */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar sx={{
          width: 80,
          height: 80,
          bgcolor: colore,
          fontSize: '2rem',
          fontWeight: 700,
        }}>
          {utente?.[0]}
        </Avatar>
      </Box>

      {/* Nome (sola lettura — il nome è l'utente selezionato alla login) */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Nome
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {utente}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Il nome si cambia dalla schermata di selezione utente.
        </Typography>
      </Box>

      {/* Selettore colore avatar */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={2}>
          Colore del tuo avatar
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {COLORI_AVATAR.map(c => (
            <Box
              key={c.valore}
              onClick={() => setColore(c.valore)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
              }}
            >
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: c.valore,
                border: colore === c.valore ? '3px solid' : '3px solid transparent',
                borderColor: colore === c.valore ? 'text.primary' : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }} />
              <Typography variant="caption">{c.nome}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

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

export default ImpostazioniProfilo;