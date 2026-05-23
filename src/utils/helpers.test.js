import { oggiLocale, formattaImporto, calcolaQuote, calcolaBilancio, COLORI_TEMA, formattaData, raggruppaPerMese } from './helpers';

const normalizza = (str) => str.replace(/\s/g, ' ');

const UTENTI = [
  { id: 'u1', nome: 'Alice' },
  { id: 'u2', nome: 'Bruno' },
];

const UTENTI_3 = [
  { id: 'u1', nome: 'Alice' },
  { id: 'u2', nome: 'Bruno' },
  { id: 'u3', nome: 'Carlo' },
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

// ─── COLORI_TEMA ──────────────────────────────────────────────────────────────

describe('COLORI_TEMA', () => {
  test('ha 6 colori', () => { expect(COLORI_TEMA).toHaveLength(6); });
  test('ogni colore ha valore, secondario, nome', () => {
    COLORI_TEMA.forEach(c => {
      expect(c).toHaveProperty('valore');
      expect(c).toHaveProperty('secondario');
      expect(c).toHaveProperty('nome');
    });
  });
});

// ─── raggruppaPerMese ─────────────────────────────────────────────────────────

describe('raggruppaPerMese', () => {
  test('raggruppa spese per mese', () => {
    const spese = [
      { data: '2024-01-10', importo: 10 },
      { data: '2024-01-20', importo: 20 },
      { data: '2024-02-05', importo: 30 },
    ];
    const r = raggruppaPerMese(spese);
    const chiavi = Object.keys(r);
    expect(chiavi).toHaveLength(2);
    expect(r[chiavi[0]]).toHaveLength(2);
    expect(r[chiavi[1]]).toHaveLength(1);
  });
  test('array vuoto → oggetto vuoto', () => {
    expect(raggruppaPerMese([])).toEqual({});
  });
});

// ─── calcolaQuote ─────────────────────────────────────────────────────────────

describe('calcolaQuote — 2 utenti (API legacy con stringa)', () => {
  test('divisione metà', () => {
    const q = calcolaQuote(100, 'Alice', 'Bruno', 'metà');
    expect(q['Alice']).toBe(50);
    expect(q['Bruno']).toBe(50);
  });

  test('tutto mio — chi paga si accolla tutto', () => {
    const q = calcolaQuote(100, 'Alice', 'Bruno', 'tutto_mio');
    expect(q['Alice']).toBe(100);
    expect(q['Bruno']).toBe(0);
  });

  test("tutto altro — chi paga anticipa per l'altro", () => {
    const q = calcolaQuote(100, 'Alice', 'Bruno', 'tutto_altro');
    expect(q['Alice']).toBe(0);
    expect(q['Bruno']).toBe(100);
  });

  test('percentuale custom 70/30', () => {
    const q = calcolaQuote(100, 'Alice', 'Bruno', 'percentuale', 70);
    expect(q['Alice']).toBe(70);
    expect(q['Bruno']).toBe(30);
  });
});

describe('calcolaQuote — 3 utenti (API nuova con array)', () => {
  test('divisione equa tra 3', () => {
    const q = calcolaQuote(90, 'Alice', ['Alice', 'Bruno', 'Carlo'], 'equa');
    expect(q['Alice']).toBe(30);
    expect(q['Bruno']).toBe(30);
    expect(q['Carlo']).toBe(30);
  });

  test('tutto mio tra 3 — gli altri non devono nulla', () => {
    const q = calcolaQuote(90, 'Alice', ['Alice', 'Bruno', 'Carlo'], 'tutto_mio');
    expect(q['Alice']).toBe(90);
    expect(q['Bruno']).toBe(0);
    expect(q['Carlo']).toBe(0);
  });

  test('tutto altro tra 3 — costo diviso tra gli altri due', () => {
    const q = calcolaQuote(90, 'Alice', ['Alice', 'Bruno', 'Carlo'], 'tutto_altro');
    expect(q['Alice']).toBe(0);
    expect(q['Bruno']).toBe(45);
    expect(q['Carlo']).toBe(45);
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
      { importo: 100, pagatore: 'Alice', altroUtente: 'Bruno', divisione: 'metà' },
    ];
    const b = calcolaBilancio(spese, UTENTI);
    expect(b.debitore).toBe('Bruno');
    expect(b.creditore).toBe('Alice');
    expect(b.importoDebito).toBe(50);
  });

  test('spese multiple si compensano', () => {
    const spese = [
      { importo: 100, pagatore: 'Alice', altroUtente: 'Bruno', divisione: 'metà' },
      { importo: 100, pagatore: 'Bruno', altroUtente: 'Alice', divisione: 'metà' },
    ];
    const b = calcolaBilancio(spese, UTENTI);
    expect(b.importoDebito).toBeLessThan(0.01);
  });
});

describe('calcolaBilancio — 3 utenti con tuttiDebiti', () => {
  test('restituisce tuttiDebiti con le coppie corrette', () => {
    const spese = [
      { importo: 90, pagatore: 'Alice', partecipanti: ['Alice', 'Bruno', 'Carlo'], divisione: 'equa' },
    ];
    const b = calcolaBilancio(spese, UTENTI_3);
    expect(b.tuttiDebiti).toHaveLength(2);
    const debitori = b.tuttiDebiti.map(d => d.debitore);
    expect(debitori).toContain('Bruno');
    expect(debitori).toContain('Carlo');
    b.tuttiDebiti.forEach(d => expect(d.importo).toBeCloseTo(30));
  });
});
