import React from 'react';
import {
  Card, CardContent, Box, Typography,
  Chip, IconButton
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { formattaImporto, formattaData, calcolaQuote } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

// Icone e colori per ogni categoria
const CATEGORIE = {
  spesa: { icona: '🛒', colore: '#66BB6A' },
  bolletta: { icona: '⚡', colore: '#FFA726' },
  affitto: { icona: '🏠', colore: '#5C6BC0' },
  altro: { icona: '📦', colore: '#78909C' },
};

// Etichette leggibili per il tipo di divisione
const DIVISIONE_LABEL = {
  metà: 'Metà/Metà',
  tutto_mio: 'Tutto mio',
  tutto_altro: 'Tutto suo',
  percentuale: 'Personalizzata',
};

function SpesaCard({ spesa }) {
  const { eliminaSpesa, utente } = useApp();
  const categoria = CATEGORIE[spesa.categoria] || CATEGORIE.altro;
  const quote = calcolaQuote(spesa.importo, spesa.pagatore, spesa.divisione, spesa.percentuale);

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { boxShadow: 3, transition: 'box-shadow 0.2s ease' }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>

          {/* Icona categoria */}
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            bgcolor: `${categoria.colore}20`,
            flexShrink: 0,
          }}>
            {categoria.icona}
          </Box>

          {/* Contenuto principale */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography fontWeight={600} noWrap>
                {spesa.descrizione}
              </Typography>
              <Typography fontWeight={700} color="text.primary" ml={1}>
                {formattaImporto(spesa.importo)}
              </Typography>
            </Box>

            {/* Info pagatore e data */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Pagato da <strong>{spesa.pagatore}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">·</Typography>
              <Typography variant="caption" color="text.secondary">
                {formattaData(spesa.data)}
              </Typography>
            </Box>

            {/* Quote e divisione */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={DIVISIONE_LABEL[spesa.divisione] || 'Metà/Metà'}
                size="small"
                sx={{ bgcolor: `${categoria.colore}15`, color: categoria.colore, fontWeight: 600 }}
              />
              <Typography variant="caption" color="text.secondary">
                Riccardo: {formattaImporto(quote['Riccardo'] || 0)} · Federico: {formattaImporto(quote['Federico'] || 0)}
              </Typography>
            </Box>
          </Box>

          {/* Bottone elimina — visibile solo all'utente che ha inserito la spesa */}
          {utente === spesa.pagatore && (
            <IconButton
              size="small"
              onClick={() => eliminaSpesa(spesa.id)}
              sx={{ color: 'error.light', flexShrink: 0 }}
            >
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default SpesaCard;