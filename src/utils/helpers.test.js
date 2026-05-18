import { formattaImporto, calcolaQuote, calcolaBilancio } from './helpers';

const normalizza = (str) => str.replace(/\s/g, ' ');

describe('formattaImporto', () => {
  test('formatta un importo intero', () => {
    expect(normalizza(formattaImporto(100))).toBe('100,00 €');
  });

  test('formatta un importo decimale', () => {
    expect(normalizza(formattaImporto(85.5))).toBe('85,50 €');
  });

  test('formatta zero', () => {
    expect(normalizza(formattaImporto(0))).toBe('0,00 €');
  });
});

describe('calcolaQuote', () => {
  test('divisione metà', () => {
    const quote = calcolaQuote(100, 'Riccardo', 'metà', 50);
    expect(quote['Riccardo']).toBe(50);
    expect(quote['Federico']).toBe(50);
  });

  test('tutto mio — chi paga si accolla tutto', () => {
    const quote = calcolaQuote(100, 'Riccardo', 'tutto_mio', 100);
    expect(quote['Riccardo']).toBe(100);
    expect(quote['Federico']).toBe(0);
  });

  test('tutto altro — chi paga anticipa per l\'altro', () => {
    const quote = calcolaQuote(100, 'Riccardo', 'tutto_altro', 0);
    expect(quote['Riccardo']).toBe(0);
    expect(quote['Federico']).toBe(100);
  });

  test('percentuale custom', () => {
    const quote = calcolaQuote(100, 'Riccardo', 'percentuale', 70);
    expect(quote['Riccardo']).toBe(70);
    expect(quote['Federico']).toBe(30);
  });
});

describe('calcolaBilancio', () => {
  test('nessuna spesa — siete in pari', () => {
    const bilancio = calcolaBilancio([]);
    expect(bilancio.importoDebito).toBe(0);
  });

  test('calcola correttamente chi deve cosa', () => {
    const spese = [
      { importo: 100, pagatore: 'Riccardo', divisione: 'metà', percentuale: 50 },
    ];
    const bilancio = calcolaBilancio(spese);
    expect(bilancio.debitore).toBe('Federico');
    expect(bilancio.importoDebito).toBe(50);
  });
});
