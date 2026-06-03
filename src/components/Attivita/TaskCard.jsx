import React, { useRef } from 'react';
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

function TaskCard({ task, onModifica, animIndex = 0 }) {
  const { utenteAttivo, utenti } = useApp();
  const { toggleAttivita } = useAttivita();
  const frequenza = FREQUENZE[task.frequenza] || FREQUENZE.giornaliera;
  const priorita = task.priorita ? PRIORITA[task.priorita] : null;
  const inRitardo = task.frequenza === 'specifica' && task.dataSpecifica && task.dataSpecifica < oggiLocale() && !task.completato;
  const checkboxRef = useRef(null);

  const handleToggle = () => {
    /* Lancia il bounce sull'icona del checkbox */
    const el = checkboxRef.current?.querySelector('svg');
    if (el) {
      el.classList.remove('check-bounce');
      void el.offsetWidth; /* reflow per resettare l'animazione */
      el.classList.add('check-bounce');
    }
    toggleAttivita(task.id, utenteAttivo?.nome);
  };

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5, borderRadius: 3,
        border: '1px solid',
        borderColor: inRitardo ? 'error.light' : task.completato ? 'success.light' : 'divider',
        borderLeft: inRitardo ? '4px solid #EF5350' : priorita && !task.completato ? `4px solid ${priorita.colore}` : undefined,
        opacity: task.completato ? 0.6 : 1,
        transform: task.completato ? 'scale(0.98)' : 'scale(1)',
        /* Solo transform e opacity: GPU-accelerated, 60fps garantiti */
        transition: 'opacity 350ms var(--spring-gentle), transform 380ms var(--spring)',
        '&:hover': { boxShadow: task.completato ? 0 : 2 },
        animationName: 'itemEnter',
        animationDuration: 'var(--dur-md)',
        animationTimingFunction: 'var(--spring-gentle)',
        animationFillMode: 'both',
        animationDelay: `${Math.min(animIndex, 7) * 40}ms`,
        willChange: 'transform, opacity',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          <Checkbox
            ref={checkboxRef}
            checked={task.completato}
            onChange={handleToggle}
            sx={{
              color: frequenza.colore,
              '&.Mui-checked': { color: 'success.main' },
              p: 0.5, flexShrink: 0,
              '& .MuiSvgIcon-root': { transition: 'color 280ms var(--ease-out)' },
            }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Riga principale: avatar + titolo (affianco, non sotto) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {task.assegnato === 'entrambi' ? (
                <Box sx={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                  {utenti.map(u => <AvatarUtente key={u.id} nome={u.nome} utenti={utenti} size={18} />)}
                </Box>
              ) : (
                <AvatarUtente nome={task.assegnato} utenti={utenti} size={20} />
              )}
              <Typography
                fontWeight={600}
                noWrap
                sx={{
                  textDecoration: task.completato ? 'line-through' : 'none',
                  color: task.completato ? 'text.secondary' : 'text.primary',
                  /* font-size non è GPU-accelerated: la omettiamo dalla transition */
                  transition: 'color 300ms var(--ease-out)',
                }}
              >
                {task.titolo}
              </Typography>
              {priorita && task.priorita === 'alta' && !task.completato && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: priorita.colore, flexShrink: 0 }} />
              )}
            </Box>

            {/* Info aggiuntiva: chips solo quando non completata */}
            {!task.completato && (
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
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
                  <Chip label={`fino al ${new Date(task.dataFine + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}`} size="small" sx={{ fontSize: '0.7rem', color: 'text.secondary' }} />
                )}
              </Box>
            )}

            {/* "Fatto da" mini-testo quando completata */}
            {task.completato && task.completatoDa && (
              <Typography variant="caption" color="success.main" fontWeight={600}>
                ✓ {task.completatoDa}
              </Typography>
            )}
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
