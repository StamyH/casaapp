import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, List, ListItem, ListItemText, ListItemIcon,
  ListItemButton, Divider, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import { useApp } from '../context/AppContext';
import { useImpostazioni } from '../context/ImpostazioniContext';

const CHIAVI_BACKUP = [
  'casaapp_utenti',
  'casaapp_utente',
  'casaapp_spese',
  'casaapp_attivita',
  'casaapp_storico_attivita',
  'casaapp_impostazioni',
  'casaapp_ultimo_reset',
  'casaapp_ultima_espansione_ricorrenti',
];

const VOCI = [
  { path: '/impostazioni/profilo', icona: <PersonRoundedIcon />, titolo: 'Profilo', descrizione: 'Visualizza nome e avatar', colore: '#5C6BC0' },
  { path: '/impostazioni/tema', icona: <PaletteRoundedIcon />, titolo: 'Tema', descrizione: 'Colori e modalità chiara/scura', colore: '#26A69A' },
  { path: '/impostazioni/utenti', icona: <GroupRoundedIcon />, titolo: 'Utenti', descrizione: 'Gestisci gli utenti della casa', colore: '#AB47BC' },
  { path: '/impostazioni/categorie', icona: <CategoryRoundedIcon />, titolo: 'Categorie spese', descrizione: 'Gestisci le categorie personalizzate', colore: '#FF7043' },
  { path: '/impostazioni/casa', icona: <HomeRoundedIcon />, titolo: 'La tua casa', descrizione: 'Modifica il nome della casa', colore: '#FFA726' },
];

function Impostazioni() {
  const { utenteAttivo } = useApp();
  const { impostazioni } = useImpostazioni();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [dialogRipristino, setDialogRipristino] = useState(null);
  const [erroreImport, setErroreImport] = useState('');

  const esportaBackup = () => {
    const dati = { versione: 1, esportato: new Date().toISOString(), dati: {} };
    CHIAVI_BACKUP.forEach(k => {
      const val = localStorage.getItem(k);
      if (val !== null) dati.dati[k] = JSON.parse(val);
    });
    const blob = new Blob([JSON.stringify(dati, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casaapp_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const leggiFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed?.dati || typeof parsed.dati !== 'object') throw new Error('Formato non valido');
        setErroreImport('');
        setDialogRipristino(parsed);
      } catch {
        setErroreImport('File non valido o corrotto.');
        setDialogRipristino(null);
      }
    };
    reader.readAsText(file);
  };

  const confermaRipristino = () => {
    if (!dialogRipristino) return;
    CHIAVI_BACKUP.forEach(k => {
      if (dialogRipristino.dati[k] !== undefined) {
        localStorage.setItem(k, JSON.stringify(dialogRipristino.dati[k]));
      }
    });
    window.location.reload();
  };

  const coloreApp = utenteAttivo?.coloreApp || '#5C6BC0';
  const coloreSecondario = utenteAttivo?.coloreSecondario || '#26A69A';

  return (
    <Box sx={{ p: 2 }}>

      <Card
        elevation={0}
        sx={{
          mb: 3, borderRadius: 3,
          background: `linear-gradient(135deg, ${coloreApp} 0%, ${coloreSecondario} 100%)`,
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>Utente attivo</Typography>
          <Typography variant="h6" fontWeight={700}>👤 {utenteAttivo?.nome}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>{impostazioni.nomeCasa}</Typography>
            <IconButton size="small" onClick={() => navigate('/impostazioni/casa')} sx={{ color: 'rgba(255,255,255,0.7)', p: 0.25 }}>
              <EditRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <List disablePadding>
          {VOCI.map((voce, i) => (
            <React.Fragment key={voce.path}>
              {i > 0 && <Divider />}
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate(voce.path)} sx={{ py: 1.5, px: 2 }}>
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: `${voce.colore}20`, color: voce.colore,
                    }}>
                      {voce.icona}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography fontWeight={600}>{voce.titolo}</Typography>}
                    secondary={voce.descrizione}
                  />
                  <ChevronRightRoundedIcon sx={{ color: 'text.disabled' }} />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Card>

      {/* Backup & Ripristino */}
      <Card elevation={0} sx={{ mt: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={0.5}>💾 Backup & Ripristino</Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Esporta tutti i dati dell'app in un file JSON o ripristinali da un backup precedente.
          </Typography>
          {erroreImport && (
            <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>{erroreImport}</Alert>
          )}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              onClick={esportaBackup}
              sx={{ borderRadius: 2, py: 1 }}
            >
              Esporta
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<UploadRoundedIcon />}
              onClick={() => inputRef.current?.click()}
              sx={{ borderRadius: 2, py: 1 }}
            >
              Importa
            </Button>
          </Box>
          <input ref={inputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={leggiFile} />
        </CardContent>
      </Card>

      <Dialog open={!!dialogRipristino} onClose={() => setDialogRipristino(null)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>⚠️ Conferma ripristino</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={1}>
            Stai per sostituire <strong>tutti i dati</strong> dell'app con quelli del backup del{' '}
            <strong>{dialogRipristino?.esportato ? new Date(dialogRipristino.esportato).toLocaleDateString('it-IT') : '—'}</strong>.
          </Typography>
          <Typography variant="body2" color="error.main">
            I dati attuali andranno persi. L'app si ricaricherà automaticamente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogRipristino(null)}>Annulla</Button>
          <Button variant="contained" color="error" onClick={confermaRipristino}>Ripristina</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default Impostazioni;
