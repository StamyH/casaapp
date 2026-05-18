import React from 'react';
import { Card, CardContent, Box, Typography, Divider } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { formattaImporto, calcolaBilancio } from '../../utils/helpers';
import { useSpese } from '../../context/SpeseContext';
import { useApp } from '../../context/AppContext';

function Bilancio() {
  const { spese } = useSpese();
  const { utenteAttivo, utenti } = useApp();

  const coloreApp = utenteAttivo?.coloreApp || '#5C6BC0';
  const coloreSecondario = utenteAttivo?.coloreSecondario || '#26A69A';

  const bilancio = calcolaBilancio(spese, utenti);
  const inPari = bilancio.importoDebito < 0.01;

  const pagatoDa = {};
  utenti.forEach(u => { pagatoDa[u.nome] = 0; });
  spese.forEach(s => {
    if (pagatoDa[s.pagatore] !== undefined) pagatoDa[s.pagatore] += s.importo;
  });

  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${coloreApp} 0%, ${coloreSecondario} 100%)`,
        color: 'white',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 2 }}>
          📊 Bilancio di {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
        </Typography>

        {inPari ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineRoundedIcon />
            <Typography variant="h6" fontWeight={700}>Siete in pari! 🎉</Typography>
          </Box>
        ) : (
          <Typography variant="h6" fontWeight={700}>
            {bilancio.debitore} deve {formattaImporto(bilancio.importoDebito)} a {bilancio.creditore}
          </Typography>
        )}

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          {utenti.map(u => (
            <Box key={u.id}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Pagato da {u.nome}</Typography>
              <Typography fontWeight={700}>{formattaImporto(pagatoDa[u.nome] || 0)}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default Bilancio;
