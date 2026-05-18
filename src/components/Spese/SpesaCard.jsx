import React from 'react';
import {
  Card, CardContent, Box, Typography,
  Chip, IconButton
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { formattaImporto, formattaData, calcolaQuote } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { useImpostazioni } from '../../context/ImpostazioniContext';

const PALETTE = ['#66BB6A', '#FFA726', '#5C6BC0', '#78909C', '#EC407A', '#26A69A', '#FF7043', '#AB47BC', '#42A5F5'];

const DIVISIONE_LABEL = {
  metà: 'Metà/Metà',
  tutto_mio: 'Tutto mio',
  tutto_altro: 'Tutto suo',
  percentuale: 'Personalizzata',
};

function SpesaCard({ spesa, onModifica }) {
  const { utenteAttivo, utenti } = useApp();
  const { impostazioni } = useImpostazioni();
  const idx = impostazioni.categorie.findIndex(c => c.nome === spesa.categoria);
  const catObj = impostazioni.categorie[idx] || { nome: spesa.categoria, icona: '📦' };
  const colore = PALETTE[idx >= 0 ? idx % PALETTE.length : PALETTE.length - 1];

  const altroUtente = spesa.altroUtente || utenti.find(u => u.nome !== spesa.pagatore)?.nome;
  const quote = altroUtente
    ? calcolaQuote(spesa.importo, spesa.pagatore, altroUtente, spesa.divisione, spesa.percentuale)
    : null;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2, borderRadius: 3,
        border: '1px solid', borderColor: 'divider',
        '&:hover': { boxShadow: 3, transition: 'box-shadow 0.2s ease' }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>

          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', bgcolor: `${colore}20`, flexShrink: 0,
          }}>
            {catObj.icona}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography fontWeight={600} noWrap>{spesa.descrizione}</Typography>
              <Typography fontWeight={700} color="text.primary" ml={1}>{formattaImporto(spesa.importo)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Pagato da <strong>{spesa.pagatore}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">·</Typography>
              <Typography variant="caption" color="text.secondary">{formattaData(spesa.data)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={DIVISIONE_LABEL[spesa.divisione] || 'Metà/Metà'}
                size="small"
                sx={{ bgcolor: `${colore}15`, color: colore, fontWeight: 600 }}
              />
              {quote && (
                <Typography variant="caption" color="text.secondary">
                  {spesa.pagatore}: {formattaImporto(quote[spesa.pagatore] || 0)}
                  {altroUtente && ` · ${altroUtente}: ${formattaImporto(quote[altroUtente] || 0)}`}
                </Typography>
              )}
            </Box>
          </Box>

          {utenteAttivo?.nome === spesa.pagatore && (
            <IconButton size="small" onClick={() => onModifica(spesa)} sx={{ color: 'primary.main', flexShrink: 0 }}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default SpesaCard;
