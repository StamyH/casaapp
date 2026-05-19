import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Divider, IconButton } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useApp } from '../context/AppContext';
import { useSpese } from '../context/SpeseContext';
import { useAttivita } from '../context/AttivitaContext';
import { useImpostazioni } from '../context/ImpostazioniContext';
import { formattaImporto, calcolaBilancio, calcolaQuote } from '../utils/helpers';

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

function TrendChip({ attuale, precedente, nomeMesePrec, inverti }) {
  if (!precedente || precedente === 0) return null;
  const delta = Math.round(((attuale - precedente) / precedente) * 100);
  if (delta === 0) return null;
  const positivo = delta > 0;
  const buono = inverti ? !positivo : positivo;
  return (
    <Chip
      label={`${positivo ? '▲' : '▼'} ${positivo ? '+' : ''}${delta}% vs ${nomeMesePrec}`}
      size="small"
      color={buono ? 'success' : 'error'}
      sx={{ fontSize: '0.65rem', height: 22 }}
    />
  );
}

function TrendChipAssoluto({ attuale, precedente, nomeMesePrec }) {
  if (precedente === undefined || precedente === null) return null;
  const delta = attuale - precedente;
  if (delta === 0) return null;
  const positivo = delta > 0;
  return (
    <Chip
      label={`${positivo ? '▲' : '▼'} ${positivo ? '+' : ''}${delta} vs ${nomeMesePrec}`}
      size="small"
      color={positivo ? 'success' : 'default'}
      sx={{ fontSize: '0.65rem', height: 22 }}
    />
  );
}

function Statistiche() {
  const [meseOffset, setMeseOffset] = useState(0);

  const { utenti } = useApp();
  const { spese } = useSpese();
  const { storicoCompletamenti } = useAttivita();
  const { impostazioni } = useImpostazioni();

  const oggi = new Date();
  const dataRif = new Date(oggi.getFullYear(), oggi.getMonth() + meseOffset, 1);
  const dataPrecRif = new Date(dataRif.getFullYear(), dataRif.getMonth() - 1, 1);

  const meseKey = chiaveMese(dataRif.getFullYear(), dataRif.getMonth());
  const meseKeyPrec = chiaveMese(dataPrecRif.getFullYear(), dataPrecRif.getMonth());
  const nomeMese = dataRif.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const nomeMesePrec = dataPrecRif.toLocaleDateString('it-IT', { month: 'long' });

  // --- Spese ---
  const speseDelMese = spese.filter(s => s.data?.startsWith(meseKey));
  const speseDelMesePrec = spese.filter(s => s.data?.startsWith(meseKeyPrec));
  const totaleDelMese = speseDelMese.reduce((acc, s) => acc + s.importo, 0);
  const totalePrecedente = speseDelMesePrec.reduce((acc, s) => acc + s.importo, 0);
  const bilancio = calcolaBilancio(speseDelMese, utenti);
  const inPari = bilancio.importoDebito < 0.01;

  const spesePerCat = {};
  speseDelMese.forEach(s => {
    spesePerCat[s.categoria] = (spesePerCat[s.categoria] || 0) + s.importo;
  });
  const categorieSorted = Object.entries(spesePerCat).sort(([, a], [, b]) => b - a);
  const maxCat = categorieSorted[0]?.[1] || 1;

  const pagatoPerUtente = {};
  const quotaPerUtente = {};
  utenti.forEach(u => { pagatoPerUtente[u.nome] = 0; quotaPerUtente[u.nome] = 0; });
  speseDelMese.forEach(s => {
    if (pagatoPerUtente[s.pagatore] !== undefined) pagatoPerUtente[s.pagatore] += s.importo;
    const altro = s.altroUtente || utenti.find(u => u.nome !== s.pagatore)?.nome;
    if (!altro) return;
    const quote = calcolaQuote(s.importo, s.pagatore, altro, s.divisione || 'metà', s.percentuale || 50);
    Object.entries(quote).forEach(([nome, q]) => {
      if (quotaPerUtente[nome] !== undefined) quotaPerUtente[nome] += q;
    });
  });
  const maxPagato = Math.max(...Object.values(pagatoPerUtente), 1);

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

  const getIconaCategoria = (nome) =>
    impostazioni.categorie.find(c => c.nome === nome)?.icona || '📦';

  const getColoreUtente = (nome) =>
    utenti.find(u => u.nome === nome)?.coloreAvatar || '#5C6BC0';

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

      <Typography variant="h5" fontWeight={800}>📊 Statistiche</Typography>

      {/* Navigazione mese */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover', borderRadius: 3, px: 1 }}>
        <IconButton onClick={() => setMeseOffset(p => p - 1)} disabled={meseOffset <= -24}>
          <ChevronLeftRoundedIcon />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700} textTransform="capitalize">
          {nomeMese}
        </Typography>
        <IconButton onClick={() => setMeseOffset(p => p + 1)} disabled={meseOffset >= 0}>
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>

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
                      {formattaImporto(pagatoPerUtente[u.nome] || 0)}
                    </Typography>
                  </Box>
                  <Barra valore={pagatoPerUtente[u.nome] || 0} massimo={maxPagato} colore={u.coloreAvatar} />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Attività */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>✅ Attività completate</Typography>
            <TrendChipAssoluto
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
                      <TrendChipAssoluto attuale={completamenti} precedente={precedente} nomeMesePrec={nomeMesePrec} />
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

    </Box>
  );
}

export default Statistiche;
