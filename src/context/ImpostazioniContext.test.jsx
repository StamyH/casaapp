import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ImpostazioniProvider, useImpostazioni } from './ImpostazioniContext';

const wrapper = ({ children }) => <ImpostazioniProvider>{children}</ImpostazioniProvider>;

beforeEach(() => {
  localStorage.clear();
});

describe('ImpostazioniContext', () => {
  test('valori iniziali corretti', () => {
    const { result } = renderHook(() => useImpostazioni(), { wrapper });
    expect(result.current.impostazioni.categorie.length).toBeGreaterThan(0);
    expect(result.current.impostazioni.categorie[0]).toHaveProperty('nome');
    expect(result.current.impostazioni.categorie[0]).toHaveProperty('icona');
    expect(result.current.impostazioni.nomeCasa).toBeTruthy();
  });

  test('aggiorna il nome della casa', () => {
    const { result } = renderHook(() => useImpostazioni(), { wrapper });

    act(() => {
      result.current.aggiornaImpostazioni({ nomeCasa: 'Casa Nuova' });
    });

    expect(result.current.impostazioni.nomeCasa).toBe('Casa Nuova');
  });

  test('aggiunge una categoria', () => {
    const { result } = renderHook(() => useImpostazioni(), { wrapper });
    const numPrima = result.current.impostazioni.categorie.length;

    act(() => {
      result.current.aggiornaImpostazioni({
        categorie: [...result.current.impostazioni.categorie, { nome: 'palestra', icona: '🏋️' }],
      });
    });

    expect(result.current.impostazioni.categorie.length).toBe(numPrima + 1);
    expect(result.current.impostazioni.categorie.find(c => c.nome === 'palestra')).toBeTruthy();
  });

  test('migrazione vecchie categorie da stringhe a oggetti', () => {
    localStorage.setItem('casaapp_impostazioni', JSON.stringify({
      categorie: ['spesa', 'bolletta'],
      nomeCasa: 'Casa Test',
    }));

    const { result } = renderHook(() => useImpostazioni(), { wrapper });

    expect(typeof result.current.impostazioni.categorie[0]).toBe('object');
    expect(result.current.impostazioni.categorie[0]).toHaveProperty('nome', 'spesa');
    expect(result.current.impostazioni.categorie[0]).toHaveProperty('icona');
  });
});
