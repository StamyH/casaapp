import React from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import { useApp } from '../context/AppContext';

const COLORI = [
  { valore: '#5C6BC0', nome: 'Indaco' },
  { valore: '#26A69A', nome: 'Verde acqua' },
  { valore: '#FF7043', nome: 'Arancione' },
  { valore: '#EC407A', nome: 'Rosa' },
  { valore: '#AB47BC', nome: 'Viola' },
  { valore: '#42A5F5', nome: 'Azzurro' },
];

function ImpostazioniTema() {
  const { impostazioni, aggiornaImpostazioni } = useApp();

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Modalità */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
          Modalità
        </Typography>
        <ToggleButtonGroup
          value={impostazioni.modalita}
          exclusive
          onChange={(e, val) => val && aggiornaImpostazioni({ modalita: val })}
          fullWidth
        >
          <ToggleButton value="light" sx={{ gap: 1, py: 1.2 }}>
            <LightModeRoundedIcon fontSize="small" /> Chiara
          </ToggleButton>
          <ToggleButton value="auto" sx={{ gap: 1, py: 1.2 }}>
            <SettingsBrightnessRoundedIcon fontSize="small" /> Auto
          </ToggleButton>
          <ToggleButton value="dark" sx={{ gap: 1, py: 1.2 }}>
            <DarkModeRoundedIcon fontSize="small" /> Scura
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Colore principale */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={2}>
          Colore principale
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {COLORI.map(colore => (
            <Box
              key={colore.valore}
              onClick={() => aggiornaImpostazioni({ colore: colore.valore })}
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
                bgcolor: colore.valore,
                border: impostazioni.colore === colore.valore
                  ? '3px solid'
                  : '3px solid transparent',
                borderColor: impostazioni.colore === colore.valore
                  ? 'text.primary'
                  : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }} />
              <Typography variant="caption">{colore.nome}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

    </Box>
  );
}

export default ImpostazioniTema;