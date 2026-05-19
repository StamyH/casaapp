import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Divider, Checkbox } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSpese } from '../context/SpeseContext';
import { useAttivita } from '../context/AttivitaContext';
import { formattaImporto, calcolaBilancio, oggiLocale } from '../utils/helpers';

const GIORNI_SETTIMANA = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

function Home() {
  const navigate = useNavigate();
  const { utenteAttivo, utenti } = useApp();
  const { spese } = useSpese();
  const { attivita, toggleAttivita } = useAttivita();
  const bilancio = calcolaBilancio(spese, utenti);
  const oggi = new Date();
  const oggiStr = oggiLocale();
  const giornoOggi = oggi.getDay();
  const giornoMeseOggi = oggi.getDate();
  const meseKey = `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, '0')}`;

  const coloreApp = utenteAttivo?.coloreApp || '#5C6BC0';
  const coloreSecondario = utenteAttivo?.coloreSecondario || '#26A69A';

  const speseDelMese = spese.filter(s => s.data?.startsWith(meseKey));
  const totaleDelMese = speseDelMese.reduce((acc, s) => acc + s.importo, 0);

  const attivitaOggi = attivita.filter(t => {
    if (t.frequenza === 'giornaliera') return true;
    if (t.frequenza === 'settimanale' && t.giornoSettimana === giornoOggi) return true;
    if (t.frequenza === 'mensile' && t.giornoMese === giornoMeseOggi) return true;
    if (t.frequenza === 'specifica' && t.dataSpecifica === oggiStr) return true;
    return false;
  });

  const prossimeAttivita = attivita.filter(t => {
    if (t.frequenza === 'settimanale' && t.giornoSettimana !== giornoOggi) return true;
    if (t.frequenza === 'mensile' && t.giornoMese !== giornoMeseOggi) return true;
    if (t.frequenza === 'specifica' && t.dataSpecifica > oggiStr) return true;
    return false;
  }).slice(0, 3);

  const inPari = bilancio.importoDebito < 0.01;
  const completateOggi = attivitaOggi.filter(t => t.completato).length;
  const percCompletate = attivitaOggi.length > 0
    ? Math.round((completateOggi / attivitaOggi.length) * 100)
    : 100;

  return (
    <Box sx={{ p: 2 }}>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          👋 Ciao, {utenteAttivo?.nome}!
        </Typography>
        <Typography variant="h6" fontWeight={600} color="text.secondary" textTransform="capitalize">
          {oggi.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Typography>
      </Box>

      {/* Bilancio — cliccabile → /spese */}
      <Card
        elevation={0}
        onClick={() => navigate('/spese')}
        sx={{
          mb: 2, borderRadius: 3, cursor: 'pointer',
          background: `linear-gradient(135deg, ${coloreApp} 0%, ${coloreSecondario} 100%)`,
          color: 'white',
          '&:active': { opacity: 0.9 },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                📊 Bilancio di {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
              </Typography>
              <Typography variant="h6" fontWeight={700} mt={0.5}>
                {inPari
                  ? 'Siete in pari! 🎉'
                  : `${bilancio.debitore} deve ${formattaImporto(bilancio.importoDebito)} a ${bilancio.creditore}`
                }
              </Typography>
            </Box>
            <ChevronRightRoundedIcon sx={{ opacity: 0.7, mt: 0.5 }} />
          </Box>
        </CardContent>
      </Card>

      {/* Statistiche rapide del mese */}
      <Card elevation={0} sx={{ mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Box
              onClick={() => navigate('/spese')}
              sx={{
                p: 1.5, borderRadius: 2, cursor: 'pointer',
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                💸 Speso questo mese
              </Typography>
              <Typography variant="h6" fontWeight={800} mt={0.25}>
                {formattaImporto(totaleDelMese)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {speseDelMese.length} {speseDelMese.length === 1 ? 'spesa' : 'spese'}
              </Typography>
            </Box>
            <Box
              onClick={() => navigate('/attivita')}
              sx={{
                p: 1.5, borderRadius: 2, cursor: 'pointer',
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                ✅ Attività oggi
              </Typography>
              <Typography
                variant="h6"
                fontWeight={800}
                mt={0.25}
                color={percCompletate === 100 ? 'success.main' : 'text.primary'}
              >
                {percCompletate}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {completateOggi}/{attivitaOggi.length} completate
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Attività di oggi — cliccabile → /attivita */}
      <Card elevation={0} sx={{ mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box
            onClick={() => navigate('/attivita')}
            sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              mb: 1.5, cursor: 'pointer',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>☀️ Oggi</Typography>
              <ChevronRightRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            </Box>
            <Chip
              label={`${completateOggi}/${attivitaOggi.length}`}
              size="small"
              color={attivitaOggi.every(t => t.completato) ? 'success' : 'default'}
            />
          </Box>

          {attivitaOggi.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nessuna attività per oggi 🎉
            </Typography>
          ) : (
            attivitaOggi.map((task, i) => (
              <Box key={task.id}>
                {i > 0 && <Divider sx={{ my: 1 }} />}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={task.completato}
                      onChange={() => toggleAttivita(task.id, utenteAttivo?.nome)}
                      size="small"
                      sx={{ p: 0.5, '&.Mui-checked': { color: 'success.main' } }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ textDecoration: task.completato ? 'line-through' : 'none' }}
                      color={task.completato ? 'text.secondary' : 'text.primary'}
                    >
                      {task.titolo}
                    </Typography>
                  </Box>
                  <Chip
                    label={task.assegnato === 'entrambi' ? '👥' : `👤 ${task.assegnato}`}
                    size="small"
                    sx={{ fontSize: '0.65rem' }}
                  />
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* In arrivo — cliccabile → /attivita */}
      {prossimeAttivita.length > 0 && (
        <Card elevation={0} sx={{ mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box
              onClick={() => navigate('/attivita')}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                mb: 1.5, cursor: 'pointer',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>📅 In arrivo</Typography>
              <ChevronRightRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            </Box>
            {prossimeAttivita.map((task, i) => (
              <Box key={task.id}>
                {i > 0 && <Divider sx={{ my: 1 }} />}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{task.titolo}</Typography>
                  <Chip
                    label={
                      task.frequenza === 'settimanale'
                        ? `ogni ${GIORNI_SETTIMANA[task.giornoSettimana]}`
                        : task.frequenza === 'mensile'
                        ? `il ${task.giornoMese} del mese`
                        : new Date(task.dataSpecifica).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
                    }
                    size="small"
                    sx={{ fontSize: '0.65rem' }}
                  />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

    </Box>
  );
}

export default Home;
