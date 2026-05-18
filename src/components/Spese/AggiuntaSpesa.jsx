import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, TextField, Button,
  MenuItem, ToggleButton, ToggleButtonGroup,
  Slider, Divider, IconButton
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useApp } from '../../context/AppContext';
import { useSpese } from '../../context/SpeseContext';
import { useImpostazioni } from '../../context/ImpostazioniContext';
import { formattaImporto, calcolaQuote } from '../../utils/helpers';

const DIVISIONI = [
  { value: 'metà', label: '50/50' },
  { value: 'tutto_mio', label: 'Tutto mio' },
  { value: 'tutto_altro', label: 'Tutto suo' },
  { value: 'percentuale', label: 'Custom %' },
];

function AggiuntaSpesa({ aperto, onChiudi, spesaInModifica }) {
  const { utenteAttivo, utenti } = useApp();
  const { aggiungiSpesa, modificaSpesa, eliminaSpesa } = useSpese();
  const { impostazioni } = useImpostazioni();

  const altriUtenti = utenti.filter(u => u.id !== utenteAttivo?.id);

  const [form, setForm] = useState({
    descrizione: '',
    importo: '',
    categoria: impostazioni.categorie[0]?.nome || 'altro',
    divisione: 'metà',
    percentuale: 50,
    altroUtenteNome: altriUtenti[0]?.nome || '',
  });

  const [errori, setErrori] = useState({});
  const [confermaElimina, setConfermaElimina] = useState(false);

  useEffect(() => {
    setConfermaElimina(false);
    if (spesaInModifica) {
      setForm({
        descrizione: spesaInModifica.descrizione,
        importo: String(spesaInModifica.importo),
        categoria: spesaInModifica.categoria,
        divisione: spesaInModifica.divisione,
        percentuale: spesaInModifica.percentuale,
        altroUtenteNome: spesaInModifica.altroUtente || altriUtenti[0]?.nome || '',
      });
    } else {
      setForm({
        descrizione: '',
        importo: '',
        categoria: impostazioni.categorie[0]?.nome || 'altro',
        divisione: 'metà',
        percentuale: 50,
        altroUtenteNome: altriUtenti[0]?.nome || '',
      });
    }
  }, [spesaInModifica, aperto, impostazioni.categorie]); // eslint-disable-line react-hooks/exhaustive-deps

  const aggiorna = (campo, valore) => {
    setForm(prev => ({ ...prev, [campo]: valore }));
  };

  const quote = form.importo && form.altroUtenteNome
    ? calcolaQuote(parseFloat(form.importo), utenteAttivo?.nome, form.altroUtenteNome, form.divisione, form.percentuale)
    : null;

  const handleSubmit = () => {
    const nuoviErrori = {};

    if (!form.descrizione.trim()) nuoviErrori.descrizione = 'Inserisci una descrizione';

    const importoNum = parseFloat(form.importo);
    if (!form.importo || isNaN(importoNum) || importoNum <= 0) {
      nuoviErrori.importo = 'Inserisci un importo valido maggiore di 0';
    }

    if (Object.keys(nuoviErrori).length > 0) {
      setErrori(nuoviErrori);
      return;
    }

    setErrori({});

    if (spesaInModifica) {
      modificaSpesa(spesaInModifica.id, {
        descrizione: form.descrizione.trim(),
        importo: importoNum,
        categoria: form.categoria,
        divisione: form.divisione,
        percentuale: form.percentuale,
        altroUtente: form.altroUtenteNome,
      });
    } else {
      aggiungiSpesa({
        descrizione: form.descrizione.trim(),
        importo: importoNum,
        categoria: form.categoria,
        pagatore: utenteAttivo?.nome,
        altroUtente: form.altroUtenteNome,
        divisione: form.divisione,
        percentuale: form.percentuale,
        data: new Date().toISOString().split('T')[0],
      });
    }

    onChiudi();
  };

  return (
    <Drawer
      anchor="bottom"
      open={aperto}
      onClose={onChiudi}
      PaperProps={{ sx: { borderRadius: '24px 24px 0 0', maxHeight: '90vh' } }}
    >
      <Box sx={{ p: 3, overflowY: 'auto' }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            {spesaInModifica ? '✏️ Modifica spesa' : '💸 Nuova spesa'}
          </Typography>
          <IconButton onClick={onChiudi} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

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

        <TextField
          label="Importo (€)"
          fullWidth
          type="number"
          value={form.importo}
          onChange={e => { aggiorna('importo', e.target.value); setErrori(p => ({ ...p, importo: '' })); }}
          sx={{ mb: 2 }}
          placeholder="0.00"
          inputProps={{ min: 0.01, step: 0.01 }}
          error={!!errori.importo}
          helperText={errori.importo}
        />

        <TextField
          label="Categoria"
          fullWidth
          select
          value={form.categoria}
          onChange={e => aggiorna('categoria', e.target.value)}
          sx={{ mb: 2 }}
        >
          {impostazioni.categorie.map(cat => (
            <MenuItem key={cat.nome} value={cat.nome}>
              {cat.icona} {cat.nome.charAt(0).toUpperCase() + cat.nome.slice(1)}
            </MenuItem>
          ))}
        </TextField>

        {altriUtenti.length > 1 && (
          <TextField
            label="Dividi con"
            fullWidth
            select
            value={form.altroUtenteNome}
            onChange={e => aggiorna('altroUtenteNome', e.target.value)}
            sx={{ mb: 2 }}
          >
            {altriUtenti.map(u => (
              <MenuItem key={u.id} value={u.nome}>{u.nome}</MenuItem>
            ))}
          </TextField>
        )}

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle2" fontWeight={600} mb={1}>Come dividere?</Typography>
        <ToggleButtonGroup
          value={form.divisione}
          exclusive
          onChange={(e, val) => val && aggiorna('divisione', val)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {DIVISIONI.map(d => (
            <ToggleButton key={d.value} value={d.value} sx={{ fontSize: '0.75rem', py: 1 }}>
              {d.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {form.divisione === 'percentuale' && (
          <Box sx={{ px: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption">La mia quota: {form.percentuale}%</Typography>
              <Typography variant="caption">Sua quota: {100 - form.percentuale}%</Typography>
            </Box>
            <Slider
              value={form.percentuale}
              onChange={(e, val) => aggiorna('percentuale', val)}
              min={0} max={100} step={5} marks
              valueLabelDisplay="auto"
              valueLabelFormat={v => `${v}%`}
            />
          </Box>
        )}

        {quote && (
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', mb: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Anteprima divisione
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                {utenteAttivo?.nome}: <strong>{formattaImporto(quote[utenteAttivo?.nome] || 0)}</strong>
              </Typography>
              <Typography variant="body2">
                {form.altroUtenteNome}: <strong>{formattaImporto(quote[form.altroUtenteNome] || 0)}</strong>
              </Typography>
            </Box>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
        >
          {spesaInModifica ? 'Salva modifiche' : 'Aggiungi spesa'}
        </Button>

        {spesaInModifica && !confermaElimina && (
          <Button fullWidth variant="text" color="error" onClick={() => setConfermaElimina(true)} sx={{ mt: 1 }}>
            Elimina spesa
          </Button>
        )}

        {confermaElimina && (
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'error.light', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" fontWeight={700} color="error.contrastText">
              Sei sicuro di voler eliminare questa spesa?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button fullWidth variant="outlined" onClick={() => setConfermaElimina(false)} sx={{ borderColor: 'error.contrastText', color: 'error.contrastText' }}>
                Annulla
              </Button>
              <Button fullWidth variant="contained" color="error" onClick={() => { eliminaSpesa(spesaInModifica.id); onChiudi(); }}>
                Elimina
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

export default AggiuntaSpesa;
