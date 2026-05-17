import React, { createContext, useContext, useState, useEffect } from 'react';

const ImpostazioniContext = createContext();

const IMPOSTAZIONI_INIZIALI = {
  nomeCasa: 'Casa Riccardo & Federico',
  colore: '#5C6BC0',
  modalita: 'auto',
  categorie: ['spesa', 'bolletta', 'affitto', 'altro'],
  coloreRiccardo: '#5C6BC0',
  coloreFederico: '#26A69A',
};

export function ImpostazioniProvider({ children }) {
  const [impostazioni, setImpostazioni] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_impostazioni');
      return saved ? { ...IMPOSTAZIONI_INIZIALI, ...JSON.parse(saved) } : IMPOSTAZIONI_INIZIALI;
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