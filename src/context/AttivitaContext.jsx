import React, { createContext, useContext, useState, useEffect } from 'react';

const AttivitaContext = createContext();


function inizioSettimana(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - (d.getDay() || 7) + 1);
  return d.toISOString().split('T')[0];
}

export function AttivitaProvider({ children }) {
  const [attivita, setAttivita] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_attivita');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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

  const toggleAttivita = (id, utente) => {
    setAttivita(prev =>
      prev.map(att => att.id === id
        ? { ...att, completato: !att.completato, completatoDa: !att.completato ? utente : null }
        : att
      )
    );
  };

  const eliminaAttivita = (id) => {
    setAttivita(prev => prev.filter(a => a.id !== id));
  };

  const modificaAttivita = (id, datiAggiornati) => {
    setAttivita(prev => prev.map(a => a.id === id ? { ...a, ...datiAggiornati } : a));
  };

  return (
    <AttivitaContext.Provider value={{ attivita, aggiungiAttivita, toggleAttivita, eliminaAttivita, modificaAttivita }}>
      {children}
    </AttivitaContext.Provider>
  );
}

export function useAttivita() {
  const context = useContext(AttivitaContext);
  if (!context) throw new Error('useAttivita deve essere usato dentro AttivitaProvider');
  return context;
}