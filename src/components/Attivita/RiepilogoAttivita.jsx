import React, { useState, useEffect } from 'react';
import { Card, CardContent, Box, Typography, Divider, IconButton, Collapse } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { useAttivita } from '../../context/AttivitaContext';
import { useApp } from '../../context/AppContext';
import { useImpostazioni } from '../../context/ImpostazioniContext';
import { oggiLocale } from '../../utils/helpers';

function RiepilogoAttivita() {
  const { attivita, storicoCompletamenti } = useAttivita();
  const { utenteAttivo, utenti } = useApp();
  const { impostazioni } = useImpostazioni();

  const coloreApp = utenteAttivo?.coloreApp || '#5C6BC0';
  const coloreSecondario = utenteAttivo?.coloreSecondario || '#26A69A';

  const oggi = new Date();
  const oggiStr = oggiLocale();
  const giornoOggi = oggi.getDay();
  const giornoMeseOggi = oggi.getDate();

  // Task di oggi
  const taskOggi = attivita.filter(t => {
    if (t.dataFine && t.dataFine < oggiStr) return false;
    if (t.frequenza === 'giornaliera') return true;
    if (t.frequenza === 'settimanale' && t.giornoSettimana === giornoOggi) return true;
    if (t.frequenza === 'mensile' && t.giornoMese === giornoMeseOggi) return true;
    if (t.frequenza === 'specifica' && t.dataSpecifica === oggiStr) return true;
    return false;
  });

  const completateOggi = taskOggi.filter(t => t.completato).length;
  const totaleOggi = taskOggi.length;
  const tuttoFatto = totaleOggi > 0 && completateOggi === totaleOggi;

  const [espanso, setEspanso] = useState(!tuttoFatto);
  useEffect(() => {
    if (tuttoFatto) setEspanso(false);
    else setEspanso(true);
  }, [tuttoFatto]);

  // Completamenti di oggi dallo storico (per sapere chi ha fatto cosa)
  const storicoOggi = storicoCompletamenti.filter(s => s.data === oggiStr);
  const perUtente = {};
  utenti.forEach(u => { perUtente[u.nome] = 0; });
  storicoOggi.forEach(s => {
    if (perUtente[s.completatoDa] !== undefined) perUtente[s.completatoDa]++;
  });

  // Completamenti della settimana (dal primo giorno impostato)
  const primoGiorno = impostazioni.primoGiornoSettimana ?? 1;
  const inizioSettimana = new Date(oggi);
  const offsetSettimana = (oggi.getDay() - primoGiorno + 7) % 7;
  inizioSettimana.setDate(oggi.getDate() - offsetSettimana);
  const inizioStr = `${inizioSettimana.getFullYear()}-${String(inizioSettimana.getMonth() + 1).padStart(2, '0')}-${String(inizioSettimana.getDate()).padStart(2, '0')}`;
  const totaleSettimana = storicoCompletamenti.filter(s => s.data >= inizioStr && s.data <= oggiStr).length;

  const nomeGiorno = oggi.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Card
      elevation={0}
      sx={{
        mb: 3, borderRadius: 3,
        background: `linear-gradient(135deg, ${coloreApp} 0%, ${coloreSecondario} 100%)`,
        color: 'white',
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Header sempre visibile */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {tuttoFatto && !espanso && <CheckCircleOutlineRoundedIcon fontSize="small" />}
            <Typography variant="subtitle2" sx={{ opacity: tuttoFatto && !espanso ? 1 : 0.8, textTransform: 'capitalize', fontWeight: tuttoFatto && !espanso ? 700 : 400 }}>
              {tuttoFatto && !espanso ? 'Tutto fatto oggi! 🎉' : `✅ ${nomeGiorno}`}
            </Typography>
          </Box>
          {tuttoFatto && (
            <IconButton size="small" onClick={() => setEspanso(p => !p)} sx={{ color: 'rgba(255,255,255,0.8)', p: 0.5 }}>
              {espanso ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>

        {/* Contenuto collassabile */}
        <Collapse in={espanso}>
          <Box>
            <Box mt={1.5} mb={2}>
              {totaleOggi === 0 ? (
                <Typography variant="h6" fontWeight={700}>Nessuna attività per oggi 🎉</Typography>
              ) : tuttoFatto ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlineRoundedIcon />
                  <Typography variant="h6" fontWeight={700}>Tutto fatto oggi! 🎉</Typography>
                </Box>
              ) : (
                <Typography variant="h6" fontWeight={700}>
                  {completateOggi}/{totaleOggi} attività completate
                </Typography>
              )}
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              {utenti.map(u => (
                <Box key={u.id}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Completate da {u.nome}</Typography>
                  <Typography fontWeight={700}>{perUtente[u.nome] ?? 0} oggi</Typography>
                </Box>
              ))}
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Questa settimana</Typography>
                <Typography fontWeight={700}>{totaleSettimana} totali</Typography>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default RiepilogoAttivita;
