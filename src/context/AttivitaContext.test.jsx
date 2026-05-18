import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AttivitaProvider, useAttivita } from './AttivitaContext';

const wrapper = ({ children }) => <AttivitaProvider>{children}</AttivitaProvider>;

beforeEach(() => {
  localStorage.clear();
});

describe('AttivitaContext', () => {
  test('aggiunge un\'attività', () => {
    const { result } = renderHook(() => useAttivita(), { wrapper });
    const prima = result.current.attivita.length;

    act(() => {
      result.current.aggiungiAttivita({
        titolo: 'Test attività',
        frequenza: 'giornaliera',
        giornoSettimana: null,
        giornoMese: null,
        dataSpecifica: null,
        assegnato: 'Riccardo',
      });
    });

    expect(result.current.attivita.length).toBe(prima + 1);
  });

  test('toggle attività salva chi l\'ha completata', () => {
    const { result } = renderHook(() => useAttivita(), { wrapper });

    act(() => {
      result.current.aggiungiAttivita({
        titolo: 'Task da completare',
        frequenza: 'giornaliera',
        giornoSettimana: null,
        giornoMese: null,
        dataSpecifica: null,
        assegnato: 'Federico',
      });
    });

    const id = result.current.attivita[result.current.attivita.length - 1].id;

    act(() => {
      result.current.toggleAttivita(id, 'Federico');
    });

    const task = result.current.attivita.find(a => a.id === id);
    expect(task.completato).toBe(true);
    expect(task.completatoDa).toBe('Federico');
  });

  test('elimina un\'attività', () => {
    const { result } = renderHook(() => useAttivita(), { wrapper });

    act(() => {
      result.current.aggiungiAttivita({
        titolo: 'Da eliminare',
        frequenza: 'mensile',
        giornoSettimana: null,
        giornoMese: 1,
        dataSpecifica: null,
        assegnato: 'entrambi',
      });
    });

    const id = result.current.attivita[result.current.attivita.length - 1].id;

    act(() => {
      result.current.eliminaAttivita(id);
    });

    expect(result.current.attivita.find(a => a.id === id)).toBeUndefined();
  });
});
