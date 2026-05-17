import React, { useState } from 'react';
import {
  Drawer, Box, Typography, TextField, Button,
  ToggleButton, ToggleButtonGroup, IconButton
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useAttivita } from '../../context/AttivitaContext';

const FREQUENZE = [
  { value: 'giornaliera', label: '☀️ Giornaliera' },
  { value: 'settimanale', label: '📅 Settimanale' },
  { value: 'mensile', label: '🗓️ Mensile' },
  { value: 'specifica', label: '📌 Data specifica' },
];

const ASSEGNAZIONI = [
  { value: 'Riccardo', label: '👤 Riccardo' },
  { value: 'Federico', label: '👤 Federico' },
  { value: 'entrambi', label: '👥 Entrambi' },
];

const GIORNI_SETTIMANA = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Gio' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sab' },
  { value: 0, label: 'Dom' },
];

function AggiuntaTask({ aperto, onChiudi }) {
  const { aggiungiAttivita } = useAttivita();
  const [errori, setErrori] = useState({});

  const [form, setForm] = useState({
    titolo: '',
    frequenza: 'giornaliera',
    giornoSettimana: 1,
    giornoMese: 1,
    dataSpecifica: '',
    assegnato: 'entrambi',
  });

  const aggiorna = (campo, valore) => {
    setForm(prev => ({ ...prev, [campo]: valore }));
  };

  const handleSubmit = () => {
    const nuoviErrori = {};
  
    if (!form.titolo.trim()) {
      nuoviErrori.titolo = 'Inserisci un titolo per l\'attività';
    }
  
    if (form.frequenza === 'specifica') {
      if (!form.dataSpecifica) {
        nuoviErrori.dataSpecifica = 'Seleziona una data';
      } else if (form.dataSpecifica < new Date().toISOString().split('T')[0]) {
        nuoviErrori.dataSpecifica = 'La data non può essere nel passato';
      }
    }
  
    if (Object.keys(nuoviErrori).length > 0) {
      setErrori(nuoviErrori);
      return;
    }
  
    setErrori({});
  
    aggiungiAttivita({
      titolo: form.titolo.trim(),
      frequenza: form.frequenza,
      giornoSettimana: form.frequenza === 'settimanale' ? form.giornoSettimana : null,
      giornoMese: form.frequenza === 'mensile' ? form.giornoMese : null,
      dataSpecifica: form.frequenza === 'specifica' ? form.dataSpecifica : null,
      assegnato: form.assegnato,
    });
  
    setForm({
      titolo: '',
      frequenza: 'giornaliera',
      giornoSettimana: 1,
      giornoMese: 1,
      dataSpecifica: '',
      assegnato: 'entrambi',
    });
  
    onChiudi();
  };

  return (
    <Drawer
      anchor="bottom"
      open={aperto}
      onClose={onChiudi}
      PaperProps={{
        sx: { borderRadius: '24px 24px 0 0', maxHeight: '90vh' }
      }}
    >
      <Box sx={{ p: 3, overflowY: 'auto' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            ✅ Nuova attività
          </Typography>
          <IconButton onClick={onChiudi} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {/* Titolo */}
        <TextField
          label="Titolo attività"
          fullWidth
          value={form.titolo}
          onChange={e => { aggiorna('titolo', e.target.value); setErrori(p => ({ ...p, titolo: '' })); }}
          sx={{ mb: 3 }}
          placeholder="es. Portare la spazzatura"
          error={!!errori.titolo}
          helperText={errori.titolo}
        />

        {/* Frequenza */}
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Frequenza
        </Typography>
        <ToggleButtonGroup
          value={form.frequenza}
          exclusive
          onChange={(e, val) => val && aggiorna('frequenza', val)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {FREQUENZE.map(f => (
            <ToggleButton
              key={f.value}
              value={f.value}
              sx={{ fontSize: '0.7rem', py: 1 }}
            >
              {f.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Giorno della settimana — solo se settimanale */}
        {form.frequenza === 'settimanale' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" mb={1} display="block">
              Quale giorno?
            </Typography>
            <ToggleButtonGroup
              value={form.giornoSettimana}
              exclusive
              onChange={(e, val) => val !== null && aggiorna('giornoSettimana', val)}
              fullWidth
            >
              {GIORNI_SETTIMANA.map(g => (
                <ToggleButton
                  key={g.value}
                  value={g.value}
                  sx={{ fontSize: '0.65rem', py: 0.8, minWidth: 0 }}
                >
                  {g.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Giorno del mese — solo se mensile */}
        {form.frequenza === 'mensile' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" mb={1} display="block">
              Quale giorno del mese?
            </Typography>
            <TextField
              type="number"
              fullWidth
              size="small"
              value={form.giornoMese}
              onChange={e => {
                const val = Math.min(31, Math.max(1, parseInt(e.target.value) || 1));
                aggiorna('giornoMese', val);
              }}
              inputProps={{ min: 1, max: 31 }}
            />
          </Box>
        )}

        {/* Data specifica — solo se specifica */}
        {form.frequenza === 'specifica' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" mb={1} display="block">
              Seleziona la data
            </Typography>
            <TextField
              type="date"
              fullWidth
              size="small"
              value={form.dataSpecifica}
              onChange={e => { aggiorna('dataSpecifica', e.target.value); setErrori(p => ({ ...p, dataSpecifica: '' })); }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              error={!!errori.dataSpecifica}
              helperText={errori.dataSpecifica}
            />
          </Box>
        )}

        {/* Assegnazione */}
        <Typography variant="subtitle2" fontWeight={600} mb={1} mt={2}>
          Assegna a
        </Typography>
        <ToggleButtonGroup
          value={form.assegnato}
          exclusive
          onChange={(e, val) => val && aggiorna('assegnato', val)}
          fullWidth
          sx={{ mb: 3 }}
        >
          {ASSEGNAZIONI.map(a => (
            <ToggleButton
              key={a.value}
              value={a.value}
              sx={{ fontSize: '0.75rem', py: 1 }}
            >
              {a.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Bottone salva */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
        >
          Aggiungi attività
        </Button>
      </Box>
    </Drawer>
  );
}

export default AggiuntaTask;