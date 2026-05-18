import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Avatar, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useApp } from '../context/AppContext';
import { useImpostazioni } from '../context/ImpostazioniContext';

function Benvenuto() {
  const { utenti, setUtenteAttivoId, aggiungiUtente } = useApp();
  const { impostazioni } = useImpostazioni();
  const navigate = useNavigate();
  const [dialogAperto, setDialogAperto] = useState(false);
  const [nuovoNome, setNuovoNome] = useState('');

  const selezionaUtente = (id) => {
    setUtenteAttivoId(id);
    navigate('/');
  };

  const creaUtente = () => {
    const nome = nuovoNome.trim();
    if (!nome) return;
    const id = aggiungiUtente(nome);
    setDialogAperto(false);
    setNuovoNome('');
    setUtenteAttivoId(id);
    navigate('/');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #5C6BC0 0%, #26A69A 100%)',
      gap: 4,
      p: 3,
    }}>
      <Box sx={{ textAlign: 'center', color: 'white' }}>
        <Typography variant="h3" fontWeight={800} mb={1}>🏠</Typography>
        <Typography variant="h5" fontWeight={700}>{impostazioni.nomeCasa}</Typography>
        <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>Chi sei?</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
        {utenti.map((u) => (
          <Button
            key={u.id}
            onClick={() => selezionaUtente(u.id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 3,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              width: 130,
              height: 150,
              '&:hover': {
                background: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease',
              }
            }}
          >
            <Avatar sx={{ width: 64, height: 64, fontSize: '1.8rem', bgcolor: u.coloreAvatar }}>
              {u.nome[0]}
            </Avatar>
            <Typography fontWeight={700} fontSize='1.1rem'>{u.nome}</Typography>
          </Button>
        ))}

        {/* Aggiungi utente */}
        <IconButton
          onClick={() => setDialogAperto(true)}
          sx={{
            width: 130,
            height: 150,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.1)',
            border: '2px dashed rgba(255,255,255,0.4)',
            color: 'white',
            flexDirection: 'column',
            gap: 1,
            display: 'flex',
            '&:hover': { background: 'rgba(255,255,255,0.2)' },
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 32 }} />
          <Typography variant="caption" fontWeight={600}>Nuovo utente</Typography>
        </IconButton>
      </Box>

      <Dialog open={dialogAperto} onClose={() => setDialogAperto(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Nuovo utente</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nome"
            value={nuovoNome}
            onChange={e => setNuovoNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && creaUtente()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogAperto(false)}>Annulla</Button>
          <Button variant="contained" onClick={creaUtente} disabled={!nuovoNome.trim()}>Crea</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Benvenuto;
