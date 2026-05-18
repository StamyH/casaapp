import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Avatar, IconButton,
  TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useApp } from '../context/AppContext';

function ImpostazioniUtenti() {
  const { utenti, utenteAttivo, aggiungiUtente, modificaUtente, eliminaUtente } = useApp();
  const [dialogAggiungi, setDialogAggiungi] = useState(false);
  const [dialogModifica, setDialogModifica] = useState(null);
  const [confermaElimina, setConfermaElimina] = useState(null);
  const [nuovoNome, setNuovoNome] = useState('');
  const [nomeModifica, setNomeModifica] = useState('');

  const handleAggiungi = () => {
    const nome = nuovoNome.trim();
    if (!nome) return;
    aggiungiUtente(nome);
    setNuovoNome('');
    setDialogAggiungi(false);
  };

  const handleModifica = () => {
    const nome = nomeModifica.trim();
    if (!nome || !dialogModifica) return;
    modificaUtente(dialogModifica.id, { nome });
    setDialogModifica(null);
    setNomeModifica('');
  };

  const handleElimina = (id) => {
    eliminaUtente(id);
    setConfermaElimina(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Gestisci gli utenti della casa. Non puoi eliminare l'ultimo utente rimasto.
      </Typography>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        {utenti.map((u, i) => (
          <React.Fragment key={u.id}>
            {i > 0 && <Divider />}
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: u.coloreAvatar, fontWeight: 700 }}>{u.nome[0]}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{u.nome}</Typography>
                  {u.id === utenteAttivo?.id && (
                    <Typography variant="caption" color="primary">Sei tu</Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => { setDialogModifica(u); setNomeModifica(u.nome); }}
                  sx={{ color: 'text.secondary' }}
                >
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setConfermaElimina(u)}
                  disabled={utenti.length <= 1}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
          </React.Fragment>
        ))}
      </Card>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<AddRoundedIcon />}
        onClick={() => setDialogAggiungi(true)}
        sx={{ borderRadius: 3, py: 1.5 }}
      >
        Aggiungi utente
      </Button>

      {/* Dialog aggiungi */}
      <Dialog open={dialogAggiungi} onClose={() => setDialogAggiungi(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Nuovo utente</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Nome"
            value={nuovoNome}
            onChange={e => setNuovoNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAggiungi()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogAggiungi(false)}>Annulla</Button>
          <Button variant="contained" onClick={handleAggiungi} disabled={!nuovoNome.trim()}>Crea</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog modifica nome */}
      <Dialog open={!!dialogModifica} onClose={() => setDialogModifica(null)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Modifica nome</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Nome"
            value={nomeModifica}
            onChange={e => setNomeModifica(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleModifica()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogModifica(null)}>Annulla</Button>
          <Button variant="contained" onClick={handleModifica} disabled={!nomeModifica.trim()}>Salva</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog conferma elimina */}
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
          <Button variant="contained" color="error" onClick={() => handleElimina(confermaElimina.id)}>Elimina</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ImpostazioniUtenti;
