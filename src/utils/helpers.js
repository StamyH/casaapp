// Restituisce la data odierna come stringa YYYY-MM-DD nel fuso locale
// (evita il bug UTC di toISOString() che a mezzanotte può dare ieri)
export const oggiLocale = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Formatta un numero come importo in euro
// es. 85.5 → "€ 85,50"
export const formattaImporto = (n) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

// Formatta una data in formato italiano
// es. "2024-01-15" → "15 gen 2024"
export const formattaData = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

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
  for (let i = 0; i < 20; i++) {
    const creditori = Object.keys(copia).filter(n => copia[n] > 0.01);
    const debitori = Object.keys(copia).filter(n => copia[n] < -0.01);
    if (!creditori.length || !debitori.length) break;
    const cred = creditori.reduce((a, b) => copia[a] > copia[b] ? a : b);
    const debt = debitori.reduce((a, b) => copia[a] < copia[b] ? a : b);
    const importo = Math.min(copia[cred], Math.abs(copia[debt]));
    tuttiDebiti.push({ debitore: debt, creditore: cred, importo: Math.round(importo * 100) / 100 });
    copia[cred] -= importo;
    copia[debt] += importo;
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
