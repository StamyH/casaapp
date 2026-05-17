import { renderHook, act } from '@testing-library/react';
import { AttivitaProvider, useAttivita } from './AttivitaContext';

describe('AttivitaContext', () => {
  test('useAttivita lancia errore fuori dal provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAttivita())).toThrow('useAttivita deve essere usato dentro AttivitaProvider');
    spy.mockRestore();
  });

  test('aggiungiAttivita aggiunge con completato false e id', () => {
    const { result } = renderHook(() => useAttivita(), { wrapper: AttivitaProvider });
    const iniziali = result.current.attivita.length;

    act(() => {
      result.current.aggiungiAttivita({
        titolo: 'Test task',
        frequenza: 'giornaliera',
        giornoSettimana: null,
        giornoMese: null,
        dataSpecifica: null,
        assegnato: 'Riccardo',
      });
    });

    expect(result.current.attivita.length).toBe(iniziali + 1);
    const nuova = result.current.attivita.find(a => a.titolo === 'Test task');
    expect(nuova.completato).toBe(false);
    expect(nuova.id).toBeDefined();
  });

  test('toggleAttivita inverte il completato', () => {
    const { result } = renderHook(() => useAttivita(), { wrapper: AttivitaProvider });
    const id = result.current.attivita[0].id;
    const iniziale = result.current.attivita[0].completato;

    act(() => { result.current.toggleAttivita(id); });

    expect(result.current.attivita.find(a => a.id === id).completato).toBe(!iniziale);
  });

  test('toggleAttivita due volte ripristina il valore originale', () => {
    const { result } = renderHook(() => useAttivita(), { wrapper: AttivitaProvider });
    const id = result.current.attivita[0].id;
    const iniziale = result.current.attivita[0].completato;

    act(() => { result.current.toggleAttivita(id); });
    act(() => { result.current.toggleAttivita(id); });

    expect(result.current.attivita.find(a => a.id === id).completato).toBe(iniziale);
  });

  test('eliminaAttivita rimuove l attività corretta', () => {
    const { result } = renderHook(() => useAttivita(), { wrapper: AttivitaProvider });
    const id = result.current.attivita[0].id;
    const iniziali = result.current.attivita.length;

    act(() => { result.current.eliminaAttivita(id); });

    expect(result.current.attivita.length).toBe(iniziali - 1);
    expect(result.current.attivita.find(a => a.id === id)).toBeUndefined();
  });
});