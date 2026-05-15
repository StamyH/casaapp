import React from 'react';
import { Box, Typography } from '@mui/material';

function Impostazioni() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        ⚙️ Impostazioni
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Modulo impostazioni — in costruzione
      </Typography>
    </Box>
  );
}

export default Impostazioni;