import React, { createContext, useContext, useState } from 'react';

// Creiamo la "bacheca condivisa"
const AppContext = createContext();

// Dati finti per sviluppare l'interfaccia senza Firebase
const SPESE_INIZIALI = [
  { id: 1, descrizione: 'Spesa supermercato', importo: 85.50, categoria: 'spesa', pagatore: 'Riccardo', divisione: 'metà', percentuale: 50, data: '2024-01-15' },
  { id: 2, descrizione: 'Bolletta luce', importo: 120.00, categoria: 'bolletta', pagatore: 'Federico', divisione: 'metà', percentuale: 50, data: '2024-01-10' },
  { id: 3, descrizione: 'Affitto', importo: 800.00, categoria: 'affitto', pagatore: 'Riccardo', divisione: 'metà', percentuale: 50, data: '2024-01-01' },
  { id: 4, descrizione: 'Netflix', importo: 18.00, categoria: 'altro', pagatore: 'Federico', divisione: 'tutto_altro', percentuale: 100, data: '2024-01-05' },
];

const ATTIVITA_INIZIALI = [
  { id: 1, titolo: 'Lavare i piatti', frequenza: 'giornaliera', giornoSettimana: null, giornoMese: null, dataSpecifica: null, assegnato: 'Riccardo', completato: false },
  { id: 2, titolo: 'Portare la spazzatura', frequenza: 'settimanale', giornoSettimana: 1, giornoMese: null, dataSpecifica: null, assegnato: 'Federico', completato: false },
  { id: 3, titolo: 'Pulire il bagno', frequenza: 'settimanale', giornoSettimana: 6, giornoMese: null, dataSpecifica: null, assegnato: 'entrambi', completato: false },
  { id: 4, titolo: 'Pagare affitto', frequenza: 'mensile', giornoSettimana: null, giornoMese: 1, dataSpecifica: null, assegnato: 'Riccardo', completato: false },
  { id: 5, titolo: 'Controllo caldaia', frequenza: 'specifica', giornoSettimana: null, giornoMese: null, dataSpecifica: '2024-02-15', assegnato: 'Federico', completato: false },
];

const CATEGORIE_INIZIALI = ['spesa', 'bolletta', 'affitto', 'altro'];

const IMPOSTAZIONI_INIZIALI = {
  nomeCasa: 'Casa Riccardo & Federico',
  colore: '#5C6BC0',
  modalita: 'auto',
  categorie: CATEGORIE_INIZIALI,
  coloreRiccardo: '#5C6BC0',
  coloreFederico: '#26A69A',
};

export function AppProvider({ children }) {
  const [utente, setUtente] = useState(null);
  const [spese, setSpese] = useState(SPESE_INIZIALI);
  const [attivita, setAttivita] = useState(ATTIVITA_INIZIALI);
  const [impostazioni, setImpostazioni] = useState(IMPOSTAZIONI_INIZIALI);

  // Aggiunge una nuova spesa
  const aggiungiSpesa = (nuovaSpesa) => {
    setSpese(prev => [...prev, { ...nuovaSpesa, id: Date.now() }]);
  };

  // Elimina una spesa
  const eliminaSpesa = (id) => {
    setSpese(prev => prev.filter(s => s.id !== id));
  };

  // Aggiunge una nuova attività
  const aggiungiAttivita = (nuovaAttivita) => {
    setAttivita(prev => [...prev, { ...nuovaAttivita, id: Date.now(), completato: false }]);
  };

  // Segna attività come completata/non completata
  const toggleAttivita = (id) => {
    setAttivita(prev =>
      prev.map(att => att.id === id ? { ...att, completato: !att.completato } : att)
    );
  };

  // Elimina una attività
  const eliminaAttivita = (id) => {
    setAttivita(prev => prev.filter(a => a.id !== id));
  };

  // Aggiorna le impostazioni
  const aggiornaImpostazioni = (nuove) => {
    setImpostazioni(prev => ({ ...prev, ...nuove }));
  };

  return (
    <AppContext.Provider value={{
      utente, setUtente,
      spese, aggiungiSpesa, eliminaSpesa,
      attivita, aggiungiAttivita, toggleAttivita, eliminaAttivita,
      impostazioni, aggiornaImpostazioni,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook — invece di scrivere useContext(AppContext) ogni volta, basta useApp()
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve essere usato dentro AppProvider');
  return context;
}