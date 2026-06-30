import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, TextField, Button,
  MenuItem, ToggleButton, ToggleButtonGroup,
  Slider, Divider, IconButton, Switch, FormControlLabel, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useApp } from '../../context/AppContext';
import { useSpese } from '../../context/SpeseContext';
import { useImpostazioni } from '../../context/ImpostazioniContext';
import { formattaImporto, calcolaQuote } from '../../utils/helpers';

const DIVISIONI_BASE = [
  { value: 'metà', label: '50/50' },
  { value: 'tutto_mio', label: 'Tutto mio' },
  { value: 'tutto_altro', label: 'Tutto suo' },
  { value: 'percentuale', label: 'Custom %' },
];

function AggiuntaSpesa({ aperto, onChiudi, spesaInModifica, onSuccess }) {
  const { utenteAttivo, utenti } = useApp();
  const { aggiungiSpesa, modificaSpesa, eliminaSpesa } = useSpese();
  const { impostazioni } = useImpostazioni();

  const [form, setForm] = useState(() => {
    const oggi = new Date();
    const dataOggi = `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, '0')}-${String(oggi.getDate()).padStart(2, '0')}`;
    return {
      descrizione: '',
      importo: '',
      data: dataOggi,
      categoria: impostazioni.categorie[0]?.nome || 'altro',
      divisione: 'metà',
      percentuale: 50,
      pagatore: utenteAttivo?.nome || '',
      partecipanti: utenti.filter(u => u.nome !== utenteAttivo?.nome).map(u => u.nome),
      ricorrente: false,
    };
  });
  const [errori, setErrori] = useState({});
  const [confermaElimina, setConfermaElimina] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confermaChiudi, setConfermaChiudi] = useState(false);

  useEffect(() => {
    setConfermaElimina(false);
    setErrori({});
    setIsDirty(false);
    setConfermaChiudi(false);
    if (spesaInModifica) {
      // Valida il pagatore contro gli utenti correnti; fallback all'utente attivo
      const nomiUtenti = utenti.map(u => u.nome);
      const pagatoreValido = nomiUtenti.includes(spesaInModifica.pagatore)
        ? spesaInModifica.pagatore
        : (utenteAttivo?.nome || utenti[0]?.nome || '');

      // Valida i partecipanti: filtra quelli che non esistono più tra gli utenti
      const partsSalvati = spesaInModifica.partecipanti
        ? spesaInModifica.partecipanti.filter(p => p !== pagatoreValido && nomiUtenti.includes(p))
        : [spesaInModifica.altroUtente].filter(p => p && nomiUtenti.includes(p) && p !== pagatoreValido);

      // Se non ci sono partecipanti validi, includi tutti gli altri utenti di default
      const parts = partsSalvati.length > 0
        ? partsSalvati
        : utenti.filter(u => u.nome !== pagatoreValido).map(u => u.nome);

      setForm({
        descrizione: spesaInModifica.descrizione,
        importo: String(spesaInModifica.importo),
        data: spesaInModifica.data || '',
        categoria: spesaInModifica.categoria,
        divisione: spesaInModifica.divisione === 'equa' ? 'metà' : spesaInModifica.divisione,
        percentuale: spesaInModifica.percentuale,
        pagatore: pagatoreValido,
        partecipanti: parts,
        ricorrente: spesaInModifica.ricorrente || false,
      });
    } else {
      // Ricostruisce il form con i valori correnti di utente e impostazioni
      const oggi = new Date();
      const dataOggi = `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, '0')}-${String(oggi.getDate()).padStart(2, '0')}`;
      setForm({
        descrizione: '',
        importo: '',
        data: dataOggi,
        categoria: impostazioni.categorie[0]?.nome || 'altro',
        divisione: 'metà',
        percentuale: 50,
        pagatore: utenteAttivo?.nome || '',
        partecipanti: utenti.filter(u => u.nome !== utenteAttivo?.nome).map(u => u.nome),
        ricorrente: false,
      });
    }
  }, [spesaInModifica, aperto, utenteAttivo, utenti, impostazioni]);

  const aggiorna = (campo, valore) => {
    setIsDirty(true);
    setForm(prev => ({ ...prev, [campo]: valore }));
  };

  const aggiornaPagatore = (nuovoPagatore) => {
    setIsDirty(true);
    setForm(prev => ({
      ...prev,
      pagatore: nuovoPagatore,
      partecipanti: utenti.filter(u => u.nome !== nuovoPagatore).map(u => u.nome),
    }));
  };

  const togglePartecipante = (nome) => {
    setIsDirty(true);
    setForm(prev => {
      const presente = prev.partecipanti.includes(nome);
      return {
        ...prev,
        partecipanti: presente
          ? prev.partecipanti.filter(p => p !== nome)
          : [...prev.partecipanti, nome],
      };
    });
  };

  const handleChiudi = () => {
    if (isDirty) {
      setConfermaChiudi(true);
    } else {
      onChiudi();
    }
  };

  const altriUtenti = utenti.filter(u => u.nome !== form.pagatore);
  const solaMia = form.partecipanti.length === 0;
  const multiSplit = form.partecipanti.length > 1;
  const divisioneEffettiva = solaMia ? 'tutto_mio' : multiSplit ? 'equa' : form.divisione;
  const tuttiPartecipanti = solaMia ? [form.pagatore] : [form.pagatore, ...form.partecipanti];

  const quote = form.importo && !solaMia
    ? calcolaQuote(parseFloat(form.importo), form.pagatore, tuttiPartecipanti, divisioneEffettiva, form.percentuale)
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
      divisione: divisioneEffettiva,
      percentuale: form.percentuale,
      pagatore: form.pagatore,
      partecipanti: tuttiPartecipanti,
      altroUtente: form.partecipanti[0] || '',
      ricorrente: form.ricorrente,
    };

    if (spesaInModifica) {
      modificaSpesa(spesaInModifica.id, { ...dati, data: form.data });
    } else {
      aggiungiSpesa({ ...dati, data: form.data });
    }
    onSuccess?.(spesaInModifica ? 'Spesa aggiornata' : 'Spesa aggiunta');
    onChiudi();
  };

  return (
    <>
    <Drawer
      anchor="bottom"
      open={aperto}
      onClose={handleChiudi}
      PaperProps={{ sx: { borderRadius: '24px 24px 0 0', maxHeight: '92vh' } }}
    >
      <Box sx={{ p: 3, overflowY: 'auto' }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            {spesaInModifica ? '✏️ Modifica spesa' : '💸 Nuova spesa'}
          </Typography>
          <IconButton onClick={handleChiudi} size="small"><CloseRoundedIcon /></IconButton>
        </Box>

        <TextField
          label="Descrizione"
          fullWidth
          value={form.descrizione}
          onChange={e => { aggiorna('descrizione', e.target.value); setErrori(p => ({ ...p, descrizione: '' })); }}
          sx={{ mb: 2 }}
          placeholder="es. Spesa supermercato"
          inputProps={{ maxLength: 100 }}
          error={!!errori.descrizione}
          helperText={errori.descrizione}
        />

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <TextField
            label="Importo (€)"
            fullWidth
            type="number"
            value={form.importo}
            onChange={e => { aggiorna('importo', e.target.value); setErrori(p => ({ ...p, importo: '' })); }}
            placeholder="0.00"
            inputProps={{ min: 0.01, step: 0.01 }}
            error={!!errori.importo}
            helperText={errori.importo}
          />
          <TextField
            label="Data"
            type="date"
            value={form.data}
            onChange={e => aggiorna('data', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
        </Box>

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

        {altriUtenti.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" mb={1} display="block">
              Dividi con
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {altriUtenti.map(u => (
                <Chip
                  key={u.id}
                  label={u.nome}
                  onClick={() => togglePartecipante(u.nome)}
                  color={form.partecipanti.includes(u.nome) ? 'primary' : 'default'}
                  variant={form.partecipanti.includes(u.nome) ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Box>
            {solaMia && (
              <Typography variant="caption" color="text.secondary" mt={0.75} display="block">
                Spesa solo tua — non influisce sul bilancio condiviso
              </Typography>
            )}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} mb={1}>Come dividere?</Typography>

        {solaMia ? (
          <Box sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Typography variant="body2" color="text.secondary">
              Spesa solo tua — nessuna divisione
            </Typography>
          </Box>
        ) : multiSplit ? (
          <Box sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Typography variant="body2" color="text.secondary">
              Divisione equa tra {tuttiPartecipanti.length} persone
            </Typography>
          </Box>
        ) : (
          <ToggleButtonGroup
            value={form.divisione}
            exclusive
            onChange={(e, val) => val && aggiorna('divisione', val)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {DIVISIONI_BASE.map(d => (
              <ToggleButton key={d.value} value={d.value} sx={{ fontSize: '0.75rem', py: 1 }}>
                {d.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}

        {!solaMia && !multiSplit && form.divisione === 'percentuale' && (
          <Box sx={{ px: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption">{form.pagatore}: {form.percentuale}%</Typography>
              <Typography variant="caption">{form.partecipanti[0]}: {100 - form.percentuale}%</Typography>
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
            {tuttiPartecipanti.map(nome => (
              <Box key={nome} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {nome}{nome === form.pagatore ? ' (ha pagato)' : ''}
                </Typography>
                <Typography variant="body2">
                  <strong>{formattaImporto(quote[nome] || 0)}</strong>
                </Typography>
              </Box>
            ))}
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

    <Dialog open={confermaChiudi} onClose={() => setConfermaChiudi(false)} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Modifiche non salvate</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Hai modificato la spesa ma non hai salvato. Vuoi uscire senza salvare?</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => setConfermaChiudi(false)}>Continua</Button>
        <Button variant="contained" color="error" onClick={() => { setConfermaChiudi(false); setIsDirty(false); onChiudi(); }}>
          Esci senza salvare
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

export default AggiuntaSpesa;
