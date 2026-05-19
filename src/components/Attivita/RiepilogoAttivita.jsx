import React from 'react';
import { Card, CardContent, Box, Typography, Divider } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { useAttivita } from '../../context/AttivitaContext';
import { useApp } from '../../context/AppContext';

function RiepilogoAttivita() {
  const { attivita, storicoCompletamenti } = useAttivita();
  const { utenteAttivo, utenti } = useApp();

  const coloreApp = utenteAttivo?.coloreApp || '#5C6BC0';
  const coloreSecondario = utenteAttivo?.coloreSecondario || '#26A69A';

  const oggi = new Date();
  const oggiStr = oggi.toISOString().split('T')[0];
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

  // Completamenti di oggi dallo storico (per sapere chi ha fatto cosa)
  const storicoOggi = storicoCompletamenti.filter(s => s.data === oggiStr);
  const perUtente = {};
  utenti.forEach(u => { perUtente[u.nome] = 0; });
  storicoOggi.forEach(s => {
    if (perUtente[s.completatoDa] !== undefined) perUtente[s.completatoDa]++;
  });

  // Completamenti della settimana (lun-oggi)
  const inizioSettimana = new Date(oggi);
  inizioSettimana.setDate(oggi.getDate() - ((oggi.getDay() + 6) % 7));
  const inizioStr = inizioSettimana.toISOString().split('T')[0];
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
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 2, textTransform: 'capitalize' }}>
          ✅ {nomeGiorno}
        </Typography>

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

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />

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
      </CardContent>
    </Card>
  );
}

export default RiepilogoAttivita;
