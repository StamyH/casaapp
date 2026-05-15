import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Chip, IconButton } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useApp } from '../context/AppContext';

function ImpostazioniCategorie() {
  const { impostazioni, aggiornaImpostazioni } = useApp();
  const [nuovaCategoria, setNuovaCategoria] = useState('');

  const aggiungi = () => {
    if (!nuovaCategoria || impostazioni.categorie.includes(nuovaCategoria.toLowerCase())) return;
    aggiornaImpostazioni({
      categorie: [...impostazioni.categorie, nuovaCategoria.toLowerCase()]
    });
    setNuovaCategoria('');
  };

  const elimina = (cat) => {
    if (impostazioni.categorie.length <= 1) return; // almeno una categoria
    aggiornaImpostazioni({
      categorie: impostazioni.categorie.filter(c => c !== cat)
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Tieni premuto su una categoria per eliminarla. Deve rimanere almeno una categoria.
      </Typography>

      {/* Lista categorie */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {impostazioni.categorie.map(cat => (
          <Chip
            key={cat}
            label={cat.charAt(0).toUpperCase() + cat.slice(1)}
            onDelete={() => elimina(cat)}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Box>

      {/* Aggiungi categoria */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          label="Nuova categoria"
          fullWidth
          size="small"
          value={nuovaCategoria}
          onChange={e => setNuovaCategoria(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && aggiungi()}
          placeholder="es. palestra"
        />
        <IconButton
          color="primary"
          onClick={aggiungi}
          disabled={!nuovaCategoria}
          sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2, '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <AddRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ImpostazioniCategorie;