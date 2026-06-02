import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Divider, IconButton, LinearProgress, Dialog, DialogTitle, DialogContent } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useApp } from '../context/AppContext';
import { useSpese } from '../context/SpeseContext';
import { useAttivita } from '../context/AttivitaContext';
import { useImpostazioni } from '../context/ImpostazioniContext';
import { formattaImporto, calcolaBilancio, calcolaQuote, oggiLocale, formatoData } from '../utils/helpers';

function chiaveMese(anno, mese) {
  return `${anno}-${String(mese + 1).padStart(2, '0')}`;
}

function Barra({ valore, massimo, colore }) {
  const perc = massimo > 0 ? Math.round((valore / massimo) * 100) : 0;
  return (
    <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden', mt: 0.75 }}>
      <Box sx={{ height: '100%', width: `${perc}%`, bgcolor: colore, borderRadius: 4, transition: 'width 0.5s ease' }} />
    </Box>
  );
}

function TrendChip({ attuale, precedente, nomeMesePrec, inverti, assoluto, coloreNegativo = 'error' }) {
  if (precedente === undefined || precedente === null) return null;
  if (!assoluto && precedente === 0) return null;
  const delta = assoluto
    ? attuale - precedente
    : Math.round(((attuale - precedente) / precedente) * 100);
  if (delta === 0) return null;
  const positivo = delta > 0;
  const buono = inverti ? !positivo : positivo;
  return (
    <Chip
      label={`${positivo ? '▲' : '▼'} ${positivo ? '+' : ''}${delta}${assoluto ? '' : '%'} vs ${nomeMesePrec}`}
      size="small"
      color={buono ? 'success' : coloreNegativo}
      sx={{ fontSize: '0.65rem', height: 22 }}
    />
  );
}

function ColonnaGrafico({ chiave, label, valore, max, meseKey, coloreAttivo, coloreInattivo, formatLabel }) {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.6rem' }}>
        {valore > 0 ? formatLabel(valore) : ''}
      </Typography>
      <Box sx={{
        width: '100%',
        height: Math.max(4, Math.round((valore / max) * 72)),
        bgcolor: chiave === meseKey ? coloreAttivo : coloreInattivo,
        borderRadius: '4px 4px 0 0',
        transition: 'height 0.4s ease',
        opacity: valore === 0 ? 0.3 : 1,
      }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>{label}</Typography>
    </Box>
  );
}

// Calcola quante volte un task avrebbe dovuto essere completato nel mese indicato
function calcolaAttesi(task, anno, mese, oggiStr) {
  const meseKey = chiaveMese(anno, mese);
  if (task.dataFine && task.dataFine < `${meseKey}-01`) return 0;

  const primoCelMese = new Date(anno, mese, 1);
  const ultimoDelMese = new Date(anno, mese + 1, 0);
  // Se il mese è quello corrente, contiamo solo fino a oggi
  const ultimoDelMeseStr = `${ultimoDelMese.getFullYear()}-${String(ultimoDelMese.getMonth() + 1).padStart(2, '0')}-${String(ultimoDelMese.getDate()).padStart(2, '0')}`;
  const fineEffettiva = oggiStr < ultimoDelMeseStr ? new Date(oggiStr + 'T00:00:00') : ultimoDelMese;

  switch (task.frequenza) {
    case 'giornaliera': {
      const ms = fineEffettiva - primoCelMese;
      return Math.floor(ms / 86400000) + 1;
    }
    case 'settimanale': {
      let count = 0;
      const d = new Date(primoCelMese);
      while (d <= fineEffettiva) {
        if (d.getDay() === task.giornoSettimana) count++;
        d.setDate(d.getDate() + 1);
      }
      return count;
    }
    case 'mensile':
      return task.giornoMese <= ultimoDelMese.getDate() ? 1 : 0;
    case 'specifica':
      return task.dataSpecifica?.startsWith(meseKey) ? 1 : 0;
    default:
      return 0;
  }
}

const NOMI_MESI_BREVI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

