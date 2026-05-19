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
  new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

// Calcola la quota di ogni utente per una singola spesa
// altroUtente: il nome dell'altro utente coinvolto
// divisione: 'metà' | 'tutto_mio' | 'tutto_altro' | 'percentuale'
// percentuale: numero 0-100 (quota di chi ha pagato)
export const calcolaQuote = (importo, pagatore, altroUtente, divisione, percentuale = 50) => {
  let quotaPagatore, quotaAltro;

  switch (divisione) {
    case 'metà':
      quotaPagatore = importo / 2;
      quotaAltro = importo / 2;
      break;
    case 'tutto_mio':
      quotaPagatore = importo;
      quotaAltro = 0;
      break;
    case 'tutto_altro':
      quotaPagatore = 0;
      quotaAltro = importo;
      break;
    case 'percentuale':
      quotaPagatore = (importo * percentuale) / 100;
      quotaAltro = importo - quotaPagatore;
      break;
    default:
      quotaPagatore = importo / 2;
      quotaAltro = importo / 2;
  }

  return {
    [pagatore]: quotaPagatore,
    [altroUtente]: quotaAltro,
  };
};

// Calcola il bilancio complessivo per tutti gli utenti
// Restituisce: debitore, creditore, importoDebito, bilancioPerUtente
export const calcolaBilancio = (spese, utenti = []) => {
  const netti = {};

  spese.forEach(spesa => {
    const altro = spesa.altroUtente
      || utenti.find(u => u.nome !== spesa.pagatore)?.nome;
    if (!altro) return;

    const quote = calcolaQuote(
      spesa.importo,
      spesa.pagatore,
      altro,
      spesa.divisione || 'metà',
      spesa.percentuale || 50
    );

    if (netti[spesa.pagatore] === undefined) netti[spesa.pagatore] = 0;
    if (netti[altro] === undefined) netti[altro] = 0;

    netti[spesa.pagatore] += quote[altro];
    netti[altro] -= quote[altro];
  });

  const nomi = Object.keys(netti);
  if (nomi.length < 2) {
    return { debitore: null, creditore: null, importoDebito: 0, bilancioPerUtente: netti };
  }

  const creditore = nomi.reduce((a, b) => netti[a] > netti[b] ? a : b);
  const debitore = nomi.reduce((a, b) => netti[a] < netti[b] ? a : b);

  return {
    debitore,
    creditore,
    importoDebito: Math.abs(netti[debitore]),
    bilancioPerUtente: netti,
  };
};

// Raggruppa le spese per mese
// es. { "gennaio 2024": [...], "febbraio 2024": [...] }
export const raggruppaPerMese = (spese) => {
  return spese.reduce((acc, spesa) => {
    const mese = new Date(spesa.data).toLocaleDateString('it-IT', {
      month: 'long',
      year: 'numeric'
    });
    if (!acc[mese]) acc[mese] = [];
    acc[mese].push(spesa);
    return acc;
  }, {});
};
