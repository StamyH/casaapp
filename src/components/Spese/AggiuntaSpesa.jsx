import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, TextField, Button,
  MenuItem, ToggleButton, ToggleButtonGroup,
  Slider, Divider, IconButton, Switch, FormControlLabel,
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

  const formIniziale = () => ({
    descrizione: '',
    importo: '',
    categoria: impostazioni.categorie[0]?.nome || 'altro',
    divisione: 'metà',
    percentuale: 50,
    pagatore: utenteAttivo?.nome || '',
    altroUtenteNome: utenti.find(u => u.nome !== utenteAttivo?.nome)?.nome || '',
    ricorrente: false,
  });

  const [form, setForm] = useState(formIniziale);
  const [errori, setErrori] = useState({});
  const [confermaElimina, setConfermaElimina] = useState(false);

  useEffect(() => {
    setConfermaElimina(false);
    setErrori({});
    if (spesaInModifica) {
      setForm({
        descrizione: spesaInModifica.descrizione,
        importo: String(spesaInModifica.importo),
        categoria: spesaInModifica.categoria,
        divisione: spesaInModifica.divisione,
        percentuale: spesaInModifica.percentuale,
        pagatore: spesaInModifica.pagatore,
        altroUtenteNome: spesaInModifica.altroUtente || utenti.find(u => u.nome !== spesaInModifica.pagatore)?.nome || '',
        ricorrente: spesaInModifica.ricorrente || false,
      });
    } else {
      setForm(formIniziale());
    }
  }, [spesaInModifica, aperto]); // eslint-disable-line react-hooks/exhaustive-deps

  const aggiorna = (campo, valore) => {
    setForm(prev => ({ ...prev, [campo]: valore }));
  };

  const aggiornaPagatore = (nuovoPagatore) => {
    const altriRispettoAlNuovo = utenti.filter(u => u.nome !== nuovoPagatore);
    setForm(prev => ({
      ...prev,
      pagatore: nuovoPagatore,
      altroUtenteNome: altriRispettoAlNuovo[0]?.nome || '',
    }));
  };

  const altriUtenti = utenti.filter(u => u.nome !== form.pagatore);

  const quote = form.importo && form.altroUtenteNome
    ? calcolaQuote(parseFloat(form.importo), form.pagatore, form.altroUtenteNome, form.divisione, form.percentuale)
    : null;

  const handleSubmit = () => {
    const nuoviErrori = {};
    if (!form.descrizione.trim()) nuoviErrori.descrizione = 'Inserisci una descrizione';
    const importoNum = parseFloat(form.importo);
    if (!form.importo || isNaN(importoNum) || importoNum <= 0) {
      nuoviErrori.importo = 'Inserisci un importo valido maggiore di 0';
    }
    if (Object.keys(nuoviErrori).length > 0) { setErrori(nuoviErrori); return; }
    setErrori({});

    const dati = {
      descrizione: form.descrizione.trim(),
      importo: importoNum,
      categoria: form.categoria,
      divisione: form.divisione,
      percentuale: form.percentuale,
      pagatore: form.pagatore,
      altroUtente: form.altroUtenteNome,
      ricorrente: form.ricorrente,
    };

    if (spesaInModifica) {
      modificaSpesa(spesaInModifica.id, dati);
    } else {
      aggiungiSpesa({ ...dati, data: new Date().toISOString().split('T')[0] });
    }

    onChiudi();
  };

  return (
    <Drawer
      anchor="bottom"
      open={aperto}
      onClose={onChiudi}
      PaperProps={{ sx: { borderRadius: '24px 24px 0 0', maxHeight: '92vh' } }}
    >
      <Box sx={{ p: 3, overflowY: 'auto' }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            {spesaInModifica ? '✏️ Modifica spesa' : '💸 Nuova spesa'}
          </Typography>
          <IconButton onClick={onChiudi} size="small"><CloseRoundedIcon /></IconButton>
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

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <TextField
            label="Categoria"
            fullWidth
            select
            value={form.categoria}
            onChange={e => aggiorna('categoria', e.target.value)}
          >
            {impostazioni.categorie.map(cat => (
              <MenuItem key={cat.nome} value={cat.nome}>
                {cat.icona} {cat.nome.charAt(0).toUpperCase() + cat.nome.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Chi ha pagato"
            fullWidth
            select
            value={form.pagatore}
            onChange={e => aggiornaPagatore(e.target.value)}
          >
            {utenti.map(u => (
              <MenuItem key={u.id} value={u.nome}>{u.nome}</MenuItem>
            ))}
          </TextField>
        </Box>

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

        <Divider sx={{ mb: 2 }} />

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
              <Typography variant="caption">{form.pagatore}: {form.percentuale}%</Typography>
              <Typography variant="caption">{form.altroUtenteNome}: {100 - form.percentuale}%</Typography>
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
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Anteprima divisione
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                {form.pagatore}: <strong>{formattaImporto(quote[form.pagatore] || 0)}</strong>
              </Typography>
              <Typography variant="body2">
                {form.altroUtenteNome}: <strong>{formattaImporto(quote[form.altroUtenteNome] || 0)}</strong>
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <FormControlLabel
          control={
            <Switch
              checked={form.ricorrente}
              onChange={e => aggiorna('ricorrente', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight={600}>Spesa ricorrente</Typography>
              <Typography variant="caption" color="text.secondary">
                Viene riproposta automaticamente ogni mese
              </Typography>
            </Box>
          }
          sx={{ mb: 3, alignItems: 'flex-start', ml: 0 }}
        />

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
