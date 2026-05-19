import React, { useState } from 'react';
import {
  Card, CardContent, Box, Typography, Divider, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { formattaImporto, calcolaBilancio } from '../../utils/helpers';
import { useSpese } from '../../context/SpeseContext';
import { useApp } from '../../context/AppContext';
import { useImpostazioni } from '../../context/ImpostazioniContext';

function Bilancio() {
  const { spese, aggiungiSpesa } = useSpese();
  const { utenteAttivo, utenti } = useApp();
  const { impostazioni } = useImpostazioni();
  const [dialogSaldo, setDialogSaldo] = useState(null); // { debitore, creditore, importo }
  const [filtroCategoria, setFiltroCategoria] = useState('tutte');

  const coloreApp = utenteAttivo?.coloreApp || '#5C6BC0';
  const coloreSecondario = utenteAttivo?.coloreSecondario || '#26A69A';

  const categoriePresenti = [...new Set(spese.map(s => s.categoria))];
  const speseFiltrate = filtroCategoria === 'tutte'
    ? spese
    : spese.filter(s => s.categoria === filtroCategoria);

  const bilancio = calcolaBilancio(speseFiltrate, utenti);
  const inPari = bilancio.tuttiDebiti.length === 0;

  const pagatoDa = {};
  utenti.forEach(u => { pagatoDa[u.nome] = 0; });
  speseFiltrate.forEach(s => {
    if (pagatoDa[s.pagatore] !== undefined) pagatoDa[s.pagatore] += s.importo;
  });

  const confermaSaldo = () => {
    if (!dialogSaldo) return;
    aggiungiSpesa({
      descrizione: 'Saldo debito',
      importo: dialogSaldo.importo,
      categoria: 'saldo',
      pagatore: dialogSaldo.debitore,
      altroUtente: dialogSaldo.creditore,
      partecipanti: [dialogSaldo.debitore, dialogSaldo.creditore],
      divisione: 'tutto_altro',
      percentuale: 100,
      data: new Date().toISOString().split('T')[0],
      ricorrente: false,
      tipo: 'saldo',
    });
    setDialogSaldo(null);
  };

  const iconaCategoria = (nome) =>
    impostazioni.categorie.find(c => c.nome === nome)?.icona || '📦';

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
          <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1.5 }}>
            📊 Bilancio
          </Typography>

          {/* Filtro categoria */}
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label="Tutte"
              size="small"
              onClick={() => setFiltroCategoria('tutte')}
              sx={{
                bgcolor: filtroCategoria === 'tutte' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
                color: 'white',
                fontWeight: filtroCategoria === 'tutte' ? 700 : 400,
                border: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            />
            {categoriePresenti.filter(c => c !== 'saldo').map(cat => (
              <Chip
                key={cat}
                label={`${iconaCategoria(cat)} ${cat}`}
                size="small"
                onClick={() => setFiltroCategoria(cat)}
                sx={{
                  bgcolor: filtroCategoria === cat ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontWeight: filtroCategoria === cat ? 700 : 400,
                  border: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              />
            ))}
          </Box>

          {inPari ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutlineRoundedIcon />
              <Typography variant="h6" fontWeight={700}>Siete in pari! 🎉</Typography>
            </Box>
          ) : bilancio.tuttiDebiti.length === 1 ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {bilancio.debitore} deve {formattaImporto(bilancio.importoDebito)} a {bilancio.creditore}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => setDialogSaldo({ debitore: bilancio.debitore, creditore: bilancio.creditore, importo: bilancio.importoDebito })}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, borderRadius: 3,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                }}
              >
                Salda
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {bilancio.tuttiDebiti.map((d, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                    {d.debitore} deve {formattaImporto(d.importo)} a {d.creditore}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setDialogSaldo(d)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, borderRadius: 3,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                    }}
                  >
                    Salda
                  </Button>
                </Box>
              ))}
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

      <Dialog open={!!dialogSaldo} onClose={() => setDialogSaldo(null)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>💳 Conferma saldo</DialogTitle>
        <DialogContent>
          {dialogSaldo && (
            <>
              <Typography>
                <strong>{dialogSaldo.debitore}</strong> pagherà{' '}
                <strong>{formattaImporto(dialogSaldo.importo)}</strong>{' '}
                a <strong>{dialogSaldo.creditore}</strong>.
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Verrà registrata una spesa di saldo e il bilancio tornerà a zero.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogSaldo(null)}>Annulla</Button>
          <Button variant="contained" onClick={confermaSaldo}>Conferma</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Bilancio;
