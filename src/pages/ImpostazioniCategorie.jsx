import React, { useState } from 'react';
import { Box, TextField, Typography, Chip, IconButton } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useImpostazioni } from '../context/ImpostazioniContext';
import { useSpese } from '../context/SpeseContext';

function ImpostazioniCategorie() {
  const { impostazioni, aggiornaImpostazioni } = useImpostazioni();
  const { riassegnaCategoria } = useSpese();
  const [nuovaCategoria, setNuovaCategoria] = useState('');
  const [icona, setIcona] = useState('');
  const [errore, setErrore] = useState('');

  const aggiungi = () => {
    const valore = nuovaCategoria.trim().toLowerCase();
    if (!valore) return;

    if (impostazioni.categorie.some(c => c.nome === valore)) {
      setErrore('Questa categoria esiste già');
      return;
    }

    aggiornaImpostazioni({ categorie: [...impostazioni.categorie, { nome: valore, icona: icona.trim() || '📦' }] });
    setNuovaCategoria('');
    setIcona('');
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

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        {/* Campo emoji libero */}
        <TextField
          label="Emoji"
          size="small"
          value={icona}
          onChange={e => setIcona(e.target.value)}
          placeholder="🛒"
          inputProps={{ maxLength: 4, style: { fontSize: '1.4rem', textAlign: 'center', width: 40, padding: '6px 4px' } }}
          sx={{ width: 76, flexShrink: 0 }}
        />
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
          sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2, '&:hover': { bgcolor: 'primary.dark' }, mt: 0.25 }}
        >
          <AddRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ImpostazioniCategorie;