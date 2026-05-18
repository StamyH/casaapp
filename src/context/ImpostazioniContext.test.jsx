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
    expect(result.current.impostazioni.modalitaRiccardo).toBe('auto');
    expect(result.current.impostazioni.modalitaFederico).toBe('auto');
    expect(result.current.impostazioni.categorie.length).toBeGreaterThan(0);
    expect(result.current.impostazioni.categorie[0]).toHaveProperty('nome');
    expect(result.current.impostazioni.categorie[0]).toHaveProperty('icona');
  });

  test('aggiorna modalità per utente', () => {
    const { result } = renderHook(() => useImpostazioni(), { wrapper });

    act(() => {
      result.current.aggiornaImpostazioni({ modalitaRiccardo: 'dark' });
    });

    expect(result.current.impostazioni.modalitaRiccardo).toBe('dark');
    expect(result.current.impostazioni.modalitaFederico).toBe('auto');
  });

  test('aggiorna il colore app per utente', () => {
    const { result } = renderHook(() => useImpostazioni(), { wrapper });

    act(() => {
      result.current.aggiornaImpostazioni({ coloreAppRiccardo: '#FF7043', coloreSecondarioRiccardo: '#EC407A' });
    });

    expect(result.current.impostazioni.coloreAppRiccardo).toBe('#FF7043');
    expect(result.current.impostazioni.coloreSecondarioRiccardo).toBe('#EC407A');
  });

  test('migrazione vecchie categorie da stringhe a oggetti', () => {
    localStorage.setItem('casaapp_impostazioni', JSON.stringify({
      categorie: ['spesa', 'bolletta'],
      modalita: 'light',
    }));

    const { result } = renderHook(() => useImpostazioni(), { wrapper });

    expect(typeof result.current.impostazioni.categorie[0]).toBe('object');
    expect(result.current.impostazioni.categorie[0]).toHaveProperty('nome', 'spesa');
    expect(result.current.impostazioni.categorie[0]).toHaveProperty('icona');
  });
});
