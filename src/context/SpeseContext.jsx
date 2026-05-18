import React, { createContext, useContext, useState, useEffect } from 'react';

const SpeseContext = createContext();


export function SpeseProvider({ children }) {
  const [spese, setSpese] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_spese');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('casaapp_spese', JSON.stringify(spese));
  }, [spese]);

  const aggiungiSpesa = (nuovaSpesa) => {
    setSpese(prev => [...prev, { ...nuovaSpesa, id: Date.now() }]);
  };

  const eliminaSpesa = (id) => {
    setSpese(prev => prev.filter(s => s.id !== id));
  };

  const modificaSpesa = (id, datiAggiornati) => {
    setSpese(prev => prev.map(s => s.id === id ? { ...s, ...datiAggiornati } : s));
  };

  const riassegnaCategoria = (vecchia, nuova) => {
    setSpese(prev => prev.map(s =>
      s.categoria === vecchia ? { ...s, categoria: nuova } : s
    ));
  };

  return (
    <SpeseContext.Provider value={{ spese, aggiungiSpesa, eliminaSpesa, riassegnaCategoria, modificaSpesa }}>
      {children}
    </SpeseContext.Provider>
  );
}

export function useSpese() {
  const context = useContext(SpeseContext);
  if (!context) throw new Error('useSpese deve essere usato dentro SpeseProvider');
  return context;
}