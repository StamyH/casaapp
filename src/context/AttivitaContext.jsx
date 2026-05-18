import React, { createContext, useContext, useState, useEffect } from 'react';

const AttivitaContext = createContext();

const ATTIVITA_INIZIALI = [
  { id: 1, titolo: 'Lavare i piatti', frequenza: 'giornaliera', giornoSettimana: null, giornoMese: null, dataSpecifica: null, assegnato: 'Riccardo', completato: false },
  { id: 2, titolo: 'Portare la spazzatura', frequenza: 'settimanale', giornoSettimana: 1, giornoMese: null, dataSpecifica: null, assegnato: 'Federico', completato: false },
  { id: 3, titolo: 'Pulire il bagno', frequenza: 'settimanale', giornoSettimana: 6, giornoMese: null, dataSpecifica: null, assegnato: 'entrambi', completato: false },
  { id: 4, titolo: 'Pagare affitto', frequenza: 'mensile', giornoSettimana: null, giornoMese: 1, dataSpecifica: null, assegnato: 'Riccardo', completato: false },
  { id: 5, titolo: 'Controllo caldaia', frequenza: 'specifica', giornoSettimana: null, giornoMese: null, dataSpecifica: '2024-02-15', assegnato: 'Federico', completato: false },
];

function inizioSettimana(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - (d.getDay() || 7) + 1);
  return d.toISOString().split('T')[0];
}

export function AttivitaProvider({ children }) {
  const [attivita, setAttivita] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_attivita');
      return saved ? JSON.parse(saved) : ATTIVITA_INIZIALI;
    } catch {
      return ATTIVITA_INIZIALI;
    }
  });

  useEffect(() => {
    localStorage.setItem('casaapp_attivita', JSON.stringify(attivita));
  }, [attivita]);

  useEffect(() => {
    const oggiStr = new Date().toISOString().split('T')[0];
    const ultimoReset = localStorage.getItem('casaapp_ultimo_reset');
  
    if (ultimoReset === oggiStr) return;
  
    const oggi = new Date();
    const ultima = ultimoReset ? new Date(ultimoReset) : null;
  
    const nuovaSettimana = !ultima || inizioSettimana(oggi) !== inizioSettimana(ultima);
    const nuovoMese = !ultima ||
      oggi.getMonth() !== ultima.getMonth() ||
      oggi.getFullYear() !== ultima.getFullYear();
  
    setAttivita(prev => prev.map(att => {
      if (!att.completato) return att;
      if (att.frequenza === 'giornaliera') return { ...att, completato: false };
      if (att.frequenza === 'settimanale' && nuovaSettimana) return { ...att, completato: false };
      if (att.frequenza === 'mensile' && nuovoMese) return { ...att, completato: false };
      return att;
    }));
  
    localStorage.setItem('casaapp_ultimo_reset', oggiStr);
  }, []);

  const aggiungiAttivita = (nuovaAttivita) => {
    setAttivita(prev => [...prev, { ...nuovaAttivita, id: Date.now(), completato: false }]);
  };

  const toggleAttivita = (id) => {
    setAttivita(prev =>
      prev.map(att => att.id === id ? { ...att, completato: !att.completato } : att)
    );
  };

  const eliminaAttivita = (id) => {
    setAttivita(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AttivitaContext.Provider value={{ attivita, aggiungiAttivita, toggleAttivita, eliminaAttivita }}>
      {children}
    </AttivitaContext.Provider>
  );
}

export function useAttivita() {
  const context = useContext(AttivitaContext);
  if (!context) throw new Error('useAttivita deve essere usato dentro AttivitaProvider');
  return context;
}