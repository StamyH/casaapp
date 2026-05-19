import React from 'react';
import { Box, Typography } from '@mui/material';

function Statistiche() {
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
      <Typography fontSize="3rem">📊</Typography>
      <Typography variant="h6" fontWeight={700}>Statistiche</Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Grafici e analisi su spese e attività in arrivo presto.
      </Typography>
    </Box>
  );
}

export default Statistiche;
