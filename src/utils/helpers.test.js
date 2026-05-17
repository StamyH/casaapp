import { calcolaQuote, calcolaBilancio, formattaImporto } from './helpers';

// --- calcolaQuote ---

describe('calcolaQuote', () => {
  test('divisione metà — importo pari', () => {
    const quote = calcolaQuote(100, 'Riccardo', 'metà');
    expect(quote['Riccardo']).toBe(50);
    expect(quote['Federico']).toBe(50);
  });

  test('divisione metà — importo dispari', () => {
    const quote = calcolaQuote(85.5, 'Riccardo', 'metà');
    expect(quote['Riccardo']).toBe(42.75);
    expect(quote['Federico']).toBe(42.75);
  });

  test('tutto_mio — tutto a carico di chi paga', () => {
    const quote = calcolaQuote(200, 'Federico', 'tutto_mio');
    expect(quote['Federico']).toBe(200);
    expect(quote['Riccardo']).toBe(0);
  });

  test('tutto_altro — tutto a carico dell altro', () => {
    const quote = calcolaQuote(200, 'Riccardo', 'tutto_altro');
    expect(quote['Riccardo']).toBe(0);
    expect(quote['Federico']).toBe(200);
  });

  test('percentuale — 70% a Riccardo', () => {
    const quote = calcolaQuote(100, 'Riccardo', 'percentuale', 70);
    expect(quote['Riccardo']).toBe(70);
    expect(quote['Federico']).toBe(30);
  });

  test('percentuale — 0% al pagatore', () => {
    const quote = calcolaQuote(100, 'Federico', 'percentuale', 0);
    expect(quote['Federico']).toBe(0);
    expect(quote['Riccardo']).toBe(100);
  });

  test('divisione sconosciuta — fallback a metà', () => {
    const quote = calcolaQuote(100, 'Riccardo', 'sconosciuta');
    expect(quote['Riccardo']).toBe(50);
    expect(quote['Federico']).toBe(50);
  });
});

// --- calcolaBilancio ---

describe('calcolaBilancio', () => {
  test('nessuna spesa — importo debito zero', () => {
    const bilancio = calcolaBilancio([]);
    expect(bilancio.importoDebito).toBe(0);
  });

  test('una spesa metà — Federico deve metà a Riccardo', () => {
    const spese = [
      { importo: 100, pagatore: 'Riccardo', divisione: 'metà', percentuale: 50 }
    ];
    const bilancio = calcolaBilancio(spese);
    expect(bilancio.debitore).toBe('Federico');
    expect(bilancio.creditore).toBe('Riccardo');
    expect(bilancio.importoDebito).toBe(50);
  });

  test('due spese uguali da pagatori diversi — in pari', () => {
    const spese = [
      { importo: 100, pagatore: 'Riccardo', divisione: 'metà', percentuale: 50 },
      { importo: 100, pagatore: 'Federico', divisione: 'metà', percentuale: 50 },
    ];
    const bilancio = calcolaBilancio(spese);
    expect(bilancio.importoDebito).toBeCloseTo(0);
  });

  test('spesa tutto_altro — debitore è chi ha pagato', () => {
    const spese = [
      { importo: 80, pagatore: 'Riccardo', divisione: 'tutto_altro', percentuale: 100 }
    ];
    const bilancio = calcolaBilancio(spese);
    expect(bilancio.debitore).toBe('Federico');
    expect(bilancio.importoDebito).toBe(80);
  });

  test('compensazione incrociata — debiti si sottraggono', () => {
    const spese = [
      { importo: 100, pagatore: 'Riccardo', divisione: 'metà', percentuale: 50 },
      { importo: 40, pagatore: 'Federico', divisione: 'metà', percentuale: 50 },
    ];
    // Federico deve 50 a Riccardo, Riccardo deve 20 a Federico → Federico deve 30 netto
    const bilancio = calcolaBilancio(spese);
    expect(bilancio.debitore).toBe('Federico');
    expect(bilancio.importoDebito).toBeCloseTo(30);
  });
});

// --- formattaImporto ---

describe('formattaImporto', () => {
  test('formatta zero', () => {
    expect(formattaImporto(0)).toContain('0');
  });

  test('contiene il simbolo euro', () => {
    expect(formattaImporto(100)).toContain('€');
  });

  test('formatta decimali', () => {
    expect(formattaImporto(85.5)).toContain('85');
  });
});