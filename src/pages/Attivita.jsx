import React, { useState } from 'react';
import { useFilters } from '../hooks/useFilters';
import {
  Box, Fab, Typography, MenuItem, TextField,
  Collapse, Button, Chip, Switch, FormControlLabel, Snackbar,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { useAttivita } from '../context/AttivitaContext';
import { useApp } from '../context/AppContext';
import { formattaData } from '../utils/helpers';
import TaskList from '../components/Attivita/TaskList';
import AggiuntaTask from '../components/Attivita/AggiuntaTask';
import RiepilogoAttivita from '../components/Attivita/RiepilogoAttivita';

const ORDINAMENTI = [
  { value: 'priorita', label: 'Priorità' },
  { value: 'titolo_asc', label: 'Titolo A→Z' },
  { value: 'titolo_desc', label: 'Titolo Z→A' },
];

const FILTRI_VUOTI = {
  ricerca: '',
  utente: 'tutti',
  frequenza: 'tutte',
  priorita: 'tutte',
  mostraCompletate: true,
  ordinamento: 'priorita',
};

function contaFiltriAttivi(f) {
  return [
    f.ricerca !== '',
    f.utente !== 'tutti',
    f.frequenza !== 'tutte',
    f.priorita !== 'tutte',
    !f.mostraCompletate,
    f.ordinamento !== 'priorita',
  ].filter(Boolean).length;
}

function Attivita() {
  const { attivita, storicoCompletamenti } = useAttivita();
  const { utenti } = useApp();
  const [apriForm, setApriForm] = useState(false);
  const [attivitaInModifica, setAttivitaInModifica] = useState(null);
  const [snackMsg, setSnackMsg] = useState('');
  const [storicoAperto, setStoricoAperto] = useState(false);
  const [filtriAperti, setFiltriAperti] = useState(false);
  const {
    filtriStaged,
    filtriAttivi,
    filtriModificati,
    filtriAttiviCount,
    aggiornaStagedFiltro,
    applicaFiltri,
    azzeraFiltri,
  } = useFilters(FILTRI_VUOTI, contaFiltriAttivi);

  const attivitaElaborate = attivita
    .filter(t => {
      if (filtriAttivi.ricerca && !t.titolo.toLowerCase().includes(filtriAttivi.ricerca.toLowerCase())) return false;
      if (filtriAttivi.frequenza !== 'tutte' && t.frequenza !== filtriAttivi.frequenza) return false;
      if (filtriAttivi.priorita !== 'tutte' && (t.priorita ?? 'media') !== filtriAttivi.priorita) return false;
      if (filtriAttivi.utente !== 'tutti' && t.assegnato !== filtriAttivi.utente && t.assegnato !== 'entrambi') return false;
      return true;
    })
    .sort((a, b) => {
      if (filtriAttivi.ordinamento === 'titolo_asc') return a.titolo.localeCompare(b.titolo);
      if (filtriAttivi.ordinamento === 'titolo_desc') return b.titolo.localeCompare(a.titolo);
      return 0;
    });

  return (
    <Box sx={{ p: 2 }}>


      <RiepilogoAttivita />

      {/* Banner filtri */}
      <Box
        onClick={() => setFiltriAperti(p => !p)}
        sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          p: 1.5, mb: 1.5, borderRadius: 3,
          border: '1px solid', borderColor: filtriAttiviCount > 0 ? 'primary.main' : 'divider',
          cursor: 'pointer',
          bgcolor: filtriAttiviCount > 0 ? 'primary.light' : 'background.paper',
          transition: 'background-color 220ms var(--ease-out), border-color 220ms var(--ease-out)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListRoundedIcon sx={{ fontSize: '1.1rem', color: filtriAttiviCount > 0 ? 'primary.main' : 'text.secondary' }} />
          <Typography variant="body2" fontWeight={600} color={filtriAttiviCount > 0 ? 'primary.main' : 'text.primary'}>
            Filtri e ordinamento
          </Typography>
          {filtriAttiviCount > 0 && (
            <Chip label={`${filtriAttiviCount} attivo${filtriAttiviCount > 1 ? 'i' : ''}`} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
          )}
          {filtriModificati && (
            <Chip label="non applicato" size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem' }} />
          )}
        </Box>
        {filtriAperti
          ? <ExpandLessRoundedIcon sx={{ color: 'text.secondary' }} />
          : <ExpandMoreRoundedIcon sx={{ color: 'text.secondary' }} />
        }
      </Box>

      {/* Pannello filtri */}
      <Collapse in={filtriAperti}>
        <Box sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>

          <TextField
            fullWidth size="small"
            label="Ricerca"
            placeholder="Cerca attività..."
            value={filtriStaged.ricerca}
            onChange={e => aggiornaStagedFiltro('ricerca', e.target.value)}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              select fullWidth size="small"
              value={filtriStaged.utente}
              onChange={e => aggiornaStagedFiltro('utente', e.target.value)}
              label="Utente"
            >
              <MenuItem value="tutti">Tutti</MenuItem>
              {utenti.map(u => <MenuItem key={u.id} value={u.nome}>{u.nome}</MenuItem>)}
            </TextField>

            <TextField
              select fullWidth size="small"
              value={filtriStaged.frequenza}
              onChange={e => aggiornaStagedFiltro('frequenza', e.target.value)}
              label="Frequenza"
            >
              <MenuItem value="tutte">Tutte</MenuItem>
              <MenuItem value="giornaliera">☀️ Giornaliera</MenuItem>
              <MenuItem value="settimanale">📅 Settimanale</MenuItem>
              <MenuItem value="mensile">🗓️ Mensile</MenuItem>
              <MenuItem value="specifica">📌 Data specifica</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              select fullWidth size="small"
              value={filtriStaged.priorita}
              onChange={e => aggiornaStagedFiltro('priorita', e.target.value)}
              label="Priorità"
            >
              <MenuItem value="tutte">Tutte</MenuItem>
              <MenuItem value="alta">🔴 Alta</MenuItem>
              <MenuItem value="media">🟠 Media</MenuItem>
              <MenuItem value="bassa">⚪ Bassa</MenuItem>
            </TextField>

            <TextField
              select fullWidth size="small"
              value={filtriStaged.ordinamento}
              onChange={e => aggiornaStagedFiltro('ordinamento', e.target.value)}
              label="Ordina per"
            >
              {ORDINAMENTI.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={filtriStaged.mostraCompletate}
                onChange={e => aggiornaStagedFiltro('mostraCompletate', e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2">Mostra completate</Typography>}
            sx={{ ml: 0 }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button fullWidth variant="outlined" size="small" onClick={azzeraFiltri} sx={{ borderRadius: 2 }}>
              Azzera
            </Button>
            <Button
              fullWidth variant="contained" size="small"
              onClick={applicaFiltri}
              disabled={!filtriModificati}
              sx={{ borderRadius: 2 }}
            >
              Applica
            </Button>
          </Box>
        </Box>
      </Collapse>

      <TaskList
        attivita={attivitaElaborate}
        onModifica={setAttivitaInModifica}
        mostraCompletate={filtriAttivi.mostraCompletate}
      />

      {storicoCompletamenti.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box
            onClick={() => setStoricoAperto(p => !p)}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', mb: 1 }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
              📋 Storico completamenti
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">{storicoCompletamenti.length}</Typography>
              {storicoAperto ? <ExpandLessRoundedIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} /> : <ExpandMoreRoundedIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />}
            </Box>
          </Box>
          <Collapse in={storicoAperto}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {[...storicoCompletamenti].reverse().slice(0, 20).map(s => (
                <Box key={s.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{s.taskTitolo}</Typography>
                    <Typography variant="caption" color="text.secondary">👤 {s.completatoDa}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{formattaData(s.data)}</Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      )}

      <Fab
        color="primary"
        onClick={() => setApriForm(true)}
        sx={{
          position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', right: 24, boxShadow: 4,
          animationName: 'fabPop',
          animationDuration: 'var(--dur-lg)',
          animationTimingFunction: 'var(--spring)',
          animationFillMode: 'both',
          animationDelay: '120ms',
          willChange: 'transform, opacity',
        }}
      >
        <AddRoundedIcon />
      </Fab>

      <AggiuntaTask
        aperto={apriForm || !!attivitaInModifica}
        onChiudi={() => { setApriForm(false); setAttivitaInModifica(null); }}
        attivitaInModifica={attivitaInModifica}
        onSuccess={msg => setSnackMsg(msg)}
      />

      <Snackbar
        open={!!snackMsg}
        onClose={() => setSnackMsg('')}
        message={snackMsg}
        autoHideDuration={2500}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: 'calc(90px + env(safe-area-inset-bottom))' }}
      />
    </Box>
  );
}

export default Attivita;
