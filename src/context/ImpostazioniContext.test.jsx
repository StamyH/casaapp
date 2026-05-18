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
    expect(result.current.impostazioni.modalita).toBe('auto');
    expect(result.current.impostazioni.categorie.length).toBeGreaterThan(0);
    expect(result.current.impostazioni.categorie[0]).toHaveProperty('nome');
    expect(result.current.impostazioni.categorie[0]).toHaveProperty('icona');
  });

  test('aggiorna una singola impostazione', () => {
    const { result } = renderHook(() => useImpostazioni(), { wrapper });

    act(() => {
      result.current.aggiornaImpostazioni({ modalita: 'dark' });
    });

    expect(result.current.impostazioni.modalita).toBe('dark');
    expect(result.current.impostazioni.categorie.length).toBeGreaterThan(0);
  });

  test('aggiorna il colore dell\'app', () => {
    const { result } = renderHook(() => useImpostazioni(), { wrapper });

    act(() => {
      result.current.aggiornaImpostazioni({ colore: '#FF7043' });
    });

    expect(result.current.impostazioni.colore).toBe('#FF7043');
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
