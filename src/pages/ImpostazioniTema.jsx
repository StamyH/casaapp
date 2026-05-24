import React from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup, Avatar } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import { useApp } from '../context/AppContext';
import { COLORI_TEMA } from '../utils/helpers';

function SelettoreColore({ valore, nome, selezionato, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
    >
      <Box sx={{
        width: 48, height: 48, borderRadius: '50%', bgcolor: valore,
        border: selezionato ? '3px solid' : '3px solid transparent',
        borderColor: selezionato ? 'text.primary' : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': { transform: 'scale(1.1)' },
      }} />
      <Typography variant="caption">{nome}</Typography>
    </Box>
  );
}

function ImpostazioniTema() {
  const { utenteAttivo, utenti, modificaUtente } = useApp();

  if (!utenteAttivo) return null;

  const aggiorna = (dati) => modificaUtente(utenteAttivo.id, dati);

  // Colori avatar già usati dagli ALTRI utenti (non modificabile dal corrente)
  const coloriAvatarAltri = utenti
    .filter(u => u.id !== utenteAttivo.id)
    .map(u => u.coloreAvatar);

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Modalità</Typography>
        <ToggleButtonGroup
          value={utenteAttivo.modalita}
          exclusive
          onChange={(e, val) => val && aggiorna({ modalita: val })}
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

      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={0.5}>Colore dell'app</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Colore dei pulsanti e degli elementi principali
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {COLORI_TEMA.map(colore => (
            <SelettoreColore
              key={colore.valore}
              valore={colore.valore}
              nome={colore.nome}
              selezionato={utenteAttivo.coloreApp === colore.valore}
              onClick={() => aggiorna({ coloreApp: colore.valore, coloreSecondario: colore.secondario })}
            />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={0.5}>Colore del tuo avatar</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Come appari nei task e nelle spese condivise. I colori già usati da altri non sono disponibili.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: utenteAttivo.coloreAvatar, width: 40, height: 40, fontWeight: 700 }}>
            {utenteAttivo.nome?.[0]}
          </Avatar>
          <Typography variant="body2" color="text.secondary">{utenteAttivo.nome}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {COLORI_TEMA.map(colore => {
            const usatoDaAltro = coloriAvatarAltri.includes(colore.valore);
            const selezionato = utenteAttivo.coloreAvatar === colore.valore;
            return (
              <Box key={colore.valore} sx={{ position: 'relative' }}>
                <SelettoreColore
                  valore={colore.valore}
                  nome={usatoDaAltro && !selezionato ? '🔒' : colore.nome}
                  selezionato={selezionato}
                  onClick={() => !usatoDaAltro && aggiorna({ coloreAvatar: colore.valore })}
                />
                {usatoDaAltro && !selezionato && (
                  <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 14,
                    borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <Typography sx={{ fontSize: '0.9rem' }}>🔒</Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

    </Box>
  );
}

export default ImpostazioniTema;
