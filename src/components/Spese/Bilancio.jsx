import React, { useState } from 'react';
import {
  Card, CardContent, Box, Typography, Divider, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { formattaImporto, calcolaBilancio } from '../../utils/helpers';
import { useSpese } from '../../context/SpeseContext';
import { useApp } from '../../context/AppContext';

function Bilancio() {
  const { spese, aggiungiSpesa } = useSpese();
  const { utenteAttivo, utenti } = useApp();
  const [dialogSaldo, setDialogSaldo] = useState(false);

  const coloreApp = utenteAttivo?.coloreApp || '#5C6BC0';
  const coloreSecondario = utenteAttivo?.coloreSecondario || '#26A69A';

  const bilancio = calcolaBilancio(spese, utenti);
  const inPari = bilancio.importoDebito < 0.01;

  const pagatoDa = {};
  utenti.forEach(u => { pagatoDa[u.nome] = 0; });
  spese.forEach(s => {
    if (pagatoDa[s.pagatore] !== undefined) pagatoDa[s.pagatore] += s.importo;
  });

  const confermaSaldo = () => {
    aggiungiSpesa({
      descrizione: 'Saldo debito',
      importo: bilancio.importoDebito,
      categoria: 'saldo',
      pagatore: bilancio.debitore,
      altroUtente: bilancio.creditore,
      divisione: 'tutto_altro',
      percentuale: 100,
      data: new Date().toISOString().split('T')[0],
      ricorrente: false,
      tipo: 'saldo',
    });
    setDialogSaldo(false);
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          mb: 3, borderRadius: 3,
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {bilancio.debitore} deve {formattaImporto(bilancio.importoDebito)} a {bilancio.creditore}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => setDialogSaldo(true)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: 3,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                }}
              >
                Salda
              </Button>
            </Box>
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

      <Dialog open={dialogSaldo} onClose={() => setDialogSaldo(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>💳 Conferma saldo</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{bilancio.debitore}</strong> pagherà{' '}
            <strong>{formattaImporto(bilancio.importoDebito)}</strong>{' '}
            a <strong>{bilancio.creditore}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Verrà registrata una spesa di saldo e il bilancio tornerà a zero.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogSaldo(false)}>Annulla</Button>
          <Button variant="contained" onClick={confermaSaldo}>Conferma</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Bilancio;
