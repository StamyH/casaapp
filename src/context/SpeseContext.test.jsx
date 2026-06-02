import { renderHook, act } from '@testing-library/react';
import { SpeseProvider, useSpese } from './SpeseContext';

describe('SpeseContext', () => {
  test('useSpese lancia errore fuori dal provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSpese())).toThrow('useSpese deve essere usato dentro SpeseProvider');
    spy.mockRestore();
  });

  test('aggiungiSpesa aggiunge una spesa con id', () => {
    const { result } = renderHook(() => useSpese(), { wrapper: SpeseProvider });
    const iniziali = result.current.spese.length;

    act(() => {
      result.current.aggiungiSpesa({
        descrizione: 'Test spesa',
        importo: 50,
        categoria: 'spesa',
        pagatore: 'Riccardo',
        divisione: 'metà',
        percentuale: 50,
        data: '2024-01-01',
      });
    });

    expect(result.current.spese.length).toBe(iniziali + 1);
    const nuova = result.current.spese.find(s => s.descrizione === 'Test spesa');
    expect(nuova).toBeDefined();
    expect(nuova.id).toBeDefined();
    expect(nuova.importo).toBe(50);
  });

  test('eliminaSpesa rimuove la spesa corretta', () => {
    const { result } = renderHook(() => useSpese(), { wrapper: SpeseProvider });
    const id = result.current.spese[0].id;
    const iniziali = result.current.spese.length;

    act(() => {
      result.current.eliminaSpesa(id);
    });

    expect(result.current.spese.length).toBe(iniziali - 1);
    expect(result.current.spese.find(s => s.id === id)).toBeUndefined();
  });
});