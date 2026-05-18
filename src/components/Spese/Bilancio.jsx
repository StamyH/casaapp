import React from 'react';
import { Card, CardContent, Box, Typography, Divider } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { formattaImporto, calcolaBilancio, calcolaQuote } from '../../utils/helpers';
import { useSpese } from '../../context/SpeseContext';
import { useImpostazioni } from '../../context/ImpostazioniContext';
import { useApp } from '../../context/AppContext';

function Bilancio() {
  const { spese } = useSpese();
  const { impostazioni } = useImpostazioni();
  const { utente } = useApp();
  const isFederico = utente === 'Federico';
  const coloreApp = impostazioni[isFederico ? 'coloreAppFederico' : 'coloreAppRiccardo'] || '#5C6BC0';
  const coloreSecondario = impostazioni[isFederico ? 'coloreSecondarioFederico' : 'coloreSecondarioRiccardo'] || '#26A69A';
  const bilancio = calcolaBilancio(spese);
  const inPari = bilancio.importoDebito < 0.01;

  // Calcola il totale effettivo pagato da ciascuno (importo reale uscito dal portafoglio)
  const pagatoDaRiccardo = spese
    .filter(s => s.pagatore === 'Riccardo')
    .reduce((acc, s) => acc + s.importo, 0);

  const pagatoDaFederico = spese
    .filter(s => s.pagatore === 'Federico')
    .reduce((acc, s) => acc + s.importo, 0);

  // Calcola la quota effettiva a carico di ciascuno
  const aCaricoDi = { Riccardo: 0, Federico: 0 };
  spese.forEach(spesa => {
    const quote = calcolaQuote(spesa.importo, spesa.pagatore, spesa.divisione, spesa.percentuale);
    aCaricoDi['Riccardo'] += quote['Riccardo'] || 0;
    aCaricoDi['Federico'] += quote['Federico'] || 0;
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

        {/* Situazione attuale */}
        {inPari ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleOutlineRoundedIcon />
                <Typography variant="h6" fontWeight={700}>
                    Siete in pari! 🎉
                </Typography>
            </Box>
        ) : (
            <Typography variant="h6" fontWeight={700}>
                {bilancio.debitore} deve {formattaImporto(bilancio.importoDebito)} a {bilancio.creditore}
            </Typography>
        )}

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />

        {/* Totali pagato */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Pagato da Riccardo</Typography>
            <Typography fontWeight={700}>{formattaImporto(pagatoDaRiccardo)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Pagato da Federico</Typography>
            <Typography fontWeight={700}>{formattaImporto(pagatoDaFederico)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1.5 }} />

        {/* Totali a carico */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>A carico di Riccardo</Typography>
            <Typography fontWeight={700}>{formattaImporto(aCaricoDi['Riccardo'])}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>A carico di Federico</Typography>
            <Typography fontWeight={700}>{formattaImporto(aCaricoDi['Federico'])}</Typography>
          </Box>
        </Box>

      </CardContent>
    </Card>
  );
}

export default Bilancio;