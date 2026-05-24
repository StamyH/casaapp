import React, { createContext, useContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const COLORI_DEFAULT = ['#5C6BC0', '#26A69A', '#FF7043', '#EC407A', '#AB47BC', '#42A5F5'];

// Numero massimo di utenti = numero di colori disponibili
export const MAX_UTENTI = COLORI_DEFAULT.length;

const UTENTI_INIZIALI = [
  { id: 'u_riccardo', nome: 'Riccardo', coloreAvatar: '#5C6BC0', coloreApp: '#5C6BC0', coloreSecondario: '#26A69A', modalita: 'auto' },
  { id: 'u_federico', nome: 'Federico', coloreAvatar: '#26A69A', coloreApp: '#26A69A', coloreSecondario: '#5C6BC0', modalita: 'auto' },
];

export function AppProvider({ children }) {
  const [utenti, setUtenti] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_utenti');
      if (saved) return JSON.parse(saved);

      // Prima installazione: scrivi subito in localStorage in modo che
      // SpeseContext e AttivitaContext (inizializzati in parallelo) leggano
      // i nomi reali e non 'Utente 1'/'Utente 2' come fallback
      const oldSettings = JSON.parse(localStorage.getItem('casaapp_impostazioni') || '{}');
      const utentiIniziali = [
        {
          ...UTENTI_INIZIALI[0],
          coloreAvatar: oldSettings.coloreRiccardo || UTENTI_INIZIALI[0].coloreAvatar,
          coloreApp: oldSettings.coloreAppRiccardo || UTENTI_INIZIALI[0].coloreApp,
          coloreSecondario: oldSettings.coloreSecondarioRiccardo || UTENTI_INIZIALI[0].coloreSecondario,
          modalita: oldSettings.modalitaRiccardo || UTENTI_INIZIALI[0].modalita,
        },
        {
          ...UTENTI_INIZIALI[1],
          coloreAvatar: oldSettings.coloreFederico || UTENTI_INIZIALI[1].coloreAvatar,
          coloreApp: oldSettings.coloreAppFederico || UTENTI_INIZIALI[1].coloreApp,
          coloreSecondario: oldSettings.coloreSecondarioFederico || UTENTI_INIZIALI[1].coloreSecondario,
          modalita: oldSettings.modalitaFederico || UTENTI_INIZIALI[1].modalita,
        },
      ];
      // Scrivi subito (sincrono) così gli altri context trovano casaapp_utenti già popolato
      localStorage.setItem('casaapp_utenti', JSON.stringify(utentiIniziali));
      return utentiIniziali;
    } catch {
      return UTENTI_INIZIALI;
    }
  });

  const [utenteAttivoId, setUtenteAttivoId] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_utente');
      if (!saved) return null;
      // Migrazione: vecchio valore era il nome ('Riccardo' / 'Federico')
      if (saved === 'Riccardo') return 'u_riccardo';
      if (saved === 'Federico') return 'u_federico';
      return saved;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('casaapp_utenti', JSON.stringify(utenti));
  }, [utenti]);

  useEffect(() => {
    if (utenteAttivoId) localStorage.setItem('casaapp_utente', utenteAttivoId);
    else localStorage.removeItem('casaapp_utente');
  }, [utenteAttivoId]);

  const utenteAttivo = utenti.find(u => u.id === utenteAttivoId) || null;

  const aggiungiUtente = (nome) => {
    if (utenti.length >= MAX_UTENTI) return null; // limite massimo raggiunto
    const id = `u_${Date.now()}`;
    const coloriUsati = utenti.map(u => u.coloreAvatar);
    const colore = COLORI_DEFAULT.find(c => !coloriUsati.includes(c)) || COLORI_DEFAULT[0];
    const coloreSecondario = COLORI_DEFAULT.find(c => c !== colore) || COLORI_DEFAULT[1];
    setUtenti(prev => [...prev, { id, nome, coloreAvatar: colore, coloreApp: colore, coloreSecondario, modalita: 'auto' }]);
    return id;
  };

  const modificaUtente = (id, dati) => {
    setUtenti(prev => prev.map(u => u.id === id ? { ...u, ...dati } : u));
  };

  const eliminaUtente = (id) => {
    setUtenti(prev => prev.filter(u => u.id !== id));
    if (utenteAttivoId === id) setUtenteAttivoId(null);
  };

  return (
    <AppContext.Provider value={{ utenti, utenteAttivo, utenteAttivoId, setUtenteAttivoId, aggiungiUtente, modificaUtente, eliminaUtente }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve essere usato dentro AppProvider');
  return context;
}
