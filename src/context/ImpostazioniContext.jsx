import React, { createContext, useContext, useState, useEffect } from 'react';

const ImpostazioniContext = createContext();

const IMPOSTAZIONI_INIZIALI = {
  nomeCasa: 'Casa Riccardo & Federico',
  categorie: [
    { nome: 'spesa', icona: '🛒' },
    { nome: 'bolletta', icona: '⚡' },
    { nome: 'affitto', icona: '🏠' },
    { nome: 'altro', icona: '📦' },
  ],
  coloreRiccardo: '#5C6BC0',
  coloreFederico: '#26A69A',
  coloreAppRiccardo: '#5C6BC0',
  coloreSecondarioRiccardo: '#26A69A',
  modalitaRiccardo: 'auto',
  coloreAppFederico: '#26A69A',
  coloreSecondarioFederico: '#5C6BC0',
  modalitaFederico: 'auto',
};

export function ImpostazioniProvider({ children }) {
  const [impostazioni, setImpostazioni] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_impostazioni');
      if (!saved) return IMPOSTAZIONI_INIZIALI;
      const parsed = JSON.parse(saved);
      if (parsed.categorie && typeof parsed.categorie[0] === 'string') {
        parsed.categorie = parsed.categorie.map(nome => ({ nome, icona: '📦' }));
      }
      if (!parsed.coloreAppRiccardo) parsed.coloreAppRiccardo = parsed.colore || IMPOSTAZIONI_INIZIALI.coloreAppRiccardo;
      if (!parsed.coloreSecondarioRiccardo) parsed.coloreSecondarioRiccardo = parsed.coloreSecondario || IMPOSTAZIONI_INIZIALI.coloreSecondarioRiccardo;
      if (!parsed.modalitaRiccardo) parsed.modalitaRiccardo = parsed.modalita || IMPOSTAZIONI_INIZIALI.modalitaRiccardo;
      if (!parsed.coloreAppFederico) parsed.coloreAppFederico = IMPOSTAZIONI_INIZIALI.coloreAppFederico;
      if (!parsed.coloreSecondarioFederico) parsed.coloreSecondarioFederico = IMPOSTAZIONI_INIZIALI.coloreSecondarioFederico;
      if (!parsed.modalitaFederico) parsed.modalitaFederico = IMPOSTAZIONI_INIZIALI.modalitaFederico;
      return { ...IMPOSTAZIONI_INIZIALI, ...parsed };
    } catch {
      return IMPOSTAZIONI_INIZIALI;
    }
  });

  useEffect(() => {
    localStorage.setItem('casaapp_impostazioni', JSON.stringify(impostazioni));
  }, [impostazioni]);

  const aggiornaImpostazioni = (nuove) => {
    setImpostazioni(prev => ({ ...prev, ...nuove }));
  };

  return (
    <ImpostazioniContext.Provider value={{ impostazioni, aggiornaImpostazioni }}>
      {children}
    </ImpostazioniContext.Provider>
  );
}

export function useImpostazioni() {
  const context = useContext(ImpostazioniContext);
  if (!context) throw new Error('useImpostazioni deve essere usato dentro ImpostazioniProvider');
  return context;
}