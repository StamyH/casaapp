import React, { createContext, useContext, useState } from 'react';

// Creiamo la "bacheca condivisa"
const AppContext = createContext();

// Dati finti per sviluppare l'interfaccia senza Firebase
const SPESE_INIZIALI = [
  { id: 1, descrizione: 'Spesa supermercato', importo: 85.50, categoria: 'spesa', pagatore: 'Riccardo', data: '2024-01-15' },
  { id: 2, descrizione: 'Bolletta luce', importo: 120.00, categoria: 'bolletta', pagatore: 'Federico', data: '2024-01-10' },
  { id: 3, descrizione: 'Affitto', importo: 800.00, categoria: 'affitto', pagatore: 'Riccardo', data: '2024-01-01' },
];

const ATTIVITA_INIZIALI = [
  { id: 1, titolo: 'Lavare i piatti', frequenza: 'giornaliera', assegnato: 'Riccardo', completato: false },
  { id: 2, titolo: 'Pulire il bagno', frequenza: 'settimanale', assegnato: 'Federico', completato: false },
  { id: 3, titolo: 'Passare l\'aspirapolvere', frequenza: 'settimanale', assegnato: 'entrambi', completato: true },
  { id: 4, titolo: 'Pagare affitto', frequenza: 'mensile', assegnato: 'Riccardo', completato: false },
];

const CATEGORIE_INIZIALI = ['spesa', 'bolletta', 'affitto', 'altro'];

const IMPOSTAZIONI_INIZIALI = {
  nomeCasa: 'Casa Riccardo & Federico',
  colore: '#5C6BC0',
  modalita: 'light',
  categorie: CATEGORIE_INIZIALI,
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
  return useContext(AppContext);
}