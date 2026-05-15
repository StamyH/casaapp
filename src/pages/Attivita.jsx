import React from 'react';
import { Box, Typography } from '@mui/material';

// Schermata attività — mostrerà i task domestici
function Attivita() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        ✅ Attività
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Modulo attività — in costruzione
      </Typography>
    </Box>
  );
}

export default Attivita;