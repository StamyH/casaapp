import React, { useState } from 'react';
import {
  Card, CardContent, Box, Typography, Divider, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Collapse, IconButton,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { formattaImporto, calcolaBilancio, formattaData, oggiLocale } from '../../utils/helpers';
import { useSpese } from '../../context/SpeseContext';
import { useApp } from '../../context/AppContext';
import { useImpostazioni } from '../../context/ImpostazioniContext';

function Bilancio() {
  const { spese, aggiungiSpesa } = useSpese();
  const { utenteAttivo, utenti } = useApp();
  const { impostazioni } = useImpostazioni();
  const [dialogSaldo, setDialogSaldo] = useState(null);
  const [modalitaFiltro, setModalitaFiltro] = useState('tutte'); // 'tutte' | 'selezione'
  const [categorieSelezionate, setCategorieSelezionate] = useState([]);
  const [dialogCategorie, setDialogCategorie] = useState(false);
  const [storicoAperto, setStoricoAperto] = useState(false);
  const [quotaAperta, setQuotaAperta] = useState(false);

  const coloreApp = utenteAttivo?.coloreApp || '#5C6BC0';
  const coloreSecondario = utenteAttivo?.coloreSecondario || '#26A69A';

  const categoriePresenti = [...new Set(spese.filter(s => s.categoria !== 'saldo').map(s => s.categoria))];
  const speseFiltrate = modalitaFiltro === 'tutte' || categorieSelezionate.length === 0
    ? spese
    : spese.filter(s => categorieSelezionate.includes(s.categoria) || s.categoria === 'saldo');

  const filtroAttivo = modalitaFiltro === 'selezione' && categorieSelezionate.length > 0;

  const bilancio = calcolaBilancio(speseFiltrate, utenti);
  const inPari = bilancio.tuttiDebiti.length === 0;

  const pagatoDa = {};
  utenti.forEach(u => { pagatoDa[u.nome] = 0; });
  // Escludi i saldi dal "pagato da" (sono solo pareggi di debito, non spese reali)
  speseFiltrate.filter(s => s.tipo !== 'saldo' && s.categoria !== 'saldo').forEach(s => {
    if (pagatoDa[s.pagatore] !== undefined) pagatoDa[s.pagatore] += s.importo;
  });

  const storicoSaldi = spese
    .filter(s => s.tipo === 'saldo' || s.categoria === 'saldo')
    .sort((a, b) => b.data.localeCompare(a.data));

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
      data: oggiLocale(),
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

          {/* Filtro categoria — 2 tasti */}
          <Box sx={{ display: 'flex', gap: 1, mb: filtroAttivo ? 1 : 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={modalitaFiltro}
              exclusive
              onChange={(e, val) => { if (val) setModalitaFiltro(val); }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'rgba(255,255,255,0.7)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  fontSize: '0.75rem',
                  py: 0.5,
                  '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700 },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                },
              }}
            >
              <ToggleButton value="tutte">Tutte</ToggleButton>
              <ToggleButton value="selezione" onClick={() => { setModalitaFiltro('selezione'); setDialogCategorie(true); }}>
                Seleziona {categorieSelezionate.length > 0 ? `(${categorieSelezionate.length})` : ''}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Chip categorie selezionate */}
          {filtroAttivo && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              {categorieSelezionate.map(cat => (
                <Chip
                  key={cat}
                  label={`${iconaCategoria(cat)} ${cat}`}
                  size="small"
                  onDelete={() => setCategorieSelezionate(prev => prev.filter(c => c !== cat))}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.7rem',
                    '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' } }}
                />
              ))}
            </Box>
          )}

          {filtroAttivo && !inPari && (
            <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', mb: 1 }}>
              Rimuovi il filtro categoria per poter saldare il debito totale
            </Typography>
          )}

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
                disabled={filtroAttivo}
                onClick={() => setDialogSaldo({ debitore: bilancio.debitore, creditore: bilancio.creditore, importo: bilancio.importoDebito })}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, borderRadius: 3,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                  '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' },
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
                    disabled={filtroAttivo}
                    onClick={() => setDialogSaldo(d)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, borderRadius: 3,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                      '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' },
                    }}
                  >
                    Salda
                  </Button>
                </Box>
              ))}
            </Box>
          )}

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />

          {/* Quote pagate — retraibile */}
          <Box
            onClick={() => setQuotaAperta(p => !p)}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', mb: quotaAperta ? 1 : 0, opacity: 0.85 }}
          >
            <Typography variant="caption" fontWeight={600}>
              💰 Quote pagate ({utenti.length})
            </Typography>
            <IconButton size="small" sx={{ color: 'white', p: 0 }}>
              {quotaAperta ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
            </IconButton>
          </Box>
          <Collapse in={quotaAperta}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: storicoSaldi.length > 0 ? 1.5 : 0 }}>
              {utenti.map(u => (
                <Box key={u.id}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Pagato da {u.nome}</Typography>
                  <Typography fontWeight={700}>{formattaImporto(pagatoDa[u.nome] || 0)}</Typography>
                </Box>
              ))}
            </Box>
          </Collapse>

          {storicoSaldi.length > 0 && (
            <>
              <Box
                onClick={() => setStoricoAperto(p => !p)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', opacity: 0.85 }}
              >
                <Typography variant="caption" fontWeight={600}>
                  💳 Storico saldi ({storicoSaldi.length})
                </Typography>
                <IconButton size="small" sx={{ color: 'white', p: 0 }}>
                  {storicoAperto ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Collapse in={storicoAperto}>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {storicoSaldi.map(s => (
                    <Box key={s.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {s.pagatore} → {s.altroUtente || s.partecipanti?.find(p => p !== s.pagatore)}
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" fontWeight={700}>{formattaImporto(s.importo)}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', fontSize: '0.6rem' }}>
                          {formattaData(s.data)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog selezione categorie */}
      <Dialog open={dialogCategorie} onClose={() => setDialogCategorie(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Seleziona categorie</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
            {categoriePresenti.map(cat => {
              const selezionata = categorieSelezionate.includes(cat);
              return (
                <Chip
                  key={cat}
                  label={`${iconaCategoria(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                  onClick={() => setCategorieSelezionate(prev =>
                    selezionata ? prev.filter(c => c !== cat) : [...prev, cat]
                  )}
                  color={selezionata ? 'primary' : 'default'}
                  variant={selezionata ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 600 }}
                />
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setCategorieSelezionate([]); setModalitaFiltro('tutte'); setDialogCategorie(false); }}>
            Azzera
          </Button>
          <Button variant="contained" onClick={() => setDialogCategorie(false)}>Applica</Button>
        </DialogActions>
      </Dialog>

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
