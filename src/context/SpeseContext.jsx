import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SpeseContext = createContext();

function speseIniziali() {
  const mm = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const oggi = new Date();

  let nomeA = 'Utente 1', nomeB = 'Utente 2';
  try {
    const utenti = JSON.parse(localStorage.getItem('casaapp_utenti') || '[]');
    if (utenti[0]?.nome) nomeA = utenti[0].nome;
    if (utenti[1]?.nome) nomeB = utenti[1].nome;
  } catch {}

  return [
    { id: 1, descrizione: 'Spesa supermercato', importo: 85.50, categoria: 'spesa', pagatore: nomeA, altroUtente: nomeB, divisione: 'metà', percentuale: 50, data: `${mm(oggi)}-15`, ricorrente: false },
    { id: 2, descrizione: 'Bolletta luce', importo: 120.00, categoria: 'bolletta', pagatore: nomeB, altroUtente: nomeA, divisione: 'metà', percentuale: 50, data: `${mm(oggi)}-10`, ricorrente: false },
    { id: 3, descrizione: 'Affitto', importo: 800.00, categoria: 'affitto', pagatore: nomeA, altroUtente: nomeB, divisione: 'metà', percentuale: 50, data: `${mm(oggi)}-01`, ricorrente: true },
    { id: 4, descrizione: 'Netflix', importo: 18.00, categoria: 'altro', pagatore: nomeB, altroUtente: nomeA, divisione: 'tutto_altro', percentuale: 100, data: `${mm(oggi)}-05`, ricorrente: true },
  ];
}

export function SpeseProvider({ children }) {
  const [spese, setSpese] = useLocalStorage('casaapp_spese', speseIniziali);

  // Genera automaticamente le spese ricorrenti del mese corrente
  useEffect(() => {
    const oggi = new Date();
    const meseCorrente = `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, '0')}`;
    const ultimaEspansione = localStorage.getItem('casaapp_ultima_espansione_ricorrenti');

    if (ultimaEspansione === meseCorrente) return;

    const dataPrecedente = new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1);
    const mesePrecedente = `${dataPrecedente.getFullYear()}-${String(dataPrecedente.getMonth() + 1).padStart(2, '0')}`;

    // Segna subito il mese come elaborato per evitare doppia esecuzione in Strict Mode
    localStorage.setItem('casaapp_ultima_espansione_ricorrenti', meseCorrente);

    setSpese(prev => {
      const ricorrentiPrec = prev.filter(s =>
        s.ricorrente && s.data?.startsWith(mesePrecedente)
      );
      const esistentiMese = prev.filter(s => s.data?.startsWith(meseCorrente));

      const nuove = ricorrentiPrec
        .filter(s => !esistentiMese.some(e =>
          e.ricorrente &&
          e.descrizione === s.descrizione &&
          e.categoria === s.categoria &&
          e.pagatore === s.pagatore
        ))
        .map(s => ({
          ...s,
          id: crypto.randomUUID(),
          data: `${meseCorrente}-01`,
        }));

      return nuove.length > 0 ? [...prev, ...nuove] : prev;
    });
  }, [setSpese]);

  const aggiungiSpesa = (nuovaSpesa) => {
    setSpese(prev => [...prev, { ...nuovaSpesa, id: crypto.randomUUID() }]);
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
      partecipanti: s.partecipanti?.map(p => p === vecchioNome ? nuovoNome : p),
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
