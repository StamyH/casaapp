import React, { useState } from 'react';
import { Box, TextField, Typography, Chip, IconButton } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useImpostazioni } from '../context/ImpostazioniContext';
import { useSpese } from '../context/SpeseContext';

const EMOJI = ['🛒','⚡','🏠','📦','🍕','🚌','💡','💊','👗','🎮','🐾','🍺','🎁','✈️','🏋️','📚','🔧','🌿','💰','🎵'];

function ImpostazioniCategorie() {
  const { impostazioni, aggiornaImpostazioni } = useImpostazioni();
  const { riassegnaCategoria } = useSpese();
  const [nuovaCategoria, setNuovaCategoria] = useState('');
  const [icona, setIcona] = useState('📦');
  const [errore, setErrore] = useState('');

  const aggiungi = () => {
    const valore = nuovaCategoria.trim().toLowerCase();
    if (!valore) return;
  
    if (impostazioni.categorie.some(c => c.nome === valore)) {
      setErrore('Questa categoria esiste già');
      return;
    }
  
    aggiornaImpostazioni({ categorie: [...impostazioni.categorie, { nome: valore, icona }] });
    setNuovaCategoria('');
    setIcona('📦');
    setErrore('');
  };

  const elimina = (cat) => {
    if (impostazioni.categorie.length <= 1) return;
    const rimanenti = impostazioni.categorie.filter(c => c.nome !== cat.nome);
    riassegnaCategoria(cat.nome, rimanenti[0].nome);
    aggiornaImpostazioni({ categorie: rimanenti });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Aggiungi o rimuovi categorie usando la X. Deve rimanere almeno una categoria.
      </Typography>
  
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {impostazioni.categorie.map(cat => (
          <Chip
            key={cat.nome}
            label={`${cat.icona} ${cat.nome.charAt(0).toUpperCase() + cat.nome.slice(1)}`}
            onDelete={impostazioni.categorie.length > 1 ? () => elimina(cat) : undefined}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Box>
  
      {/* Selettore emoji */}
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Icona
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {EMOJI.map(e => (
          <Box
            key={e}
            onClick={() => setIcona(e)}
            sx={{
              width: 40, height: 40, borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', cursor: 'pointer',
              border: '2px solid',
              borderColor: icona === e ? 'primary.main' : 'transparent',
              bgcolor: icona === e ? 'primary.light' : 'action.hover',
              transition: 'all 0.15s ease',
            }}
          >
            {e}
          </Box>
        ))}
      </Box>
  
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          label="Nuova categoria"
          fullWidth
          size="small"
          value={nuovaCategoria}
          onChange={e => { setNuovaCategoria(e.target.value); setErrore(''); }}
          onKeyDown={e => e.key === 'Enter' && aggiungi()}
          placeholder="es. palestra"
          error={!!errore}
          helperText={errore}
        />
        <IconButton
          color="primary"
          onClick={aggiungi}
          disabled={!nuovaCategoria.trim()}
          sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2, '&:hover': { bgcolor: 'primary.dark' }, alignSelf: 'flex-start' }}
        >
          <AddRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ImpostazioniCategorie;