import React from 'react';
import { Box, Typography } from '@mui/material';
import TaskCard from './TaskCard';

const SEZIONI = [
  { frequenza: 'giornaliera', titolo: '☀️ Oggi', colore: '#FF7043' },
  { frequenza: 'settimanale', titolo: '📅 Questa settimana', colore: '#5C6BC0' },
  { frequenza: 'mensile', titolo: '🗓️ Questo mese', colore: '#26A69A' },
];

function TaskList({ attivita, filtroUtente, onModifica, mostraCompletate }) {
  const attivitaFiltrate = (filtroUtente === 'tutti'
    ? attivita
    : attivita.filter(t => t.assegnato === filtroUtente || t.assegnato === 'entrambi')
  ).filter(t => mostraCompletate || !t.completato);

  return (
    <Box>
      {SEZIONI.map(({ frequenza, titolo, colore }) => {
        const taskDiQuestaFrequenza = attivitaFiltrate.filter(
          t => t.frequenza === frequenza
        );

        // Non mostrare la sezione se non ci sono task
        if (taskDiQuestaFrequenza.length === 0) return null;

        const completati = taskDiQuestaFrequenza.filter(t => t.completato).length;
        const totale = taskDiQuestaFrequenza.length;

        return (
          <Box key={frequenza} mb={3}>
            {/* Intestazione sezione */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: colore }}
              >
                {titolo}{frequenza === 'giornaliera' && (
                  <Typography component="span" variant="caption" color="text.secondary" fontWeight={400} ml={1}>
                    — {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                  </Typography>
                )}{frequenza === 'mensile' && (
                  <Typography component="span" variant="caption" color="text.secondary" fontWeight={400} ml={1}>
                    — {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                  </Typography>
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {completati}/{totale} completati
              </Typography>
            </Box>

            {/* Task */}
            {taskDiQuestaFrequenza.map(task => (
              <TaskCard key={task.id} task={task} onModifica={onModifica} />
            ))}
          </Box>
        );
      })}

      {/* Messaggio se non ci sono task */}
      {attivitaFiltrate.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography fontSize="2.5rem">✅</Typography>
          <Typography color="text.secondary" mt={1}>
            Nessuna attività assegnata
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default TaskList;