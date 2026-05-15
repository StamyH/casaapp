import React from 'react';
import { Box, Typography } from '@mui/material';

// Schermata spese — mostrerà lista spese e bilancio
function Spese() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        💸 Spese
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Modulo spese — in costruzione
      </Typography>
    </Box>
  );
}

export default Spese;