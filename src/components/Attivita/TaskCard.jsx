import React from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton, Checkbox } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useApp } from '../../context/AppContext';
import { useAttivita } from '../../context/AttivitaContext';
import { oggiLocale } from '../../utils/helpers';

const FREQUENZE = {
  giornaliera: { icona: '☀️', colore: '#FF7043' },
  settimanale: { icona: '📅', colore: '#5C6BC0' },
  mensile: { icona: '🗓️', colore: '#26A69A' },
  specifica: { icona: '📌', colore: '#AB47BC' },
};

const PRIORITA = {
  alta: { colore: '#EF5350', label: 'Alta' },
  media: { colore: '#FFA726', label: 'Media' },
  bassa: { colore: '#90A4AE', label: 'Bassa' },
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
  const priorita = task.priorita ? PRIORITA[task.priorita] : null;
  const inRitardo = task.frequenza === 'specifica' && task.dataSpecifica && task.dataSpecifica < oggiLocale() && !task.completato;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5, borderRadius: 3,
        border: '1px solid',
        borderColor: inRitardo ? 'error.light' : task.completato ? 'success.light' : 'divider',
        borderLeft: inRitardo ? '4px solid #EF5350' : priorita && !task.completato ? `4px solid ${priorita.colore}` : undefined,
        opacity: task.completato ? 0.75 : 1,
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: 2 },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          <Checkbox
            checked={task.completato}
            onChange={() => toggleAttivita(task.id, utenteAttivo?.nome)}
            sx={{ color: frequenza.colore, '&.Mui-checked': { color: 'success.main' }, p: 0.5 }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                fontWeight={600}
                sx={{
                  textDecoration: task.completato ? 'line-through' : 'none',
                  color: task.completato ? 'text.secondary' : 'text.primary',
                }}
              >
                {task.titolo}
              </Typography>
              {priorita && task.priorita === 'alta' && !task.completato && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: priorita.colore, flexShrink: 0 }} />
              )}
            </Box>

            {task.completato && task.completatoDa && (
              <Typography variant="caption" color="success.main" fontWeight={600}>
                ✓ Fatto da {task.completatoDa}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {task.assegnato === 'entrambi' ? (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {utenti.map(u => <AvatarUtente key={u.id} nome={u.nome} utenti={utenti} />)}
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
                <Chip
                  label={new Date(task.dataSpecifica + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  size="small"
                  sx={{ fontSize: '0.7rem', ...(inRitardo && { bgcolor: 'error.light', color: 'error.contrastText' }) }}
                />
              )}
              {inRitardo && (
                <Chip label="⚠️ In ritardo" size="small" color="error" sx={{ fontSize: '0.7rem' }} />
              )}
              {task.dataFine && (
                <Chip label={`fino al ${new Date(task.dataFine).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}`} size="small" sx={{ fontSize: '0.7rem', color: 'text.secondary' }} />
              )}
            </Box>
          </Box>

          <IconButton size="small" onClick={() => onModifica(task)} sx={{ color: 'primary.main', flexShrink: 0 }}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>

        </Box>
      </CardContent>
    </Card>
  );
}

export default TaskCard;
