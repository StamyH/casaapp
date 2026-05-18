import React from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup, Avatar } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import { useApp } from '../context/AppContext';
import { useImpostazioni } from '../context/ImpostazioniContext';

const COLORI = [
  { valore: '#5C6BC0', secondario: '#26A69A', nome: 'Indaco' },
  { valore: '#26A69A', secondario: '#42A5F5', nome: 'Verde acqua' },
  { valore: '#FF7043', secondario: '#EC407A', nome: 'Arancione' },
  { valore: '#EC407A', secondario: '#AB47BC', nome: 'Rosa' },
  { valore: '#AB47BC', secondario: '#5C6BC0', nome: 'Viola' },
  { valore: '#42A5F5', secondario: '#26A69A', nome: 'Azzurro' },
];

function SelettoreColore({ valore, secondario, nome, selezionato, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
    >
      <Box sx={{
        width: 48, height: 48, borderRadius: '50%',
        bgcolor: valore,
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
  const { impostazioni, aggiornaImpostazioni } = useImpostazioni();
  const { utente } = useApp();
  const isFederico = utente === 'Federico';
  const chiaveAvatar = isFederico ? 'coloreFederico' : 'coloreRiccardo';
  const chiaveApp = isFederico ? 'coloreAppFederico' : 'coloreAppRiccardo';
  const chiaveSecondario = isFederico ? 'coloreSecondarioFederico' : 'coloreSecondarioRiccardo';
  const chiaveModalita = isFederico ? 'modalitaFederico' : 'modalitaRiccardo';
  const coloreAvatar = impostazioni[chiaveAvatar];

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Modalità */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
          Modalità
        </Typography>
        <ToggleButtonGroup
          value={impostazioni[chiaveModalita]}
          exclusive
          onChange={(e, val) => val && aggiornaImpostazioni({ [chiaveModalita]: val })}
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

      {/* Colore dell'app */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
          Colore dell'app
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Colore dei pulsanti e degli elementi principali
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {COLORI.map(colore => (
            <SelettoreColore
              key={colore.valore}
              valore={colore.valore}
              secondario={colore.secondario}
              nome={colore.nome}
              selezionato={impostazioni[chiaveApp] === colore.valore}
              onClick={() => aggiornaImpostazioni({ [chiaveApp]: colore.valore, [chiaveSecondario]: colore.secondario })}
            />
          ))}
        </Box>
      </Box>

      {/* Colore avatar personale */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
          Colore del tuo avatar
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Come appari nei task e nelle spese condivise
        </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: coloreAvatar, width: 40, height: 40, fontWeight: 700 }}>
              {utente?.[0]}
            </Avatar>
            <Typography variant="body2" color="text.secondary">{utente}</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {COLORI.map(colore => (
              <SelettoreColore
                key={colore.valore}
                valore={colore.valore}
                secondario={colore.secondario}
                nome={colore.nome}
                selezionato={coloreAvatar === colore.valore}
                onClick={() => aggiornaImpostazioni({ [chiaveAvatar]: colore.valore })}
              />
            ))}
          </Box>
      </Box>
    </Box>
  );
}

export default ImpostazioniTema;