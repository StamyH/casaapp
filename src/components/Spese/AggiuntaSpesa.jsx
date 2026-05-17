import React, { useState } from 'react';
import {
  Drawer, Box, Typography, TextField, Button,
  MenuItem, ToggleButton, ToggleButtonGroup,
  Slider, Divider, IconButton
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useApp } from '../../context/AppContext';
import { formattaImporto, calcolaQuote } from '../../utils/helpers';

const DIVISIONI = [
  { value: 'metà', label: '50/50' },
  { value: 'tutto_mio', label: 'Tutto mio' },
  { value: 'tutto_altro', label: 'Tutto suo' },
  { value: 'percentuale', label: 'Custom %' },
];

function AggiuntaSpesa({ aperto, onChiudi }) {
  const { aggiungiSpesa, utente, impostazioni } = useApp();

  const [form, setForm] = useState({
    descrizione: '',
    importo: '',
    categoria: 'spesa',
    divisione: 'metà',
    percentuale: 50,
  });

  const [errori, setErrori] = useState({});
  const altroUtente = utente === 'Riccardo' ? 'Federico' : 'Riccardo';

  const aggiorna = (campo, valore) => {
    setForm(prev => ({ ...prev, [campo]: valore }));
  };

  const quote = form.importo
    ? calcolaQuote(parseFloat(form.importo), utente, form.divisione, form.percentuale)
    : null;

  const handleSubmit = () => {
    const nuoviErrori = {};
    
    if (!form.descrizione.trim()) {
      nuoviErrori.descrizione = 'Inserisci una descrizione';
    }
    
    const importoNum = parseFloat(form.importo);
    if (!form.importo || isNaN(importoNum) || importoNum <= 0) {
      nuoviErrori.importo = 'Inserisci un importo valido maggiore di 0';
    }
    
    if (Object.keys(nuoviErrori).length > 0) {
      setErrori(nuoviErrori);
      return;
    }
    
    setErrori({});
    
    aggiungiSpesa({
      descrizione: form.descrizione.trim(),
      importo: importoNum,
      categoria: form.categoria,
      pagatore: utente,
      divisione: form.divisione,
      percentuale: form.percentuale,
      data: new Date().toISOString().split('T')[0],
    });
    
    setForm({
      descrizione: '',
      importo: '',
      categoria: 'spesa',
      divisione: 'metà',
      percentuale: 50,
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
            💸 Nuova spesa
          </Typography>
          <IconButton onClick={onChiudi} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {/* Descrizione */}
        <TextField
          label="Descrizione"
          fullWidth
          value={form.descrizione}
          onChange={e => { aggiorna('descrizione', e.target.value); setErrori(p => ({ ...p, descrizione: '' })); }}
          sx={{ mb: 2 }}
          placeholder="es. Spesa supermercato"
          error={!!errori.descrizione}
          helperText={errori.descrizione}
        />

        {/* Importo */}
        <TextField
          label="Importo (€)"
          fullWidth
          type="number"
          value={form.importo}
          onChange={e => { aggiorna('importo', e.target.value); setErrori(p => ({ ...p, importo: '' })); 
        }}
          sx={{ mb: 2 }}
          placeholder="0.00"
          inputProps={{ min: 0.01, step: 0.01 }}
          error={!!errori.importo}
          helperText={errori.importo}
        />

        {/* Categoria */}
        <TextField
          label="Categoria"
          fullWidth
          select
          value={form.categoria}
          onChange={e => aggiorna('categoria', e.target.value)}
          sx={{ mb: 3 }}
        >
          {impostazioni.categorie.map(cat => (
            <MenuItem key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </MenuItem>
          ))}
        </TextField>

        <Divider sx={{ mb: 3 }} />

        {/* Divisione */}
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Come dividere?
        </Typography>
        <ToggleButtonGroup
          value={form.divisione}
          exclusive
          onChange={(e, val) => val && aggiorna('divisione', val)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {DIVISIONI.map(d => (
            <ToggleButton
              key={d.value}
              value={d.value}
              sx={{ fontSize: '0.75rem', py: 1 }}
            >
              {d.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Slider percentuale — visibile solo se divisione = percentuale */}
        {form.divisione === 'percentuale' && (
          <Box sx={{ px: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption">La mia quota: {form.percentuale}%</Typography>
              <Typography variant="caption">Sua quota: {100 - form.percentuale}%</Typography>
            </Box>
            <Slider
              value={form.percentuale}
              onChange={(e, val) => aggiorna('percentuale', val)}
              min={0}
              max={100}
              step={5}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={v => `${v}%`}
            />
          </Box>
        )}

        {/* Anteprima quote */}
        {quote && (
          <Box sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
            mb: 3,
          }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Anteprima divisione
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                {utente}: <strong>{formattaImporto(quote[utente] || 0)}</strong>
              </Typography>
              <Typography variant="body2">
                {altroUtente}: <strong>{formattaImporto(quote[altroUtente] || 0)}</strong>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Bottone salva */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
        >
          Aggiungi spesa
        </Button>
      </Box>
    </Drawer>
  );
}

export default AggiuntaSpesa;