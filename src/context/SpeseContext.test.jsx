import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { SpeseProvider, useSpese } from './SpeseContext';

const wrapper = ({ children }) => <SpeseProvider>{children}</SpeseProvider>;

beforeEach(() => {
  localStorage.clear();
});

describe('SpeseContext', () => {
  test('aggiunge una spesa', () => {
    const { result } = renderHook(() => useSpese(), { wrapper });
    const spesePrima = result.current.spese.length;

    act(() => {
      result.current.aggiungiSpesa({
        descrizione: 'Test',
        importo: 50,
        categoria: 'spesa',
        pagatore: 'Riccardo',
        divisione: 'metà',
        percentuale: 50,
        data: '2026-05-18',
      });
    });

    expect(result.current.spese.length).toBe(spesePrima + 1);
  });

  test('elimina una spesa', () => {
    const { result } = renderHook(() => useSpese(), { wrapper });

    act(() => {
      result.current.aggiungiSpesa({
        descrizione: 'Da eliminare',
        importo: 30,
        categoria: 'altro',
        pagatore: 'Federico',
        divisione: 'metà',
        percentuale: 50,
        data: '2026-05-18',
      });
    });

    const id = result.current.spese[result.current.spese.length - 1].id;

    act(() => {
      result.current.eliminaSpesa(id);
    });

    expect(result.current.spese.find(s => s.id === id)).toBeUndefined();
  });

  test('riassegna categoria alle spese orfane', () => {
    const { result } = renderHook(() => useSpese(), { wrapper });

    act(() => {
      result.current.aggiungiSpesa({
        descrizione: 'Spesa test',
        importo: 20,
        categoria: 'spesa',
        pagatore: 'Riccardo',
        divisione: 'metà',
        percentuale: 50,
        data: '2026-05-18',
      });
    });

    act(() => {
      result.current.riassegnaCategoria('spesa', 'bolletta');
    });

    const spesa = result.current.spese.find(s => s.descrizione === 'Spesa test');
    expect(spesa.categoria).toBe('bolletta');
  });
});

  test('modifica una spesa esistente', () => {
    const { result } = renderHook(() => useSpese(), { wrapper });

    act(() => {
      result.current.aggiungiSpesa({
        descrizione: 'Da modificare',
        importo: 50,
        categoria: 'spesa',
        pagatore: 'Riccardo',
        divisione: 'metà',
        percentuale: 50,
        data: '2026-05-18',
      });
    });

    const id = result.current.spese[result.current.spese.length - 1].id;

    act(() => {
      result.current.modificaSpesa(id, { descrizione: 'Modificata', importo: 99 });
    });

    const spesa = result.current.spese.find(s => s.id === id);
    expect(spesa.descrizione).toBe('Modificata');
    expect(spesa.importo).toBe(99);
    expect(spesa.categoria).toBe('spesa');
  });
