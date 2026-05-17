import React, { createContext, useContext, useState, useEffect } from 'react';

const SpeseContext = createContext();

const SPESE_INIZIALI = [
  { id: 1, descrizione: 'Spesa supermercato', importo: 85.50, categoria: 'spesa', pagatore: 'Riccardo', divisione: 'metà', percentuale: 50, data: '2024-01-15' },
  { id: 2, descrizione: 'Bolletta luce', importo: 120.00, categoria: 'bolletta', pagatore: 'Federico', divisione: 'metà', percentuale: 50, data: '2024-01-10' },
  { id: 3, descrizione: 'Affitto', importo: 800.00, categoria: 'affitto', pagatore: 'Riccardo', divisione: 'metà', percentuale: 50, data: '2024-01-01' },
  { id: 4, descrizione: 'Netflix', importo: 18.00, categoria: 'altro', pagatore: 'Federico', divisione: 'tutto_altro', percentuale: 100, data: '2024-01-05' },
];

export function SpeseProvider({ children }) {
  const [spese, setSpese] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_spese');
      return saved ? JSON.parse(saved) : SPESE_INIZIALI;
    } catch {
      return SPESE_INIZIALI;
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

  const riassegnaCategoria = (vecchia, nuova) => {
    setSpese(prev => prev.map(s =>
      s.categoria === vecchia ? { ...s, categoria: nuova } : s
    ));
  };

  return (
    <SpeseContext.Provider value={{ spese, aggiungiSpesa, eliminaSpesa, riassegnaCategoria }}>
      {children}
    </SpeseContext.Provider>
  );
}

export function useSpese() {
  const context = useContext(SpeseContext);
  if (!context) throw new Error('useSpese deve essere usato dentro SpeseProvider');
  return context;
}