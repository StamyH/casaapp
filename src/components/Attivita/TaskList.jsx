import React from 'react';
import { Box, Typography } from '@mui/material';
import TaskCard from './TaskCard';
import { oggiLocale } from '../../utils/helpers';

const SEZIONI = [
  { frequenza: 'giornaliera', titolo: '☀️ Oggi', colore: '#FF7043' },
  { frequenza: 'settimanale', titolo: '📅 Questa settimana', colore: '#5C6BC0' },
  { frequenza: 'mensile', titolo: '🗓️ Questo mese', colore: '#26A69A' },
  { frequenza: 'specifica', titolo: '📌 Data specifica', colore: '#AB47BC' },
];

const PRIORITA_ORDINE = { alta: 0, media: 1, bassa: 2 };

function TaskList({ attivita, filtroUtente, onModifica, mostraCompletate }) {
  const oggi = oggiLocale();

  const attivitaFiltrate = (filtroUtente === 'tutti'
    ? attivita
    : attivita.filter(t => t.assegnato === filtroUtente || t.assegnato === 'entrambi')
  ).filter(t => {
    if (!mostraCompletate && t.completato) return false;
    if (t.dataFine && t.frequenza !== 'specifica' && t.dataFine < oggi) return false;
    return true;
  });

  const inRitardo = attivitaFiltrate.filter(
    t => t.frequenza === 'specifica' && t.dataSpecifica && t.dataSpecifica < oggi && !t.completato
  );

  return (
    <Box>
      {inRitardo.length > 0 && (
        <Box mb={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#EF5350' }}>
              ⚠️ In ritardo
            </Typography>
            <Typography variant="caption" color="text.secondary">{inRitardo.length} {inRitardo.length === 1 ? 'attività' : 'attività'}</Typography>
          </Box>
          {inRitardo.map(task => (
            <TaskCard key={task.id} task={task} onModifica={onModifica} />
          ))}
        </Box>
      )}

      {SEZIONI.map(({ frequenza, titolo, colore }) => {
        const tasks = attivitaFiltrate
          .filter(t => t.frequenza === frequenza && !(t.frequenza === 'specifica' && t.dataSpecifica && t.dataSpecifica < oggi && !t.completato))
          .sort((a, b) => (PRIORITA_ORDINE[a.priorita ?? 'media'] ?? 1) - (PRIORITA_ORDINE[b.priorita ?? 'media'] ?? 1));

        if (tasks.length === 0) return null;

        const completati = tasks.filter(t => t.completato).length;

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
                {completati}/{tasks.length} completati
              </Typography>
            </Box>

            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onModifica={onModifica} />
            ))}
          </Box>
        );
      })}

      {attivitaFiltrate.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography fontSize="2.5rem">✅</Typography>
          <Typography color="text.secondary" mt={1}>Nessuna attività trovata</Typography>
        </Box>
      )}
    </Box>
  );
}

export default TaskList;
