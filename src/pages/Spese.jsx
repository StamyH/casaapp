import React, { useState } from 'react';
import { Box, Typography, Fab, MenuItem, TextField } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useSpese } from '../context/SpeseContext';
import { useImpostazioni } from '../context/ImpostazioniContext';
import SpesaCard from '../components/Spese/SpesaCard';
import Bilancio from '../components/Spese/Bilancio';
import AggiuntaSpesa from '../components/Spese/AggiuntaSpesa';
import { raggruppaPerMese } from '../utils/helpers';

function Spese() {
  const { spese } = useSpese();
  const { impostazioni } = useImpostazioni();
  const [apriForm, setApriForm] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('tutte');
  const [spesaInModifica, setSpesaInModifica] = useState(null);

  // Filtra per categoria se selezionata
  const speseFiltrate = filtroCategoria === 'tutte'
    ? spese
    : spese.filter(s => s.categoria === filtroCategoria);

  // Raggruppa per mese
  const spesePerMese = raggruppaPerMese(speseFiltrate);

  return (
    <Box sx={{ p: 2 }}>

      {/* Mese corrente */}
      <Typography variant="h6" fontWeight={700} mb={2} textTransform="capitalize">
        {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
      </Typography>

      {/* Bilancio in cima */}
      <Bilancio />

      {/* Filtro categoria */}
      <TextField
        select
        fullWidth
        size="small"
        value={filtroCategoria}
        onChange={e => setFiltroCategoria(e.target.value)}
        sx={{ mb: 3, borderRadius: 2 }}
        label="Filtra per categoria"
      >
        <MenuItem value="tutte">Tutte le categorie</MenuItem>
        {impostazioni.categorie.map(cat => (
          <MenuItem key={cat.nome} value={cat.nome}>
            {cat.icona} {cat.nome.charAt(0).toUpperCase() + cat.nome.slice(1)}
          </MenuItem>
        ))}
      </TextField>

      {/* Lista spese raggruppate per mese */}
      {Object.keys(spesePerMese).length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography fontSize="2.5rem">💸</Typography>
          <Typography color="text.secondary" mt={1}>
            Nessuna spesa registrata
          </Typography>
        </Box>
      ) : (
        Object.entries(spesePerMese).map(([mese, speseDelMese]) => (
          <Box key={mese} mb={3}>
            {/* Intestazione mese */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="text.secondary"
                textTransform="capitalize"
              >
                {mese}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {speseDelMese.length} {speseDelMese.length === 1 ? 'spesa' : 'spese'}
              </Typography>
            </Box>

            {/* Card spese */}
            {speseDelMese.map(spesa => (
              <SpesaCard key={spesa.id} spesa={spesa} onModifica={setSpesaInModifica}/>
            ))}
          </Box>
        ))
      )}

      {/* Bottone aggiunta spesa — fisso in basso a destra */}
      <Fab
        color="primary"
        onClick={() => setApriForm(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          boxShadow: 4,
        }}
      >
        <AddRoundedIcon />
      </Fab>

      {/* Form aggiunta spesa */}
      <AggiuntaSpesa
        aperto={apriForm || !!spesaInModifica}
        onChiudi={() => { setApriForm(false); setSpesaInModifica(null); }}
        spesaInModifica={spesaInModifica}
      />
    </Box>
  );
}

export default Spese;