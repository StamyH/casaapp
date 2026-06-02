import React, { useState } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import TaskCard from './TaskCard';
import { oggiLocale } from '../../utils/helpers';

const SEZIONI = [
  { frequenza: 'giornaliera', titolo: '☀️ Oggi', colore: '#FF7043' },
  { frequenza: 'settimanale', titolo: '📅 Questa settimana', colore: '#5C6BC0' },
  { frequenza: 'mensile', titolo: '🗓️ Questo mese', colore: '#26A69A' },
  { frequenza: 'specifica', titolo: '📌 Data specifica', colore: '#AB47BC' },
];

const PRIORITA_ORDINE = { alta: 0, media: 1, bassa: 2 };

function TaskList({ attivita, onModifica, mostraCompletate }) {
  const oggi = oggiLocale();
  const [completateAperte, setCompletateAperte] = useState(false);

  const attivitaFiltrate = attivita.filter(t => {
    if (t.dataFine && t.frequenza !== 'specifica' && t.dataFine < oggi) return false;
    return true;
  });

  const inRitardo = attivitaFiltrate.filter(
    t => t.frequenza === 'specifica' && t.dataSpecifica && t.dataSpecifica < oggi && !t.completato
  );

  // Attività completate: sezione collassabile
  const attivitaComplete = mostraCompletate
    ? attivitaFiltrate.filter(t => t.completato && !(t.frequenza === 'specifica' && t.dataSpecifica < oggi))
    : [];

  // Attività non completate: suddivise per frequenza
  const attivitaNonComplete = attivitaFiltrate.filter(t => !t.completato);

  /* Contatore globale per lo stagger progressivo tra sezioni */
  let animIdx = 0;

  return (
    <Box>
      {inRitardo.length > 0 && (
        <Box mb={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#EF5350' }}>
              ⚠️ In ritardo
            </Typography>
            <Typography variant="caption" color="text.secondary">{inRitardo.length} attività</Typography>
          </Box>
          {inRitardo.map(task => (
            <TaskCard key={task.id} task={task} onModifica={onModifica} animIndex={animIdx++} />
          ))}
        </Box>
      )}

      {SEZIONI.map(({ frequenza, titolo, colore }) => {
        const tasks = attivitaNonComplete
          .filter(t => t.frequenza === frequenza && !(t.frequenza === 'specifica' && t.dataSpecifica && t.dataSpecifica < oggi))
          .sort((a, b) => (PRIORITA_ORDINE[a.priorita ?? 'media'] ?? 1) - (PRIORITA_ORDINE[b.priorita ?? 'media'] ?? 1));

        if (tasks.length === 0) return null;

        return (
          <Box key={frequenza} mb={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: colore }}>
                {titolo}
                {frequenza === 'giornaliera' && (
                  <Typography component="span" variant="caption" color="text.secondary" fontWeight={400} ml={1}>
                    — {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                  </Typography>
                )}
                {frequenza === 'mensile' && (
                  <Typography component="span" variant="caption" color="text.secondary" fontWeight={400} ml={1}>
                    — {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                  </Typography>
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {tasks.length} {tasks.length === 1 ? 'attività' : 'attività'}
              </Typography>
            </Box>

            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onModifica={onModifica} animIndex={animIdx++} />
            ))}
          </Box>
        );
      })}

      {/* Sezione completate — retraibile */}
      {attivitaComplete.length > 0 && (
        <Box mb={3}>
          <Box
            onClick={() => setCompletateAperte(p => !p)}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, cursor: 'pointer' }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="success.main">
              ✅ Completate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">{attivitaComplete.length}</Typography>
              <IconButton size="small" sx={{ p: 0, color: 'text.secondary' }}>
                {completateAperte ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Box>
          <Collapse in={completateAperte}>
            {attivitaComplete.map((task, i) => (
              <TaskCard key={task.id} task={task} onModifica={onModifica} animIndex={i} />
            ))}
          </Collapse>
        </Box>
      )}

      {attivitaFiltrate.filter(t => !t.completato).length === 0 && attivitaComplete.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography fontSize="2.5rem">✅</Typography>
          <Typography color="text.secondary" mt={1}>Nessuna attività trovata</Typography>
        </Box>
      )}
    </Box>
  );
}

export default TaskList;
