import { oggiLocale, formattaImporto, calcolaQuote, calcolaBilancio } from './helpers';

const normalizza = (str) => str.replace(/\s/g, ' ');

const UTENTI = [
  { id: 'u1', nome: 'Riccardo' },
  { id: 'u2', nome: 'Federico' },
];

const UTENTI_3 = [
  { id: 'u1', nome: 'Riccardo' },
  { id: 'u2', nome: 'Federico' },
  { id: 'u3', nome: 'Marco' },
];

// ─── oggiLocale ───────────────────────────────────────────────────────────────

describe('oggiLocale', () => {
  test('restituisce una stringa in formato YYYY-MM-DD', () => {
    expect(oggiLocale()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('corrisponde alla data locale di oggi', () => {
    const d = new Date();
    const atteso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(oggiLocale()).toBe(atteso);
  });
});

// ─── formattaImporto ──────────────────────────────────────────────────────────

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

// ─── calcolaQuote ─────────────────────────────────────────────────────────────

describe('calcolaQuote — 2 utenti (API legacy con stringa)', () => {
  test('divisione metà', () => {
    const q = calcolaQuote(100, 'Riccardo', 'Federico', 'metà');
    expect(q['Riccardo']).toBe(50);
    expect(q['Federico']).toBe(50);
  });

  test('tutto mio — chi paga si accolla tutto', () => {
    const q = calcolaQuote(100, 'Riccardo', 'Federico', 'tutto_mio');
    expect(q['Riccardo']).toBe(100);
    expect(q['Federico']).toBe(0);
  });

  test("tutto altro — chi paga anticipa per l'altro", () => {
    const q = calcolaQuote(100, 'Riccardo', 'Federico', 'tutto_altro');
    expect(q['Riccardo']).toBe(0);
    expect(q['Federico']).toBe(100);
  });

  test('percentuale custom 70/30', () => {
    const q = calcolaQuote(100, 'Riccardo', 'Federico', 'percentuale', 70);
    expect(q['Riccardo']).toBe(70);
    expect(q['Federico']).toBe(30);
  });
});

describe('calcolaQuote — 3 utenti (API nuova con array)', () => {
  test('divisione equa tra 3', () => {
    const q = calcolaQuote(90, 'Riccardo', ['Riccardo', 'Federico', 'Marco'], 'equa');
    expect(q['Riccardo']).toBe(30);
    expect(q['Federico']).toBe(30);
    expect(q['Marco']).toBe(30);
  });

  test('tutto mio tra 3 — gli altri non devono nulla', () => {
    const q = calcolaQuote(90, 'Riccardo', ['Riccardo', 'Federico', 'Marco'], 'tutto_mio');
    expect(q['Riccardo']).toBe(90);
    expect(q['Federico']).toBe(0);
    expect(q['Marco']).toBe(0);
  });

  test('tutto altro tra 3 — costo diviso tra gli altri due', () => {
    const q = calcolaQuote(90, 'Riccardo', ['Riccardo', 'Federico', 'Marco'], 'tutto_altro');
    expect(q['Riccardo']).toBe(0);
    expect(q['Federico']).toBe(45);
    expect(q['Marco']).toBe(45);
  });
});

// ─── calcolaBilancio ──────────────────────────────────────────────────────────

describe('calcolaBilancio — 2 utenti', () => {
  test('nessuna spesa — siete in pari', () => {
    const b = calcolaBilancio([], UTENTI);
    expect(b.importoDebito).toBe(0);
    expect(b.tuttiDebiti).toHaveLength(0);
  });

  test('calcola chi deve cosa', () => {
    const spese = [
      { importo: 100, pagatore: 'Riccardo', altroUtente: 'Federico', divisione: 'metà' },
    ];
    const b = calcolaBilancio(spese, UTENTI);
    expect(b.debitore).toBe('Federico');
    expect(b.creditore).toBe('Riccardo');
    expect(b.importoDebito).toBe(50);
  });

  test('spese multiple si compensano', () => {
    const spese = [
      { importo: 100, pagatore: 'Riccardo', altroUtente: 'Federico', divisione: 'metà' },
      { importo: 100, pagatore: 'Federico', altroUtente: 'Riccardo', divisione: 'metà' },
    ];
    const b = calcolaBilancio(spese, UTENTI);
    expect(b.importoDebito).toBeLessThan(0.01);
  });
});

describe('calcolaBilancio — 3 utenti con tuttiDebiti', () => {
  test('restituisce tuttiDebiti con le coppie corrette', () => {
    const spese = [
      { importo: 90, pagatore: 'Riccardo', partecipanti: ['Riccardo', 'Federico', 'Marco'], divisione: 'equa' },
    ];
    const b = calcolaBilancio(spese, UTENTI_3);
    expect(b.tuttiDebiti).toHaveLength(2);
    const debitori = b.tuttiDebiti.map(d => d.debitore);
    expect(debitori).toContain('Federico');
    expect(debitori).toContain('Marco');
    b.tuttiDebiti.forEach(d => expect(d.importo).toBeCloseTo(30));
  });
});
