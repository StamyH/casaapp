import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Divider, Checkbox } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSpese } from '../context/SpeseContext';
import { useAttivita } from '../context/AttivitaContext';
import { formattaImporto, calcolaBilancio, oggiLocale } from '../utils/helpers';
import { getAttivitaPerData } from './Calendario';
import { useImpostazioni } from '../context/ImpostazioniContext';

const GIORNI_BREVI = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];

function prossimadata(task, oggiStr) {
  const oggi = new Date(oggiStr + 'T00:00:00');
  if (task.frequenza === 'settimanale') {
    const diff = (task.giornoSettimana - oggi.getDay() + 7) % 7 || 7;
    const next = new Date(oggi);
    next.setDate(oggi.getDate() + diff);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
  }
  if (task.frequenza === 'mensile') {
    let year = oggi.getFullYear();
    let month = oggi.getMonth();
    if (oggi.getDate() >= task.giornoMese) {
      month += 1;
      if (month > 11) { month = 0; year += 1; }
    }
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(task.giornoMese).padStart(2, '0')}`;
  }
  if (task.frequenza === 'specifica') return task.dataSpecifica;
  return null;
}

function etichettaData(dataStr, oggiStr) {
  const diff = Math.round(
    (new Date(dataStr + 'T00:00:00') - new Date(oggiStr + 'T00:00:00')) / 86400000
  );
  if (diff === 1) return 'domani';
  if (diff < 7) return new Date(dataStr + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'short' });
  return new Date(dataStr + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}

function getSettimana(dataStr, primoGiorno = 1) {
  const d = new Date(dataStr + 'T00:00:00');
  const giorno = d.getDay();
  const offset = (giorno - primoGiorno + 7) % 7;
  const inizio = new Date(d);
  inizio.setDate(d.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const giornata = new Date(inizio);
    giornata.setDate(inizio.getDate() + i);
    return `${giornata.getFullYear()}-${String(giornata.getMonth() + 1).padStart(2, '0')}-${String(giornata.getDate()).padStart(2, '0')}`;
  });
}

function Home() {
  const navigate = useNavigate();
  const { utenteAttivo, utenti } = useApp();
  const { impostazioni } = useImpostazioni();
  const { spese } = useSpese();
  const { attivita, toggleAttivita } = useAttivita();
  const oggi = new Date();
  const oggiStr = oggiLocale();
  const giornoOggi = oggi.getDay();
  const giornoMeseOggi = oggi.getDate();
  const meseKey = `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, '0')}`;

  const coloreApp = utenteAttivo?.coloreApp || '#5C6BC0';
  const coloreSecondario = utenteAttivo?.coloreSecondario || '#26A69A';

  const settimana = getSettimana(oggiStr, impostazioni.primoGiornoSettimana);
  const speseDelMese = spese.filter(s => s.data?.startsWith(meseKey));
  const bilancio = calcolaBilancio(speseDelMese, utenti);
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
  })
  .sort((a, b) => (prossimadata(a, oggiStr) || '').localeCompare(prossimadata(b, oggiStr) || ''))
  .slice(0, 3);

  const inPari = bilancio.importoDebito < 0.01;
  const completateOggi = attivitaOggi.filter(t => t.completato).length;
  const percCompletate = attivitaOggi.length > 0
    ? Math.round((completateOggi / attivitaOggi.length) * 100)
    : 100;

  const getColoreUtente = (nome) =>
    utenti.find(u => u.nome === nome)?.coloreAvatar || '#9E9E9E';

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

      {/* Strip settimanale */}
      <Card elevation={0} sx={{ mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>📅 Questa settimana</Typography>
            <Typography
              variant="caption"
              color="primary"
              fontWeight={700}
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/calendario')}
            >
              Vedi tutto →
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
            {settimana.map((data) => {
              const d = new Date(data + 'T00:00:00');
              const tasks = getAttivitaPerData(attivita, data);
              const isOggi = data === oggiStr;
              const utentiPresenti = [
                ...new Set(tasks.map(t =>
                  t.assegnato === 'entrambi' ? '__tutti__' : t.assegnato
                )),
              ].slice(0, 3);

              return (
                <Box
                  key={data}
                  onClick={() => navigate('/calendario', { state: { data } })}
                  sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    py: 1, borderRadius: 2, cursor: 'pointer',
                    bgcolor: isOggi ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: isOggi ? 'primary.dark' : 'action.hover' },
                    transition: 'background-color 0.15s',
                  }}
                >
                  <Typography
                    variant="caption"
                    color={isOggi ? 'primary.contrastText' : 'text.secondary'}
                    fontWeight={600}
                    sx={{ lineHeight: 1.2, fontSize: '0.6rem' }}
                  >
                    {GIORNI_BREVI[d.getDay()]}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={isOggi ? 800 : 500}
                    color={isOggi ? 'primary.contrastText' : 'text.primary'}
                    sx={{ lineHeight: 1.4 }}
                  >
                    {d.getDate()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '2px', mt: '2px', minHeight: 6 }}>
                    {utentiPresenti.map((nome, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          width: 4, height: 4, borderRadius: '50%',
                          bgcolor: nome === '__tutti__'
                            ? (isOggi ? 'rgba(255,255,255,0.7)' : 'text.disabled')
                            : getColoreUtente(nome),
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
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
            {prossimeAttivita.map((task, i) => {
              const nextData = prossimadata(task, oggiStr);
              return (
                <Box key={task.id}>
                  {i > 0 && <Divider sx={{ my: 1 }} />}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap>{task.titolo}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {task.assegnato === 'entrambi' ? '👥 Entrambi' : `👤 ${task.assegnato}`}
                      </Typography>
                    </Box>
                    <Chip
                      label={nextData ? etichettaData(nextData, oggiStr) : '—'}
                      size="small"
                      sx={{ fontSize: '0.65rem', flexShrink: 0 }}
                    />
                  </Box>
                </Box>
              );
            })}
          </CardContent>
        </Card>
      )}

    </Box>
  );
}

export default Home;
