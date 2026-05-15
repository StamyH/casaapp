import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Divider, Checkbox } from '@mui/material';
import { useApp } from '../context/AppContext';
import { formattaImporto, calcolaBilancio } from '../utils/helpers';

const GIORNI_SETTIMANA = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

function Home() {
  const { utente, spese, attivita, toggleAttivita } = useApp();
  const bilancio = calcolaBilancio(spese);
  const oggi = new Date();
  const giornoOggi = oggi.getDay();
  const giornoMeseOggi = oggi.getDate();

  // Attività di oggi — giornaliere + settimanali che cadono oggi + specifiche di oggi
  const attivitaOggi = attivita.filter(t => {
    if (t.frequenza === 'giornaliera') return true;
    if (t.frequenza === 'settimanale' && t.giornoSettimana === giornoOggi) return true;
    if (t.frequenza === 'mensile' && t.giornoMese === giornoMeseOggi) return true;
    if (t.frequenza === 'specifica' && t.dataSpecifica === oggi.toISOString().split('T')[0]) return true;
    return false;
  });

  // Prossime attività settimanali e mensili (non di oggi)
  const prossimeAttivita = attivita.filter(t => {
    if (t.frequenza === 'settimanale' && t.giornoSettimana !== giornoOggi) return true;
    if (t.frequenza === 'mensile' && t.giornoMese !== giornoMeseOggi) return true;
    if (t.frequenza === 'specifica' && t.dataSpecifica > oggi.toISOString().split('T')[0]) return true;
    return false;
  }).slice(0, 3);

  const inPari = bilancio.importoDebito < 0.01;

  return (
    <Box sx={{ p: 2 }}>

      {/* Saluto */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          👋 Ciao, {utente}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {oggi.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Typography>
      </Box>

      {/* Card bilancio */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #5C6BC0 0%, #26A69A 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            📊 Bilancio del mese
          </Typography>
          <Typography variant="h6" fontWeight={700} mt={0.5}>
            {inPari
              ? 'Siete in pari! 🎉'
              : `${bilancio.debitore} deve ${formattaImporto(bilancio.importoDebito)} a ${bilancio.creditore}`
            }
          </Typography>
        </CardContent>
      </Card>

      {/* Attività di oggi */}
      <Card elevation={0} sx={{ mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              ☀️ Oggi
            </Typography>
            <Chip
              label={`${attivitaOggi.filter(t => t.completato).length}/${attivitaOggi.length}`}
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
                      onChange={() => toggleAttivita(task.id)}
                      size="small"
                      sx={{
                        p: 0.5,
                        '&.Mui-checked': { color: 'success.main' },
                      }}
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

      {/* Prossime attività */}
      {prossimeAttivita.length > 0 && (
        <Card elevation={0} sx={{ mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
              📅 In arrivo
            </Typography>
            {prossimeAttivita.map((task, i) => (
              <Box key={task.id}>
                {i > 0 && <Divider sx={{ my: 1 }} />}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {task.titolo}
                  </Typography>
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