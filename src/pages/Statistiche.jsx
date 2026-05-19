import React from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Divider } from '@mui/material';
import { useApp } from '../context/AppContext';
import { useSpese } from '../context/SpeseContext';
import { useAttivita } from '../context/AttivitaContext';
import { useImpostazioni } from '../context/ImpostazioniContext';
import { formattaImporto, calcolaBilancio, calcolaQuote } from '../utils/helpers';

function Barra({ valore, massimo, colore }) {
  const perc = massimo > 0 ? Math.round((valore / massimo) * 100) : 0;
  return (
    <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden', mt: 0.75 }}>
      <Box sx={{ height: '100%', width: `${perc}%`, bgcolor: colore, borderRadius: 4, transition: 'width 0.6s ease' }} />
    </Box>
  );
}

function Statistiche() {
  const { utenti } = useApp();
  const { spese } = useSpese();
  const { attivita } = useAttivita();
  const { impostazioni } = useImpostazioni();

  const oggi = new Date();
  const meseCorrente = oggi.toISOString().slice(0, 7);
  const nomeMese = oggi.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  const speseDelMese = spese.filter(s => s.data?.startsWith(meseCorrente));
  const totaleDelMese = speseDelMese.reduce((acc, s) => acc + s.importo, 0);
  const bilancio = calcolaBilancio(speseDelMese, utenti);
  const inPari = bilancio.importoDebito < 0.01;

  // Spese per categoria
  const spesePerCat = {};
  speseDelMese.forEach(s => {
    spesePerCat[s.categoria] = (spesePerCat[s.categoria] || 0) + s.importo;
  });
  const categorieSorted = Object.entries(spesePerCat)
    .sort(([, a], [, b]) => b - a);
  const maxCat = categorieSorted[0]?.[1] || 1;

  // Totale pagato per utente
  const pagatoPerUtente = {};
  utenti.forEach(u => { pagatoPerUtente[u.nome] = 0; });
  speseDelMese.forEach(s => {
    if (pagatoPerUtente[s.pagatore] !== undefined) {
      pagatoPerUtente[s.pagatore] += s.importo;
    }
  });
  const maxPagato = Math.max(...Object.values(pagatoPerUtente), 1);

  // Quota effettiva per utente (quanto spetta a ciascuno)
  const quotaPerUtente = {};
  utenti.forEach(u => { quotaPerUtente[u.nome] = 0; });
  speseDelMese.forEach(s => {
    const altro = s.altroUtente || utenti.find(u => u.nome !== s.pagatore)?.nome;
    if (!altro) return;
    const quote = calcolaQuote(s.importo, s.pagatore, altro, s.divisione || 'metà', s.percentuale || 50);
    Object.entries(quote).forEach(([nome, q]) => {
      if (quotaPerUtente[nome] !== undefined) quotaPerUtente[nome] += q;
    });
  });

  // Attività: per ogni utente conta assegnate e completate
  const statsAttivita = utenti.map(u => {
    const assegnate = attivita.filter(a => a.assegnato === u.nome || a.assegnato === 'entrambi');
    const completate = assegnate.filter(a => a.completato);
    return { utente: u, assegnate: assegnate.length, completate: completate.length };
  });
  const maxCompletate = Math.max(...statsAttivita.map(s => s.assegnate), 1);

  const getIconaCategoria = (nome) => {
    const cat = impostazioni.categorie.find(c => c.nome === nome);
    return cat?.icona || '📦';
  };

  const getColoreUtente = (nome) => {
    return utenti.find(u => u.nome === nome)?.coloreAvatar || '#5C6BC0';
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

      <Box>
        <Typography variant="h5" fontWeight={800}>📊 Statistiche</Typography>
        <Typography variant="body2" color="text.secondary" textTransform="capitalize">{nomeMese}</Typography>
      </Box>

      {/* Bilancio del mese */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>💰 Bilancio del mese</Typography>
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

      {/* Chi ha pagato di più */}
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
          <Typography variant="subtitle1" fontWeight={700} mb={2}>✅ Attività</Typography>
          {attivita.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nessuna attività registrata.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {statsAttivita.map(({ utente: u, assegnate, completate }) => {
                const perc = assegnate > 0 ? Math.round((completate / assegnate) * 100) : 0;
                return (
                  <Box key={u.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: u.coloreAvatar, width: 28, height: 28, fontSize: '0.75rem', fontWeight: 700 }}>
                          {u.nome[0]}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>{u.nome}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={`${completate}/${assegnate}`} size="small" color={perc === 100 ? 'success' : 'default'} />
                        <Typography variant="caption" color="text.secondary">{perc}%</Typography>
                      </Box>
                    </Box>
                    <Barra valore={completate} massimo={maxCompletate} colore={u.coloreAvatar} />
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

    </Box>
  );
}

export default Statistiche;
