import React, { useState } from 'react';
import { Box, Typography, Fab, MenuItem, TextField, IconButton, Tooltip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useSpese } from '../context/SpeseContext';
import { useApp } from '../context/AppContext';
import { useImpostazioni } from '../context/ImpostazioniContext';
import SpesaCard from '../components/Spese/SpesaCard';
import Bilancio from '../components/Spese/Bilancio';
import AggiuntaSpesa from '../components/Spese/AggiuntaSpesa';
import { raggruppaPerMese } from '../utils/helpers';

const ORDINAMENTI = [
  { value: 'data_desc', label: 'Data (recenti)' },
  { value: 'data_asc', label: 'Data (vecchie)' },
  { value: 'importo_desc', label: 'Importo ↓' },
  { value: 'importo_asc', label: 'Importo ↑' },
];

function Spese() {
  const { spese } = useSpese();
  const { utenti } = useApp();
  const { impostazioni } = useImpostazioni();

  const [apriForm, setApriForm] = useState(false);
  const [spesaInModifica, setSpesaInModifica] = useState(null);
  const [ricerca, setRicerca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('tutte');
  const [filtroPagatore, setFiltroPagatore] = useState('tutti');
  const [ordinamento, setOrdinamento] = useState('data_desc');

  const speseElaborate = spese
    .filter(s => {
      if (filtroCategoria !== 'tutte' && s.categoria !== filtroCategoria) return false;
      if (filtroPagatore !== 'tutti' && s.pagatore !== filtroPagatore) return false;
      if (ricerca && !s.descrizione.toLowerCase().includes(ricerca.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (ordinamento === 'data_desc') return new Date(b.data) - new Date(a.data);
      if (ordinamento === 'data_asc') return new Date(a.data) - new Date(b.data);
      if (ordinamento === 'importo_desc') return b.importo - a.importo;
      if (ordinamento === 'importo_asc') return a.importo - b.importo;
      return 0;
    });

  const spesePerMese = raggruppaPerMese(speseElaborate);

  const esportaCSV = () => {
    const intestazione = ['Data', 'Descrizione', 'Importo (€)', 'Categoria', 'Pagatore', 'Divisione', 'Ricorrente'];
    const righe = speseElaborate.map(s => [
      s.data,
      `"${(s.descrizione || '').replace(/"/g, '""')}"`,
      s.importo.toFixed(2).replace('.', ','),
      s.categoria,
      s.pagatore,
      s.divisione,
      s.ricorrente ? 'Sì' : 'No',
    ]);
    const csv = '﻿' + [intestazione, ...righe].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spese_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 2 }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>Spese</Typography>
        <Tooltip title="Esporta CSV">
          <IconButton onClick={esportaCSV} size="small">
            <DownloadRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Bilancio />

      {/* Ricerca */}
      <TextField
        fullWidth
        size="small"
        placeholder="Cerca spesa..."
        value={ricerca}
        onChange={e => setRicerca(e.target.value)}
        sx={{ mb: 1.5 }}
      />

      {/* Filtri */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField
          select fullWidth size="small"
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
          label="Categoria"
        >
          <MenuItem value="tutte">Tutte</MenuItem>
          {impostazioni.categorie.map(cat => (
            <MenuItem key={cat.nome} value={cat.nome}>
              {cat.icona} {cat.nome.charAt(0).toUpperCase() + cat.nome.slice(1)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select fullWidth size="small"
          value={filtroPagatore}
          onChange={e => setFiltroPagatore(e.target.value)}
          label="Pagatore"
        >
          <MenuItem value="tutti">Tutti</MenuItem>
          {utenti.map(u => (
            <MenuItem key={u.id} value={u.nome}>{u.nome}</MenuItem>
          ))}
        </TextField>
      </Box>

      <TextField
        select fullWidth size="small"
        value={ordinamento}
        onChange={e => setOrdinamento(e.target.value)}
        label="Ordina per"
        sx={{ mb: 3 }}
      >
        {ORDINAMENTI.map(o => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>

      {/* Lista spese raggruppate per mese */}
      {Object.keys(spesePerMese).length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography fontSize="2.5rem">💸</Typography>
          <Typography color="text.secondary" mt={1}>
            {ricerca || filtroCategoria !== 'tutte' || filtroPagatore !== 'tutti'
              ? 'Nessuna spesa trovata'
              : 'Nessuna spesa registrata'}
          </Typography>
        </Box>
      ) : (
        Object.entries(spesePerMese).map(([mese, speseDelMese]) => (
          <Box key={mese} mb={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" textTransform="capitalize">
                {mese}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {speseDelMese.length} {speseDelMese.length === 1 ? 'spesa' : 'spese'}
              </Typography>
            </Box>
            {speseDelMese.map(spesa => (
              <SpesaCard key={spesa.id} spesa={spesa} onModifica={setSpesaInModifica} />
            ))}
          </Box>
        ))
      )}

      <Fab
        color="primary"
        onClick={() => setApriForm(true)}
        sx={{ position: 'fixed', bottom: 80, right: 24, boxShadow: 4 }}
      >
        <AddRoundedIcon />
      </Fab>

      <AggiuntaSpesa
        aperto={apriForm || !!spesaInModifica}
        onChiudi={() => { setApriForm(false); setSpesaInModifica(null); }}
        spesaInModifica={spesaInModifica}
      />
    </Box>
  );
}

export default Spese;
