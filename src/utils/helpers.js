// Palette colori disponibili per il tema utente
export const COLORI_TEMA = [
  { valore: '#5C6BC0', secondario: '#26A69A', nome: 'Indaco' },
  { valore: '#26A69A', secondario: '#42A5F5', nome: 'Verde acqua' },
  { valore: '#FF7043', secondario: '#EC407A', nome: 'Arancione' },
  { valore: '#EC407A', secondario: '#AB47BC', nome: 'Rosa' },
  { valore: '#AB47BC', secondario: '#5C6BC0', nome: 'Viola' },
  { valore: '#42A5F5', secondario: '#26A69A', nome: 'Azzurro' },
];

// Formatta un oggetto Date come stringa YYYY-MM-DD nel fuso locale
export const formatoData = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Restituisce la data odierna come stringa YYYY-MM-DD nel fuso locale
// (evita il bug UTC di toISOString() che a mezzanotte può dare ieri)
export const oggiLocale = () => formatoData(new Date());

// Formatta un numero come importo in euro
// es. 85.5 → "€ 85,50"
export const formattaImporto = (n) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

// Formatta una data in formato italiano
// es. "2024-01-15" → "15 gen 2024"
export const formattaData = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

// Calcola la quota di ogni utente per una singola spesa.
// partecipantiOrAltro: array di tutti i partecipanti (incluso pagatore) OPPURE stringa del solo altroUtente (compat legacy)
// divisione: 'equa' | 'metà' | 'tutto_mio' | 'tutto_altro' | 'percentuale'
// percentuale: quota percentuale del pagatore (usata solo con 'percentuale' e 2 partecipanti)
export const calcolaQuote = (importo, pagatore, partecipantiOrAltro, divisione, percentuale = 50) => {
  const partecipanti = typeof partecipantiOrAltro === 'string'
    ? [pagatore, partecipantiOrAltro]
    : partecipantiOrAltro;

  const altri = partecipanti.filter(p => p !== pagatore);
  const result = {};

  switch (divisione) {
    case 'equa':
    case 'metà': {
      const quota = importo / partecipanti.length;
      partecipanti.forEach(p => { result[p] = quota; });
      break;
    }
    case 'tutto_mio':
      partecipanti.forEach(p => { result[p] = p === pagatore ? importo : 0; });
      break;
    case 'tutto_altro':
      partecipanti.forEach(p => {
        result[p] = p === pagatore ? 0 : importo / (altri.length || 1);
      });
      break;
    case 'percentuale':
      result[pagatore] = (importo * percentuale) / 100;
      altri.forEach(p => { result[p] = (importo - result[pagatore]) / (altri.length || 1); });
      break;
    default: {
      const quota = importo / partecipanti.length;
      partecipanti.forEach(p => { result[p] = quota; });
    }
  }

  return result;
};

// Calcola il bilancio complessivo per tutti gli utenti.
// Restituisce: debitore, creditore, importoDebito, bilancioPerUtente, tuttiDebiti
export const calcolaBilancio = (spese, utenti = []) => {
  const netti = {};
  utenti.forEach(u => { netti[u.nome] = 0; });

  spese.forEach(spesa => {
    let partecipanti = spesa.partecipanti;
    if (!partecipanti || partecipanti.length < 2) {
      const altro = spesa.altroUtente || utenti.find(u => u.nome !== spesa.pagatore)?.nome;
      if (!altro) return;
      partecipanti = [spesa.pagatore, altro];
    }

    const quote = calcolaQuote(
      spesa.importo,
      spesa.pagatore,
      partecipanti,
      spesa.divisione || 'equa',
      spesa.percentuale || 50
    );

    partecipanti.forEach(p => {
      if (p === spesa.pagatore) return;
      const quota = quote[p] || 0;
      if (netti[spesa.pagatore] !== undefined) netti[spesa.pagatore] += quota;
      if (netti[p] !== undefined) netti[p] -= quota;
    });
  });

  // Calcola tutte le coppie debitore/creditore con algoritmo greedy
  const tuttiDebiti = [];
  const copia = { ...netti };
  let creditori = Object.keys(copia).filter(n => copia[n] > 0.01);
  let debitori = Object.keys(copia).filter(n => copia[n] < -0.01);
  while (creditori.length && debitori.length) {
    const cred = creditori.reduce((max, nome) => copia[max] > copia[nome] ? max : nome);
    const debt = debitori.reduce((min, nome) => copia[min] < copia[nome] ? min : nome);
    const importo = Math.min(copia[cred], Math.abs(copia[debt]));
    tuttiDebiti.push({ debitore: debt, creditore: cred, importo: Math.round(importo * 100) / 100 });
    copia[cred] -= importo;
    copia[debt] += importo;
    creditori = Object.keys(copia).filter(n => copia[n] > 0.01);
    debitori = Object.keys(copia).filter(n => copia[n] < -0.01);
  }

  const nomi = Object.keys(netti);
  if (nomi.length < 2 || tuttiDebiti.length === 0) {
    return { debitore: null, creditore: null, importoDebito: 0, bilancioPerUtente: netti, tuttiDebiti: [] };
  }

  return {
    debitore: tuttiDebiti[0].debitore,
    creditore: tuttiDebiti[0].creditore,
    importoDebito: tuttiDebiti[0].importo,
    bilancioPerUtente: netti,
    tuttiDebiti,
  };
};

// Restituisce le attività che ricadono in una data specifica (YYYY-MM-DD).
// Tiene conto di tutte le frequenze e della data di fine.
export const getAttivitaPerData = (attivita, dataStr) => {
  const d = new Date(dataStr + 'T00:00:00');
  const giorno = d.getDay();
  const giornoMese = d.getDate();
  const oggi = oggiLocale();

  return attivita.filter(t => {
    if (t.frequenza === 'giornaliera') return true;
    if (t.frequenza === 'settimanale') return t.giornoSettimana === giorno;
    if (t.frequenza === 'mensile') return t.giornoMese === giornoMese;
    if (t.frequenza === 'specifica') return t.dataSpecifica === dataStr;
    return false;
  }).filter(t => {
    if (t.dataFine && t.frequenza !== 'specifica' && t.dataFine < dataStr) return false;
    if (t.frequenza === 'specifica' && t.dataSpecifica < oggi && !t.completato) return false;
    return true;
  });
};

// Raggruppa le spese per mese
// es. { "gennaio 2024": [...], "febbraio 2024": [...] }
export const raggruppaPerMese = (spese) => {
  return spese.reduce((acc, spesa) => {
    const mese = new Date(spesa.data + 'T00:00:00').toLocaleDateString('it-IT', {
      month: 'long',
      year: 'numeric'
    });
    if (!acc[mese]) acc[mese] = [];
    acc[mese].push(spesa);
    return acc;
  }, {});
};
