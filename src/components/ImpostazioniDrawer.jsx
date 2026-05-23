import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Avatar, Button, Divider,
  ToggleButton, ToggleButtonGroup, IconButton, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Snackbar, Alert,
} from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useImpostazioni } from '../context/ImpostazioniContext';
import { useSpese } from '../context/SpeseContext';
import { useAttivita } from '../context/AttivitaContext';
import { COLORI_TEMA } from '../utils/helpers';

const EMOJI = ['🛒','⚡','🏠','📦','🍕','🚌','💡','💊','👗','🎮','🐾','🍺','🎁','✈️','🏋️','📚','🔧','🌿','💰','🎵'];
const MAX_NOME = 20;

function Pallino({ valore, nome, selezionato, onClick }) {
  return (
    <Box onClick={onClick} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '50%', bgcolor: valore,
        border: '3px solid',
        borderColor: selezionato ? 'text.primary' : 'transparent',
        transition: 'all 0.15s ease',
        '&:hover': { transform: 'scale(1.1)' },
      }} />
      <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>{nome}</Typography>
    </Box>
  );
}

function SezioneLabel({ testo }) {
  return (
    <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1.5, letterSpacing: 1 }}>
      {testo}
    </Typography>
  );
}

function ImpostazioniDrawer({ aperto, onChiudi }) {
  const navigate = useNavigate();
  const { utenteAttivo, setUtenteAttivoId, utenti, aggiungiUtente, modificaUtente, eliminaUtente } = useApp();
  const { impostazioni, aggiornaImpostazioni } = useImpostazioni();
  const { aggiornaRiferimentiUtente: aggiornaSpese, riassegnaCategoria } = useSpese();
  const { aggiornaRiferimentiUtente: aggiornaAttivita } = useAttivita();

  const [nomeCasa, setNomeCasa] = useState(impostazioni.nomeCasa);
  useEffect(() => { setNomeCasa(impostazioni.nomeCasa); }, [impostazioni.nomeCasa]);

  const [dialogAggiungi, setDialogAggiungi] = useState(false);
  const [dialogModifica, setDialogModifica] = useState(null);
  const [confermaElimina, setConfermaElimina] = useState(null);
  const [nuovoNome, setNuovoNome] = useState('');
  const [nomeModifica, setNomeModifica] = useState('');

  const [nuovaCategoria, setNuovaCategoria] = useState('');
  const [icona, setIcona] = useState('📦');
  const [erroreCategoria, setErroreCategoria] = useState('');

  const [dialogEliminaCategoria, setDialogEliminaCategoria] = useState(null);
  const [categoriaFallback, setCategoriaFallback] = useState('');
  const [snackbar, setSnackbar] = useState('');

  const handleAggiungiUtente = () => {
    const nome = nuovoNome.trim();
    if (!nome) return;
    aggiungiUtente(nome);
    setNuovoNome('');
    setDialogAggiungi(false);
  };

  const handleModificaUtente = () => {
    const nome = nomeModifica.trim();
    if (!nome || !dialogModifica) return;
    const vecchioNome = dialogModifica.nome;
    modificaUtente(dialogModifica.id, { nome });
    if (nome !== vecchioNome) {
      aggiornaSpese(vecchioNome, nome);
      aggiornaAttivita(vecchioNome, nome);
    }
    setDialogModifica(null);
    setNomeModifica('');
    setSnackbar('Nome aggiornato!');
  };

  const handleEliminaUtente = (id) => {
    eliminaUtente(id);
    setConfermaElimina(null);
  };

  const aggiungiCategoria = () => {
    const valore = nuovaCategoria.trim().toLowerCase();
    if (!valore) return;
    if (impostazioni.categorie.some(c => c.nome === valore)) {
      setErroreCategoria('Categoria già esistente');
      return;
    }
    aggiornaImpostazioni({ categorie: [...impostazioni.categorie, { nome: valore, icona }] });
    setNuovaCategoria('');
    setIcona('📦');
    setErroreCategoria('');
  };

  const eliminaCategoria = (cat) => {
    if (impostazioni.categorie.length <= 1) return;
    const rimanenti = impostazioni.categorie.filter(c => c.nome !== cat.nome);
    setCategoriaFallback(rimanenti[0].nome);
    setDialogEliminaCategoria(cat);
  };

  const confermaCategoriaFallback = () => {
    if (!dialogEliminaCategoria || !categoriaFallback) return;
    const rimanenti = impostazioni.categorie.filter(c => c.nome !== dialogEliminaCategoria.nome);
    riassegnaCategoria(dialogEliminaCategoria.nome, categoriaFallback);
    aggiornaImpostazioni({ categorie: rimanenti });
    setDialogEliminaCategoria(null);
  };

  const cambiaUtente = () => {
    onChiudi();
    navigate('/benvenuto');
  };

  const esci = () => {
    onChiudi();
    setUtenteAttivoId(null);
    navigate('/benvenuto');
  };

  if (!utenteAttivo) return null;

  return (
    <>
      <Drawer
        anchor="right"
        open={aperto}
        onClose={onChiudi}
        PaperProps={{ sx: { width: { xs: '100%', sm: 360 }, maxWidth: '100vw' } }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* Header fisso */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider',
            flexShrink: 0,
          }}>
            <Typography variant="subtitle1" fontWeight={700}>Impostazioni</Typography>
            <IconButton onClick={onChiudi} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Box sx={{ p: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Header utente */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 1 }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: utenteAttivo.coloreAvatar, fontSize: '1.8rem', fontWeight: 700 }}>
                {utenteAttivo.nome?.[0]}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{utenteAttivo.nome}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" startIcon={<SwapHorizRoundedIcon />} onClick={cambiaUtente} sx={{ borderRadius: 3 }}>
                  Cambia
                </Button>
                <Button size="small" color="error" variant="outlined" startIcon={<LogoutRoundedIcon />} onClick={esci} sx={{ borderRadius: 3 }}>
                  Esci
                </Button>
              </Box>
            </Box>

            <Divider />

            {/* Tema */}
            <Box>
              <SezioneLabel testo="Tema" />
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>Modalità</Typography>
              <ToggleButtonGroup
                value={utenteAttivo.modalita}
                exclusive
                onChange={(e, val) => val && modificaUtente(utenteAttivo.id, { modalita: val })}
                fullWidth
                size="small"
                sx={{ mb: 2.5 }}
              >
                <ToggleButton value="light" sx={{ gap: 0.5 }}>
                  <LightModeRoundedIcon fontSize="small" /> Chiara
                </ToggleButton>
                <ToggleButton value="auto" sx={{ gap: 0.5 }}>
                  <SettingsBrightnessRoundedIcon fontSize="small" /> Auto
                </ToggleButton>
                <ToggleButton value="dark" sx={{ gap: 0.5 }}>
                  <DarkModeRoundedIcon fontSize="small" /> Scura
                </ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="caption" color="text.secondary" display="block" mb={1}>Colore app</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
                {COLORI_TEMA.map(c => (
                  <Pallino key={c.valore} valore={c.valore} nome={c.nome}
                    selezionato={utenteAttivo.coloreApp === c.valore}
                    onClick={() => modificaUtente(utenteAttivo.id, { coloreApp: c.valore, coloreSecondario: c.secondario })}
                  />
                ))}
              </Box>

              <Typography variant="caption" color="text.secondary" display="block" mb={1}>Colore avatar</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar sx={{ bgcolor: utenteAttivo.coloreAvatar, width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700 }}>
                  {utenteAttivo.nome?.[0]}
                </Avatar>
                <Typography variant="caption">{utenteAttivo.nome}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {COLORI_TEMA.map(c => (
                  <Pallino key={c.valore} valore={c.valore} nome={c.nome}
                    selezionato={utenteAttivo.coloreAvatar === c.valore}
                    onClick={() => modificaUtente(utenteAttivo.id, { coloreAvatar: c.valore })}
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Casa */}
            <Box>
              <SezioneLabel testo="Casa" />
              <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                <TextField
                  label="Nome della casa"
                  fullWidth
                  size="small"
                  value={nomeCasa}
                  onChange={e => setNomeCasa(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && nomeCasa && aggiornaImpostazioni({ nomeCasa })}
                />
                <Button
                  variant="contained"
                  onClick={() => aggiornaImpostazioni({ nomeCasa })}
                  disabled={!nomeCasa || nomeCasa === impostazioni.nomeCasa}
                  sx={{ borderRadius: 2, flexShrink: 0 }}
                >
                  Salva
                </Button>
              </Box>

              <Typography variant="caption" color="text.secondary" display="block" mb={1}>Primo giorno della settimana</Typography>
              <ToggleButtonGroup
                value={impostazioni.primoGiornoSettimana}
                exclusive
                onChange={(e, val) => val !== null && aggiornaImpostazioni({ primoGiornoSettimana: val })}
                fullWidth
                size="small"
              >
                <ToggleButton value={1}>Lunedì</ToggleButton>
                <ToggleButton value={0}>Domenica</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Divider />

            {/* Utenti */}
            <Box>
              <SezioneLabel testo="Utenti" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
                {utenti.map(u => (
                  <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: u.coloreAvatar, width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700 }}>
                      {u.nome[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{u.nome}</Typography>
                      {u.id === utenteAttivo?.id && (
                        <Typography variant="caption" color="primary">Sei tu</Typography>
                      )}
                    </Box>
                    {u.id === utenteAttivo?.id && (
                      <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => { setDialogModifica(u); setNomeModifica(u.nome); }}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setConfermaElimina(u)} disabled={utenti.length <= 1}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              <Button
                fullWidth variant="outlined" size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => setDialogAggiungi(true)}
                sx={{ borderRadius: 2 }}
              >
                Aggiungi utente
              </Button>
            </Box>

            <Divider />

            {/* Categorie */}
            <Box>
              <SezioneLabel testo="Categorie spese" />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {impostazioni.categorie.map(cat => (
                  <Chip
                    key={cat.nome}
                    label={`${cat.icona} ${cat.nome.charAt(0).toUpperCase() + cat.nome.slice(1)}`}
                    onDelete={impostazioni.categorie.length > 1 ? () => eliminaCategoria(cat) : undefined}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>

              <Typography variant="caption" color="text.secondary" display="block" mb={1}>Icona</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                {EMOJI.map(e => (
                  <Box
                    key={e}
                    onClick={() => setIcona(e)}
                    sx={{
                      width: 34, height: 34, borderRadius: 1.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', cursor: 'pointer',
                      border: '2px solid',
                      borderColor: icona === e ? 'primary.main' : 'transparent',
                      bgcolor: icona === e ? 'primary.light' : 'action.hover',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {e}
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <TextField
                  size="small"
                  label="O digita un'emoji"
                  placeholder="😀"
                  value={EMOJI.includes(icona) ? '' : icona}
                  onChange={e => {
                    const val = e.target.value;
                    if (!val) { setIcona('📦'); return; }
                    const segs = typeof Intl.Segmenter !== 'undefined'
                      ? [...new Intl.Segmenter().segment(val)].map(s => s.segment)
                      : [...val];
                    setIcona(segs[segs.length - 1] || '📦');
                  }}
                  inputProps={{ style: { fontSize: '1.3rem', textAlign: 'center' } }}
                  sx={{ width: 140 }}
                />
                <Box sx={{
                  width: 40, height: 40, borderRadius: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                  border: '2px solid', borderColor: 'primary.main',
                  bgcolor: 'primary.light',
                }}>
                  {icona}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Nuova categoria"
                  fullWidth size="small"
                  value={nuovaCategoria}
                  onChange={e => { setNuovaCategoria(e.target.value); setErroreCategoria(''); }}
                  onKeyDown={e => e.key === 'Enter' && aggiungiCategoria()}
                  placeholder="es. palestra"
                  error={!!erroreCategoria}
                  helperText={erroreCategoria}
                />
                <IconButton
                  color="primary"
                  onClick={aggiungiCategoria}
                  disabled={!nuovaCategoria.trim()}
                  sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2, '&:hover': { bgcolor: 'primary.dark' }, alignSelf: 'flex-start' }}
                >
                  <AddRoundedIcon />
                </IconButton>
              </Box>
            </Box>

            <Divider />

            <Button
              fullWidth
              variant="text"
              onClick={() => { onChiudi(); navigate('/impostazioni'); }}
              sx={{ borderRadius: 3, py: 1.5, color: 'text.secondary', justifyContent: 'flex-start', px: 2 }}
            >
              Tutte le impostazioni →
            </Button>

            <Box sx={{ height: 8 }} />
          </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Dialogs utenti — fuori dal Drawer per evitare problemi di z-index */}
      <Dialog open={dialogAggiungi} onClose={() => setDialogAggiungi(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Nuovo utente</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Nome"
            value={nuovoNome}
            onChange={e => { if (e.target.value.length <= MAX_NOME) setNuovoNome(e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && handleAggiungiUtente()}
            inputProps={{ maxLength: MAX_NOME }}
            helperText={`${nuovoNome.length}/${MAX_NOME}`}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogAggiungi(false)}>Annulla</Button>
          <Button variant="contained" onClick={handleAggiungiUtente} disabled={!nuovoNome.trim()}>Crea</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!dialogModifica} onClose={() => setDialogModifica(null)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Modifica nome</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Nome"
            value={nomeModifica}
            onChange={e => { if (e.target.value.length <= MAX_NOME) setNomeModifica(e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && handleModificaUtente()}
            inputProps={{ maxLength: MAX_NOME }}
            helperText={`${nomeModifica.length}/${MAX_NOME}`}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogModifica(null)}>Annulla</Button>
          <Button variant="contained" onClick={handleModificaUtente} disabled={!nomeModifica.trim()}>Salva</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confermaElimina} onClose={() => setConfermaElimina(null)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Elimina utente</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare <strong>{confermaElimina?.nome}</strong>?
            Le sue spese e attività rimarranno registrate.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfermaElimina(null)}>Annulla</Button>
          <Button variant="contained" color="error" onClick={() => handleEliminaUtente(confermaElimina.id)}>Elimina</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!dialogEliminaCategoria} onClose={() => setDialogEliminaCategoria(null)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Elimina categoria</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Le spese in <strong>{dialogEliminaCategoria?.icona} {dialogEliminaCategoria?.nome}</strong> verranno spostate in:
          </Typography>
          <TextField
            select fullWidth size="small"
            value={categoriaFallback}
            onChange={e => setCategoriaFallback(e.target.value)}
            label="Nuova categoria"
          >
            {impostazioni.categorie
              .filter(c => c.nome !== dialogEliminaCategoria?.nome)
              .map(c => (
                <MenuItem key={c.nome} value={c.nome}>{c.icona} {c.nome.charAt(0).toUpperCase() + c.nome.slice(1)}</MenuItem>
              ))
            }
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogEliminaCategoria(null)}>Annulla</Button>
          <Button variant="contained" color="error" onClick={confermaCategoriaFallback}>Elimina</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2500}
        onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnackbar('')} sx={{ borderRadius: 3 }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ImpostazioniDrawer;
