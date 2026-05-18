import React from 'react';
import {
  Card, CardContent, Box, Typography,
  Chip, IconButton, Checkbox
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useApp } from '../../context/AppContext';
import { useAttivita } from '../../context/AttivitaContext';

const FREQUENZE = {
  giornaliera: { icona: '☀️', colore: '#FF7043' },
  settimanale: { icona: '📅', colore: '#5C6BC0' },
  mensile: { icona: '🗓️', colore: '#26A69A' },
};

function AvatarUtente({ nome, utenti, size = 22 }) {
  const utente = utenti.find(u => u.nome === nome);
  const colore = utente?.coloreAvatar || '#90A4AE';
  return (
    <Box sx={{
      width: size, height: size, borderRadius: '50%',
      bgcolor: colore,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: 'white', flexShrink: 0,
    }}>
      {nome[0]}
    </Box>
  );
}

function TaskCard({ task, onModifica }) {
  const { utenteAttivo, utenti } = useApp();
  const { toggleAttivita } = useAttivita();
  const frequenza = FREQUENZE[task.frequenza] || FREQUENZE.giornaliera;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5, borderRadius: 3,
        border: '1px solid',
        borderColor: task.completato ? 'success.light' : 'divider',
        opacity: task.completato ? 0.75 : 1,
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: 2 }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          <Checkbox
            checked={task.completato}
            onChange={() => toggleAttivita(task.id, utenteAttivo?.nome)}
            sx={{
              color: frequenza.colore,
              '&.Mui-checked': { color: 'success.main' },
              p: 0.5,
            }}
          />

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
            {task.completato && task.completatoDa && (
              <Typography variant="caption" color="success.main" fontWeight={600}>
                ✓ Fatto da {task.completatoDa}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {task.assegnato === 'entrambi' ? (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {utenti.map(u => (
                    <AvatarUtente key={u.id} nome={u.nome} utenti={utenti} />
                  ))}
                </Box>
              ) : (
                <AvatarUtente nome={task.assegnato} utenti={utenti} />
              )}

              {task.frequenza === 'settimanale' && task.giornoSettimana !== null && (
                <Chip label={`ogni ${['Dom','Lun','Mar','Mer','Gio','Ven','Sab'][task.giornoSettimana]}`} size="small" sx={{ fontSize: '0.7rem' }} />
              )}
              {task.frequenza === 'mensile' && task.giornoMese && (
                <Chip label={`ogni ${task.giornoMese}° del mese`} size="small" sx={{ fontSize: '0.7rem' }} />
              )}
              {task.frequenza === 'specifica' && task.dataSpecifica && (
                <Chip label={new Date(task.dataSpecifica).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })} size="small" sx={{ fontSize: '0.7rem' }} />
              )}
            </Box>
          </Box>

          {(task.assegnato === utenteAttivo?.nome || task.assegnato === 'entrambi') && (
            <IconButton
              size="small"
              onClick={() => onModifica(task)}
              sx={{ color: 'primary.main', flexShrink: 0 }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          )}

        </Box>
      </CardContent>
    </Card>
  );
}

export default TaskCard;
