import React, { useState, useEffect } from 'react';
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

function AggiuntaTask({ aperto, onChiudi, attivitaInModifica }) {
  const { aggiungiAttivita, modificaAttivita, eliminaAttivita } = useAttivita();
  const [errori, setErrori] = useState({});
  const [confermaElimina, setConfermaElimina] = useState(false);

  const [form, setForm] = useState({
    titolo: '',
    frequenza: 'giornaliera',
    giornoSettimana: 1,
    giornoMese: 1,
    dataSpecifica: '',
    assegnato: 'entrambi',
  });

  useEffect(() => {
    setConfermaElimina(false);
    if (attivitaInModifica) {
      setForm({
        titolo: attivitaInModifica.titolo,
        frequenza: attivitaInModifica.frequenza,
        giornoSettimana: attivitaInModifica.giornoSettimana ?? 1,
        giornoMese: attivitaInModifica.giornoMese ?? 1,
        dataSpecifica: attivitaInModifica.dataSpecifica ?? '',
        assegnato: attivitaInModifica.assegnato,
      });
    } else {
      setForm({
        titolo: '',
        frequenza: 'giornaliera',
        giornoSettimana: 1,
        giornoMese: 1,
        dataSpecifica: '',
        assegnato: 'entrambi',
      });
    }
  }, [attivitaInModifica, aperto]);

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
  
    const dati = {
      titolo: form.titolo.trim(),
      frequenza: form.frequenza,
      giornoSettimana: form.frequenza === 'settimanale' ? form.giornoSettimana : null,
      giornoMese: form.frequenza === 'mensile' ? form.giornoMese : null,
      dataSpecifica: form.frequenza === 'specifica' ? form.dataSpecifica : null,
      assegnato: form.assegnato,
    };
    
    if (attivitaInModifica) {
      modificaAttivita(attivitaInModifica.id, dati);
    } else {
      aggiungiAttivita(dati);
    }
    
    onChiudi();
  
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
          {attivitaInModifica ? '✏️ Modifica attività' : '✅ Nuova attività'}
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
          {attivitaInModifica ? 'Salva modifiche' : 'Aggiungi attività'}
        </Button>
        {attivitaInModifica && !confermaElimina && (
          <Button
            fullWidth
            variant="text"
            color="error"
            onClick={() => setConfermaElimina(true)}
            sx={{ mt: 1 }}
          >
            Elimina attività
          </Button>
        )}

        {confermaElimina && (
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'error.light', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" fontWeight={700} color="error.contrastText">
              Sei sicuro di voler eliminare questa attività?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setConfermaElimina(false)}
                sx={{ borderColor: 'error.contrastText', color: 'error.contrastText' }}
              >
                Annulla
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={() => { eliminaAttivita(attivitaInModifica.id); onChiudi(); }}
              >
                Elimina
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

export default AggiuntaTask;