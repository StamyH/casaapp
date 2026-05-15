import React from 'react';
import { Box, Typography } from '@mui/material';

// Schermata principale — mostrerà il riepilogo spese e attività del giorno
function Home() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        👋 Benvenuti
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Schermata principale — in costruzione
      </Typography>
    </Box>
  );
}

export default Home;