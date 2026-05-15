import React from 'react';
import {
  Card, CardContent, Box, Typography,
  Chip, IconButton, Checkbox
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useApp } from '../../context/AppContext';

// Colori e icone per ogni frequenza
const FREQUENZE = {
  giornaliera: { icona: '☀️', colore: '#FF7043', label: 'Oggi' },
  settimanale: { icona: '📅', colore: '#5C6BC0', label: 'Questa settimana' },
  mensile: { icona: '🗓️', colore: '#26A69A', label: 'Questo mese' },
};

function TaskCard({ task }) {
  const { toggleAttivita, eliminaAttivita, utente } = useApp();
  const frequenza = FREQUENZE[task.frequenza] || FREQUENZE.giornaliera;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: task.completato ? 'success.light' : 'divider',
        bgcolor: task.completato ? 'success.50' : 'white',
        opacity: task.completato ? 0.75 : 1,
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: 2 }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          {/* Checkbox completamento */}
          <Checkbox
            checked={task.completato}
            onChange={() => toggleAttivita(task.id)}
            sx={{
              color: frequenza.colore,
              '&.Mui-checked': { color: 'success.main' },
              p: 0.5,
            }}
          />

          {/* Contenuto */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              fontWeight={600}
              sx={{
                textDecoration: task.completato ? 'line-through' : 'none',
                color: task.completato ? 'text.secondary' : 'text.primary',
              }}
            >
              {task.titolo}
            </Typography>
            </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            <Chip
                label={task.assegnato === 'entrambi' ? '👥 Entrambi' : `👤 ${task.assegnato}`}
            size="small"
            sx={{
                bgcolor: `${frequenza.colore}15`,
                color: frequenza.colore,
                fontWeight: 600,
                fontSize: '0.7rem',
            }}
            />
            {task.frequenza === 'settimanale' && task.giornoSettimana !== null && (
                <Chip
                    label={`ogni ${['Dom','Lun','Mar','Mer','Gio','Ven','Sab'][task.giornoSettimana]}`}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                />
            )}
            {task.frequenza === 'mensile' && task.giornoMese && (
                <Chip
                    label={`ogni ${task.giornoMese}° del mese`}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                />
            )}
            {task.frequenza === 'specifica' && task.dataSpecifica && (
                <Chip
                    label={new Date(task.dataSpecifica).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                />
            )}
          </Box>

          {/* Bottone elimina — visibile solo all'utente assegnato o se è entrambi */}
          {(task.assegnato === utente || task.assegnato === 'entrambi') && (
            <IconButton
              size="small"
              onClick={() => eliminaAttivita(task.id)}
              sx={{ color: 'error.light', flexShrink: 0 }}
            >
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          )}

        </Box>
      </CardContent>
    </Card>
  );
}

export default TaskCard;