// Formatta un numero come importo in euro
// es. 85.5 → "€ 85,50"
export const formattaImporto = (n) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
  
  // Formatta una data in formato italiano
  // es. "2024-01-15" → "15 gen 2024"
  export const formattaData = (d) =>
    new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  
// Calcola la quota di ogni utente per una singola spesa
// divisione: 'metà' | 'tutto_mio' | 'tutto_altro' | 'percentuale'
// percentuale: numero 0-100 (quota di chi ha pagato)
export const calcolaQuote = (importo, pagatore, divisione, percentuale = 50) => {
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
  
    const altroUtente = pagatore === 'Riccardo' ? 'Federico' : 'Riccardo';
  
    return {
      [pagatore]: quotaPagatore,
      [altroUtente]: quotaAltro,
    };
  };
  
  // Calcola il bilancio complessivo tenendo conto delle divisioni
  export const calcolaBilancio = (spese) => {
    let debitoRiccardo = 0; // quanto deve Riccardo a Federico
    let debitoFederico = 0; // quanto deve Federico a Riccardo
  
    spese.forEach(spesa => {
      const quote = calcolaQuote(
        spesa.importo,
        spesa.pagatore,
        spesa.divisione || 'metà',
        spesa.percentuale || 50
      );
  
      if (spesa.pagatore === 'Riccardo') {
        // Riccardo ha pagato — Federico deve la sua quota a Riccardo
        debitoFederico += quote['Federico'];
      } else {
        // Federico ha pagato — Riccardo deve la sua quota a Federico
        debitoRiccardo += quote['Riccardo'];
      }
    });
  
    // Compensazione — si sottraggono i debiti incrociati
    const differenza = debitoFederico - debitoRiccardo;
  
    return {
      debitore: differenza > 0 ? 'Federico' : 'Riccardo',
      creditore: differenza > 0 ? 'Riccardo' : 'Federico',
      importoDebito: Math.abs(differenza),
      debitoRiccardo,
      debitoFederico,
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