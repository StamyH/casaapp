import React, { createContext, useContext, useState, useEffect } from 'react';

const SpeseContext = createContext();

function speseIniziali() {
  const mm = (d) => new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0].slice(0, 7);
  const oggi = new Date();

  let nomeA = 'Riccardo', nomeB = 'Federico';
  try {
    const utenti = JSON.parse(localStorage.getItem('casaapp_utenti') || '[]');
    if (utenti[0]?.nome) nomeA = utenti[0].nome;
    if (utenti[1]?.nome) nomeB = utenti[1].nome;
  } catch {}

  return [
    { id: 1, descrizione: 'Spesa supermercato', importo: 85.50, categoria: 'spesa', pagatore: nomeA, altroUtente: nomeB, divisione: 'metà', percentuale: 50, data: `${mm(oggi)}-15` },
    { id: 2, descrizione: 'Bolletta luce', importo: 120.00, categoria: 'bolletta', pagatore: nomeB, altroUtente: nomeA, divisione: 'metà', percentuale: 50, data: `${mm(oggi)}-10` },
    { id: 3, descrizione: 'Affitto', importo: 800.00, categoria: 'affitto', pagatore: nomeA, altroUtente: nomeB, divisione: 'metà', percentuale: 50, data: `${mm(oggi)}-01` },
    { id: 4, descrizione: 'Netflix', importo: 18.00, categoria: 'altro', pagatore: nomeB, altroUtente: nomeA, divisione: 'tutto_altro', percentuale: 100, data: `${mm(oggi)}-05` },
  ];
}

export function SpeseProvider({ children }) {
  const [spese, setSpese] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_spese');
      return saved ? JSON.parse(saved) : speseIniziali();
    } catch {
      return speseIniziali();
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

  const aggiornaRiferimentiUtente = (vecchioNome, nuovoNome) => {
    setSpese(prev => prev.map(s => ({
      ...s,
      pagatore: s.pagatore === vecchioNome ? nuovoNome : s.pagatore,
      altroUtente: s.altroUtente === vecchioNome ? nuovoNome : s.altroUtente,
    })));
  };

  return (
    <SpeseContext.Provider value={{ spese, aggiungiSpesa, eliminaSpesa, riassegnaCategoria, modificaSpesa, aggiornaRiferimentiUtente }}>
      {children}
    </SpeseContext.Provider>
  );
}

export function useSpese() {
  const context = useContext(SpeseContext);
  if (!context) throw new Error('useSpese deve essere usato dentro SpeseProvider');
  return context;
}