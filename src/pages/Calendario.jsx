import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Chip, Divider, Checkbox, Fab,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useLocation } from 'react-router-dom';
import { useAttivita } from '../context/AttivitaContext';
import { useApp } from '../context/AppContext';
import { useImpostazioni } from '../context/ImpostazioniContext';
import { oggiLocale } from '../utils/helpers';
import AggiuntaTask from '../components/Attivita/AggiuntaTask';

const NOMI_GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

export function getAttivitaPerData(attivita, dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  const giorno = d.getDay();
  const giornoMese = d.getDate();
  const oggi = oggiLocale();

  return attivita.filter(t => {
    if (t.frequenza === 'giornaliera') return true;
    if (t.frequenza === 'settimanale') return t.giornoSettimana === giorno;
    if (t.frequenza === 'mensile') return t.giornoMese === giornoMese;
    if (t.frequenza === 'specifica') return t.dataSpecifica === dataStr;
    return false;
  }).filter(t => {
    if (t.dataFine && t.frequenza !== 'specifica' && t.dataFine < dataStr) return false;
    if (t.frequenza === 'specifica' && t.dataSpecifica < oggi && !t.completato) return false;
    return true;
  });
}

function generaGiorniMese(anno, mese, primoGiorno = 1) {
  const primoDelMese = new Date(anno, mese, 1);
  const ultimoDelMese = new Date(anno, mese + 1, 0);

  let offset = (primoDelMese.getDay() - primoGiorno + 7) % 7;

  const giorni = Array(offset).fill(null);
  for (let d = 1; d <= ultimoDelMese.getDate(); d++) {
    giorni.push(
      `${anno}-${String(mese + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    );
  }
  while (giorni.length % 7 !== 0) giorni.push(null);
  return giorni;
}

function Calendario() {
  const location = useLocation();
  const oggi = oggiLocale();
  const initialData = location.state?.data || oggi;
  const initialDate = new Date(initialData + 'T00:00:00');

  const [dataSelezionata, setDataSelezionata] = useState(initialData);
  const [anno, setAnno] = useState(initialDate.getFullYear());
  const [mese, setMese] = useState(initialDate.getMonth());
  const [drawerAperto, setDrawerAperto] = useState(false);
  const [attivitaInModifica, setAttivitaInModifica] = useState(null);

  const { attivita, toggleAttivita } = useAttivita();
  const { utenteAttivo, utenti } = useApp();
  const { impostazioni } = useImpostazioni();
  const primoGiorno = impostazioni.primoGiornoSettimana ?? 1;

  const intestazioniGiorni = Array.from({ length: 7 }, (_, i) =>
    NOMI_GIORNI[(primoGiorno + i) % 7]
  );

  const nomeMese = new Date(anno, mese, 1).toLocaleDateString('it-IT', {
    month: 'long', year: 'numeric',
  });

  const giorni = generaGiorniMese(anno, mese, primoGiorno);
  const attivitaGiorno = getAttivitaPerData(attivita, dataSelezionata);

  const getColoreUtente = (nome) =>
    utenti.find(u => u.nome === nome)?.coloreAvatar || '#9E9E9E';

  const prevMese = () => {
    const d = new Date(anno, mese - 1, 1);
    setAnno(d.getFullYear());
    setMese(d.getMonth());
  };

  const nextMese = () => {
    const d = new Date(anno, mese + 1, 1);
    setAnno(d.getFullYear());
    setMese(d.getMonth());
  };

  const apriModifica = (task) => {
    setAttivitaInModifica(task);
    setDrawerAperto(true);
  };

  const apriNuova = () => {
    setAttivitaInModifica(null);
    setDrawerAperto(true);
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>

      {/* Navigazione mese */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        bgcolor: 'action.hover', borderRadius: 3, px: 1, mb: 1.5,
      }}>
        <IconButton onClick={prevMese} size="small">
          <ChevronLeftRoundedIcon />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700} textTransform="capitalize">
          {nomeMese}
        </Typography>
        <IconButton onClick={nextMese} size="small">
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>

      {/* Intestazioni giorni */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {intestazioniGiorni.map(g => (
          <Typography key={g} variant="caption" color="text.secondary" fontWeight={700} textAlign="center" sx={{ fontSize: '0.65rem' }}>
            {g}
          </Typography>
        ))}
      </Box>

      {/* Griglia giorni — compatta */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', mb: 2 }}>
        {giorni.map((data, i) => {
          if (!data) return <Box key={`e-${i}`} sx={{ height: 40 }} />;

          const tasksDelGiorno = getAttivitaPerData(attivita, data);
          const isOggi = data === oggi;
          const isSel = data === dataSelezionata;

          // Per ogni utente/gruppo: calcola completion ratio per opacità del dot
          const dotInfo = [];
          const assegnatari = [...new Set(tasksDelGiorno.map(t => t.assegnato))];
          assegnatari.forEach(ass => {
            const tasksDell = tasksDelGiorno.filter(t => t.assegnato === ass);
            const completati = tasksDell.filter(t => t.completato).length;
            const ratio = tasksDell.length > 0 ? completati / tasksDell.length : 0;

            if (ass === 'entrambi') {
              utenti.forEach(u => {
                dotInfo.push({ colore: u.coloreAvatar, ratio });
              });
            } else {
              dotInfo.push({ colore: getColoreUtente(ass), ratio });
            }
          });

          // Dedup per colore, prendi il ratio più alto
          const dotDedup = Object.values(
            dotInfo.reduce((acc, d) => {
              if (!acc[d.colore] || d.ratio > acc[d.colore].ratio) acc[d.colore] = d;
              return acc;
            }, {})
          ).slice(0, 3);

          return (
            <Box
              key={data}
              onClick={() => setDataSelezionata(data)}
              sx={{
                height: 40,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1.5, cursor: 'pointer',
                bgcolor: isSel ? 'primary.main' : isOggi ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: isSel ? 'primary.dark' : 'action.hover' },
                transition: 'background-color 0.15s',
              }}
            >
              <Typography
                variant="caption"
                fontWeight={isOggi || isSel ? 800 : 400}
                sx={{
                  color: isSel ? 'primary.contrastText' : isOggi ? 'primary.main' : 'text.primary',
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                }}
              >
                {new Date(data + 'T00:00:00').getDate()}
              </Typography>

              {dotDedup.length > 0 && (
                <Box sx={{ display: 'flex', gap: '2px', mt: '3px' }}>
                  {dotDedup.map((dot, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 5, height: 5, borderRadius: '50%',
                        bgcolor: isSel ? 'rgba(255,255,255,0.9)' : dot.colore,
                        opacity: isSel ? 1 : dot.ratio === 1 ? 1 : dot.ratio > 0 ? 0.55 : 0.3,
                        border: dot.ratio === 0 && !isSel ? `1.5px solid ${dot.colore}` : 'none',
                        boxSizing: 'border-box',
                        transition: 'opacity 0.2s',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Attività del giorno selezionato */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700} textTransform="capitalize">
          {new Date(dataSelezionata + 'T00:00:00').toLocaleDateString('it-IT', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </Typography>
        <Chip
          label={`${attivitaGiorno.filter(t => t.completato).length}/${attivitaGiorno.length}`}
          size="small"
          color={attivitaGiorno.length > 0 && attivitaGiorno.every(t => t.completato) ? 'success' : 'default'}
        />
      </Box>

      {attivitaGiorno.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography fontSize="2rem">🎉</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Nessuna attività per questo giorno
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {attivitaGiorno.map(task => (
            <Box
              key={task.id}
              onClick={() => apriModifica(task)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                p: 1.5, borderRadius: 2, cursor: 'pointer',
                bgcolor: 'action.hover', opacity: task.completato ? 0.6 : 1,
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <Checkbox
                checked={task.completato}
                onClick={e => e.stopPropagation()}
                onChange={() => toggleAttivita(task.id, utenteAttivo?.nome)}
                size="small"
                sx={{ p: 0.5, '&.Mui-checked': { color: 'success.main' } }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  sx={{ textDecoration: task.completato ? 'line-through' : 'none' }}
                >
                  {task.titolo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {task.frequenza === 'giornaliera' ? 'Ogni giorno' :
                   task.frequenza === 'settimanale' ? 'Settimanale' :
                   task.frequenza === 'mensile' ? 'Mensile' : '📌 Una tantum'}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  bgcolor: task.assegnato === 'entrambi'
                    ? 'text.disabled'
                    : getColoreUtente(task.assegnato),
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      <Fab
        color="primary"
        size="medium"
        onClick={apriNuova}
        sx={{ position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', right: 24, boxShadow: 4 }}
      >
        <AddRoundedIcon />
      </Fab>

      <AggiuntaTask
        aperto={drawerAperto}
        onChiudi={() => { setDrawerAperto(false); setAttivitaInModifica(null); }}
        attivitaInModifica={attivitaInModifica}
      />
    </Box>
  );
}

export default Calendario;
