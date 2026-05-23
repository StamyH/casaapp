import React, { useState } from 'react';
import {
  Box, Typography, Fab, MenuItem, TextField, IconButton,
  Tooltip, Collapse, Button, Chip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
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

const FILTRI_VUOTI = { ricerca: '', categoria: 'tutte', pagatore: 'tutti', ordinamento: 'data_desc' };

function contaFiltriAttivi(f) {
  return [f.ricerca !== '', f.categoria !== 'tutte', f.pagatore !== 'tutti', f.ordinamento !== 'data_desc'].filter(Boolean).length;
}

function Spese() {
  const { spese } = useSpese();
  const { utenti } = useApp();
  const { impostazioni } = useImpostazioni();

  const [apriForm, setApriForm] = useState(false);
  const [spesaInModifica, setSpesaInModifica] = useState(null);
  const [filtriAperti, setFiltriAperti] = useState(false);
  const [filtriStaged, setFiltriStaged] = useState(FILTRI_VUOTI);
  const [filtriAttivi, setFiltriAttivi] = useState(FILTRI_VUOTI);

  const filtriModificati = JSON.stringify(filtriStaged) !== JSON.stringify(filtriAttivi);
  const filtriAttiviCount = contaFiltriAttivi(filtriAttivi);

  const aggiornaStagedFiltro = (campo, valore) => {
    setFiltriStaged(prev => ({ ...prev, [campo]: valore }));
  };

  const applicaFiltri = () => {
    setFiltriAttivi({ ...filtriStaged });
  };

  const azzeraFiltri = () => {
    setFiltriStaged(FILTRI_VUOTI);
    setFiltriAttivi(FILTRI_VUOTI);
  };

  const speseElaborate = spese
    .filter(s => {
      if (filtriAttivi.categoria !== 'tutte' && s.categoria !== filtriAttivi.categoria) return false;
      if (filtriAttivi.pagatore !== 'tutti' && s.pagatore !== filtriAttivi.pagatore) return false;
      if (filtriAttivi.ricerca && !s.descrizione.toLowerCase().includes(filtriAttivi.ricerca.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (filtriAttivi.ordinamento === 'data_desc') return new Date(b.data) - new Date(a.data);
      if (filtriAttivi.ordinamento === 'data_asc') return new Date(a.data) - new Date(b.data);
      if (filtriAttivi.ordinamento === 'importo_desc') return b.importo - a.importo;
      if (filtriAttivi.ordinamento === 'importo_asc') return a.importo - b.importo;
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Tooltip title="Esporta CSV">
          <IconButton onClick={esportaCSV} size="small">
            <DownloadRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Bilancio />

      {/* Banner filtri */}
      <Box
        onClick={() => setFiltriAperti(p => !p)}
        sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          p: 1.5, mb: 1.5, borderRadius: 3,
          border: '1px solid', borderColor: filtriAttiviCount > 0 ? 'primary.main' : 'divider',
          cursor: 'pointer',
          bgcolor: filtriAttiviCount > 0 ? 'primary.light' : 'background.paper',
          transition: 'all 0.2s ease',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListRoundedIcon sx={{ fontSize: '1.1rem', color: filtriAttiviCount > 0 ? 'primary.main' : 'text.secondary' }} />
          <Typography variant="body2" fontWeight={600} color={filtriAttiviCount > 0 ? 'primary.main' : 'text.primary'}>
            Filtri e ordinamento
          </Typography>
          {filtriAttiviCount > 0 && (
            <Chip label={`${filtriAttiviCount} attivo${filtriAttiviCount > 1 ? 'i' : ''}`} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
          )}
          {filtriModificati && (
            <Chip label="non applicato" size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem' }} />
          )}
        </Box>
        {filtriAperti ? <ExpandLessRoundedIcon sx={{ color: 'text.secondary' }} /> : <ExpandMoreRoundedIcon sx={{ color: 'text.secondary' }} />}
      </Box>

      {/* Pannello filtri */}
      <Collapse in={filtriAperti}>
        <Box sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>

          <TextField
            fullWidth size="small"
            placeholder="Cerca spesa..."
            label="Ricerca"
            value={filtriStaged.ricerca}
            onChange={e => aggiornaStagedFiltro('ricerca', e.target.value)}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              select fullWidth size="small"
              value={filtriStaged.categoria}
              onChange={e => aggiornaStagedFiltro('categoria', e.target.value)}
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
              value={filtriStaged.pagatore}
              onChange={e => aggiornaStagedFiltro('pagatore', e.target.value)}
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
            value={filtriStaged.ordinamento}
            onChange={e => aggiornaStagedFiltro('ordinamento', e.target.value)}
            label="Ordina per"
          >
            {ORDINAMENTI.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Button fullWidth variant="outlined" size="small" onClick={azzeraFiltri} sx={{ borderRadius: 2 }}>
              Azzera
            </Button>
            <Button
              fullWidth variant="contained" size="small"
              onClick={applicaFiltri}
              disabled={!filtriModificati}
              sx={{ borderRadius: 2 }}
            >
              Applica
            </Button>
          </Box>
        </Box>
      </Collapse>

      {/* Lista spese raggruppate per mese */}
      {Object.keys(spesePerMese).length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography fontSize="2.5rem">💸</Typography>
          <Typography color="text.secondary" mt={1}>
            {filtriAttiviCount > 0 ? 'Nessuna spesa trovata' : 'Nessuna spesa registrata'}
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
        sx={{ position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', right: 24, boxShadow: 4 }}
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