function Statistiche() {
  const [meseOffset, setMeseOffset] = useState(0);
  const [dialogAperto, setDialogAperto] = useState(false);
  const [annoDialog, setAnnoDialog] = useState(new Date().getFullYear());

  const { utenti } = useApp();
  const { spese } = useSpese();
  const { attivita, storicoCompletamenti } = useAttivita();
  const { impostazioni } = useImpostazioni();

  const oggi = new Date();
  const oggiStr = oggiLocale();
  const dataRif = new Date(oggi.getFullYear(), oggi.getMonth() + meseOffset, 1);
  const dataPrecRif = new Date(dataRif.getFullYear(), dataRif.getMonth() - 1, 1);

  const meseKey = chiaveMese(dataRif.getFullYear(), dataRif.getMonth());
  const meseKeyPrec = chiaveMese(dataPrecRif.getFullYear(), dataPrecRif.getMonth());
  const nomeMese = dataRif.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const nomeMesePrec = dataPrecRif.toLocaleDateString('it-IT', { month: 'long' });

  // --- Spese ---
  const speseDelMese = spese.filter(s => s.data?.startsWith(meseKey));
  const speseDelMesePrec = spese.filter(s => s.data?.startsWith(meseKeyPrec));
  // Escludi i saldi dai totali (sono pareggi contabili, non spese reali)
  const isNotSaldo = s => s.tipo !== 'saldo' && s.categoria !== 'saldo';
  const totaleDelMese = speseDelMese.filter(isNotSaldo).reduce((acc, s) => acc + s.importo, 0);
  const totalePrecedente = speseDelMesePrec.filter(isNotSaldo).reduce((acc, s) => acc + s.importo, 0);
  const bilancio = calcolaBilancio(speseDelMese, utenti);
  const inPari = !bilancio.tuttiDebiti?.length || bilancio.importoDebito < 0.01;

  const spesePerCat = {};
  speseDelMese.filter(s => s.tipo !== 'saldo' && s.categoria !== 'saldo').forEach(s => {
    spesePerCat[s.categoria] = (spesePerCat[s.categoria] || 0) + s.importo;
  });
  const categorieSorted = Object.entries(spesePerCat).sort(([, a], [, b]) => b - a);
  const maxCat = categorieSorted[0]?.[1] || 1;

  const pagatoDa = {};
  const quotaPerUtente = {};
  utenti.forEach(u => { pagatoDa[u.nome] = 0; quotaPerUtente[u.nome] = 0; });
  speseDelMese.filter(s => s.tipo !== 'saldo' && s.categoria !== 'saldo').forEach(s => {
    if (pagatoDa[s.pagatore] !== undefined) pagatoDa[s.pagatore] += s.importo;
    const partecipanti = s.partecipanti?.length >= 2
      ? s.partecipanti
      : [s.pagatore, s.altroUtente || utenti.find(u => u.nome !== s.pagatore)?.nome].filter(Boolean);
    if (partecipanti.length < 2) return;
    const quote = calcolaQuote(s.importo, s.pagatore, partecipanti, s.divisione || 'metà', s.percentuale || 50);
    Object.entries(quote).forEach(([nome, q]) => {
      if (quotaPerUtente[nome] !== undefined) quotaPerUtente[nome] += q;
    });
  });
  const maxPagato = Math.max(...Object.values(pagatoDa), 1);

  // --- Attività storico ---
  const completamentiDelMese = storicoCompletamenti.filter(s => s.data?.startsWith(meseKey));
  const completamentiDelMesePrec = storicoCompletamenti.filter(s => s.data?.startsWith(meseKeyPrec));

  const statsAttivita = utenti.map(u => ({
    utente: u,
    completamenti: completamentiDelMese.filter(s => s.completatoDa === u.nome).length,
    precedente: completamentiDelMesePrec.filter(s => s.completatoDa === u.nome).length,
  }));
  const maxCompletamenti = Math.max(...statsAttivita.map(s => s.completamenti), 1);
  const totaleCompletamentiMese = completamentiDelMese.length;
  const totaleCompletamentiPrec = completamentiDelMesePrec.length;

  // --- Task più trascurate ---
  const ultimoDelMese = new Date(dataRif.getFullYear(), dataRif.getMonth() + 1, 0);
  const oggiStrPerAttesi = meseOffset === 0 ? oggiStr : formatoData(ultimoDelMese);
  const taskConTasso = attivita
    .map(task => {
      const attesi = calcolaAttesi(task, dataRif.getFullYear(), dataRif.getMonth(), oggiStrPerAttesi);
      if (attesi === 0) return null;
      const effettivi = completamentiDelMese.filter(c => c.taskId === task.id).length;
      const tasso = Math.round((effettivi / attesi) * 100);
      return { task, attesi, effettivi, tasso };
    })
    .filter(Boolean)
    .sort((a, b) => a.tasso - b.tasso)
    .slice(0, 5);

  // --- Andamento 6 mesi centrato sul mese selezionato (cappato a oggi) ---
  const oggiKey = chiaveMese(oggi.getFullYear(), oggi.getMonth());
  const ultimi6Mesi = [];
  for (let i = 5; i >= 0; i--) {
    const dataMese = new Date(dataRif.getFullYear(), dataRif.getMonth() - i, 1);
    const key = chiaveMese(dataMese.getFullYear(), dataMese.getMonth());
    if (key > oggiKey) continue;
    const label = dataMese.toLocaleDateString('it-IT', { month: 'short' });
    const completamenti = storicoCompletamenti.filter(s => s.data?.startsWith(key)).length;
    const totaleSpese = spese.filter(s => s.data?.startsWith(key) && s.tipo !== 'saldo').reduce((acc, s) => acc + s.importo, 0);
    ultimi6Mesi.push({ key, label, completamenti, totaleSpese });
  }
  const maxCompMesi = Math.max(...ultimi6Mesi.map(m => m.completamenti), 1);
  const maxSpeseMesi = Math.max(...ultimi6Mesi.map(m => m.totaleSpese), 1);

  const getIconaCategoria = (nome) =>
    impostazioni.categorie.find(c => c.nome === nome)?.icona || '📦';

  const getColoreUtente = (nome) =>
    utenti.find(u => u.nome === nome)?.coloreAvatar || '#5C6BC0';

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>


      {/* Navigazione mese */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover', borderRadius: 3, px: 1 }}>
        <IconButton onClick={() => setMeseOffset(p => p - 1)} disabled={meseOffset <= -24}>
          <ChevronLeftRoundedIcon />
        </IconButton>
        <Box
          onClick={() => { setAnnoDialog(dataRif.getFullYear()); setDialogAperto(true); }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', py: 1 }}
        >
          <Typography variant="subtitle1" fontWeight={700} textTransform="capitalize">
            {nomeMese}
          </Typography>
          <CalendarMonthRoundedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
        </Box>
        <IconButton onClick={() => setMeseOffset(p => p + 1)} disabled={meseOffset >= 0}>
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>

      {/* Picker mese/anno */}
      <Dialog open={dialogAperto} onClose={() => setDialogAperto(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton size="small" onClick={() => setAnnoDialog(p => p - 1)} disabled={annoDialog <= oggi.getFullYear() - 2}>
              <ChevronLeftRoundedIcon />
            </IconButton>
            <Typography fontWeight={700}>{annoDialog}</Typography>
            <IconButton size="small" onClick={() => setAnnoDialog(p => p + 1)} disabled={annoDialog >= oggi.getFullYear()}>
              <ChevronRightRoundedIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {NOMI_MESI_BREVI.map((nome, idx) => {
              const targetKey = chiaveMese(annoDialog, idx);
              const isFuturo = targetKey > oggiKey;
              const isTroppoVecchio = targetKey < chiaveMese(oggi.getFullYear() - 2, oggi.getMonth());
              const isSelezionato = targetKey === meseKey;
              if (isFuturo || isTroppoVecchio) {
                return (
                  <Box key={idx} sx={{ p: 1, textAlign: 'center', borderRadius: 2, opacity: 0.3 }}>
                    <Typography variant="body2">{nome}</Typography>
                  </Box>
                );
              }
              const diffMesi = (annoDialog - oggi.getFullYear()) * 12 + (idx - oggi.getMonth());
              return (
                <Box
                  key={idx}
                  onClick={() => { setMeseOffset(diffMesi); setDialogAperto(false); }}
                  sx={{
                    p: 1, textAlign: 'center', borderRadius: 2, cursor: 'pointer',
                    bgcolor: isSelezionato ? 'primary.main' : 'action.hover',
                    '&:hover': { bgcolor: isSelezionato ? 'primary.dark' : 'action.selected' },
                  }}
                >
                  <Typography variant="body2" fontWeight={isSelezionato ? 700 : 400} color={isSelezionato ? 'primary.contrastText' : 'text.primary'}>
                    {nome}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Bilancio del mese */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>💰 Bilancio del mese</Typography>
            <TrendChip attuale={totaleDelMese} precedente={totalePrecedente} nomeMesePrec={nomeMesePrec} inverti />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">Totale spese</Typography>
            <Typography variant="body2" fontWeight={700}>{formattaImporto(totaleDelMese)}</Typography>
          </Box>
          <Divider sx={{ mb: 1.5 }} />
          {speseDelMese.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nessuna spesa questo mese.</Typography>
          ) : inPari ? (
            <Typography variant="body2" fontWeight={600} color="success.main">Siete in pari 🎉</Typography>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Avatar sx={{ bgcolor: getColoreUtente(bilancio.debitore), width: 28, height: 28, fontSize: '0.75rem', fontWeight: 700 }}>
                {bilancio.debitore?.[0]}
              </Avatar>
              <Typography variant="body2">
                <strong>{bilancio.debitore}</strong> deve <strong>{formattaImporto(bilancio.importoDebito)}</strong> a <strong>{bilancio.creditore}</strong>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Spese per categoria */}
      {categorieSorted.length > 0 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>🗂️ Per categoria</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {categorieSorted.map(([nome, totale]) => {
                const perc = totaleDelMese > 0 ? Math.round((totale / totaleDelMese) * 100) : 0;
                return (
                  <Box key={nome}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {getIconaCategoria(nome)} {nome.charAt(0).toUpperCase() + nome.slice(1)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">{perc}%</Typography>
                        <Typography variant="body2" fontWeight={700}>{formattaImporto(totale)}</Typography>
                      </Box>
                    </Box>
                    <Barra valore={totale} massimo={maxCat} colore="primary.main" />
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Pagamenti per utente */}
      {utenti.length > 0 && totaleDelMese > 0 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>💳 Pagamenti</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {utenti.map(u => (
                <Box key={u.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: u.coloreAvatar, width: 28, height: 28, fontSize: '0.75rem', fontWeight: 700 }}>
                        {u.nome[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{u.nome}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          quota {formattaImporto(quotaPerUtente[u.nome] || 0)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>
                      {formattaImporto(pagatoDa[u.nome] || 0)}
                    </Typography>
                  </Box>
                  <Barra valore={pagatoDa[u.nome] || 0} massimo={maxPagato} colore={u.coloreAvatar} />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Attività completate */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>✅ Attività completate</Typography>
            <TrendChip assoluto coloreNegativo="default"
              attuale={totaleCompletamentiMese}
              precedente={totaleCompletamentiPrec}
              nomeMesePrec={nomeMesePrec}
            />
          </Box>

          {totaleCompletamentiMese === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nessuna attività completata {meseOffset === 0 ? 'questo mese' : 'in questo periodo'}.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {statsAttivita.map(({ utente: u, completamenti, precedente }) => (
                <Box key={u.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: u.coloreAvatar, width: 28, height: 28, fontSize: '0.75rem', fontWeight: 700 }}>
                        {u.nome[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{u.nome}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendChip assoluto coloreNegativo="default" attuale={completamenti} precedente={precedente} nomeMesePrec={nomeMesePrec} />
                      <Chip label={completamenti} size="small" color={completamenti > 0 ? 'success' : 'default'} />
                    </Box>
                  </Box>
                  <Barra valore={completamenti} massimo={maxCompletamenti} colore={u.coloreAvatar} />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Task più trascurate */}
      {taskConTasso.length > 0 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={0.5}>📉 Attività più trascurate</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Tasso di completamento rispetto alle attese
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {taskConTasso.map(({ task, attesi, effettivi, tasso }) => (
                <Box key={task.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1, mr: 1 }} noWrap>
                      {task.titolo}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        {effettivi}/{attesi}
                      </Typography>
                      <Chip
                        label={`${tasso}%`}
                        size="small"
                        color={tasso >= 80 ? 'success' : tasso >= 50 ? 'warning' : 'error'}
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={tasso}
                    color={tasso >= 80 ? 'success' : tasso >= 50 ? 'warning' : 'error'}
                    sx={{ mt: 0.75, height: 6, borderRadius: 3, bgcolor: 'action.hover' }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Andamento ultimi 6 mesi */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>📈 Andamento ultimi 6 mesi</Typography>

          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
            Attività completate
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', mb: 2.5 }}>
            {ultimi6Mesi.map(({ key, label, completamenti }) => (
              <ColonnaGrafico key={key} chiave={key} label={label} valore={completamenti}
                max={maxCompMesi} meseKey={meseKey}
                coloreAttivo="primary.main" coloreInattivo="primary.light"
                formatLabel={v => v}
              />
            ))}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
            Spese totali
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            {ultimi6Mesi.map(({ key, label, totaleSpese }) => (
              <ColonnaGrafico key={key} chiave={key} label={label} valore={totaleSpese}
                max={maxSpeseMesi} meseKey={meseKey}
                coloreAttivo="secondary.main" coloreInattivo="secondary.light"
                formatLabel={v => `€${Math.round(v)}`}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
}

export default Statistiche;
