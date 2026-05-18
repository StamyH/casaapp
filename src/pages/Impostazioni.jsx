import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, ListItemButton, Divider, IconButton } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useApp } from '../context/AppContext';
import { useImpostazioni } from '../context/ImpostazioniContext';

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

    </Box>
  );
}

export default Impostazioni;
