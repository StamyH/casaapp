import { renderHook, act } from '@testing-library/react';
import { ImpostazioniProvider, useImpostazioni } from './ImpostazioniContext';

describe('ImpostazioniContext', () => {
  test('useImpostazioni lancia errore fuori dal provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useImpostazioni())).toThrow('useImpostazioni deve essere usato dentro ImpostazioniProvider');
    spy.mockRestore();
  });

  test('aggiornaImpostazioni fa merge parziale senza toccare gli altri campi', () => {
    const { result } = renderHook(() => useImpostazioni(), { wrapper: ImpostazioniProvider });
    const nomeOriginale = result.current.impostazioni.nomeCasa;

    act(() => { result.current.aggiornaImpostazioni({ colore: '#FF0000' }); });

    expect(result.current.impostazioni.colore).toBe('#FF0000');
    expect(result.current.impostazioni.nomeCasa).toBe(nomeOriginale);
  });

  test('aggiornaImpostazioni aggiorna il nome della casa', () => {
    const { result } = renderHook(() => useImpostazioni(), { wrapper: ImpostazioniProvider });

    act(() => { result.current.aggiornaImpostazioni({ nomeCasa: 'Casa Test' }); });

    expect(result.current.impostazioni.nomeCasa).toBe('Casa Test');
  });

  test('aggiornaImpostazioni aggiunge una categoria', () => {
    const { result } = renderHook(() => useImpostazioni(), { wrapper: ImpostazioniProvider });
    const iniziali = result.current.impostazioni.categorie.length;

    act(() => {
      result.current.aggiornaImpostazioni({
        categorie: [...result.current.impostazioni.categorie, 'palestra'],
      });
    });

    expect(result.current.impostazioni.categorie.length).toBe(iniziali + 1);
    expect(result.current.impostazioni.categorie).toContain('palestra');
  });
});