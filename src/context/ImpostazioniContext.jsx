import React, { createContext, useContext, useState } from 'react';

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
  const [impostazioni, setImpostazioni] = useState(IMPOSTAZIONI_INIZIALI);

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