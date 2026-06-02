import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { oggiLocale, formatoData } from '../utils/helpers';

const AttivitaContext = createContext();

function inizioSettimana(date) {
  const inizio = new Date(date);
  inizio.setDate(inizio.getDate() - (inizio.getDay() || 7) + 1);
  return formatoData(inizio);
}

function attivitaIniziali() {
  const dataFutura = new Date(); dataFutura.setMonth(dataFutura.getMonth() + 1);
  const traUnMese = formatoData(dataFutura);

  let nomeA = 'Utente 1', nomeB = 'Utente 2';
  try {
    const utenti = JSON.parse(localStorage.getItem('casaapp_utenti') || '[]');
    if (utenti[0]?.nome) nomeA = utenti[0].nome;
    if (utenti[1]?.nome) nomeB = utenti[1].nome;
  } catch {}

  return [
    { id: 1, titolo: 'Lavare i piatti', frequenza: 'giornaliera', giornoSettimana: null, giornoMese: null, dataSpecifica: null, assegnato: nomeA, completato: false },
    { id: 2, titolo: 'Portare la spazzatura', frequenza: 'settimanale', giornoSettimana: 1, giornoMese: null, dataSpecifica: null, assegnato: nomeB, completato: false },
    { id: 3, titolo: 'Pulire il bagno', frequenza: 'settimanale', giornoSettimana: 6, giornoMese: null, dataSpecifica: null, assegnato: 'entrambi', completato: false },
    { id: 4, titolo: 'Pagare affitto', frequenza: 'mensile', giornoSettimana: null, giornoMese: 1, dataSpecifica: null, assegnato: nomeA, completato: false },
    { id: 5, titolo: 'Controllo caldaia', frequenza: 'specifica', giornoSettimana: null, giornoMese: null, dataSpecifica: traUnMese, assegnato: nomeB, completato: false },
  ];
}

export function AttivitaProvider({ children }) {
  const [attivita, setAttivita] = useLocalStorage('casaapp_attivita', attivitaIniziali);
  const [storicoCompletamenti, setStoricoCompletamenti] = useLocalStorage('casaapp_storico_attivita', () => []);

  useEffect(() => {
    const resetSeNecessario = () => {
      const oggiStr = oggiLocale();
      const ultimoReset = localStorage.getItem('casaapp_ultimo_reset');
      if (ultimoReset === oggiStr) return;

      const oggi = new Date();
      // Fix UTC bug: parse ultimoReset as local midnight
      const ultima = ultimoReset ? new Date(ultimoReset + 'T00:00:00') : null;

      const nuovaSettimana = !ultima || inizioSettimana(oggi) !== inizioSettimana(ultima);
      const nuovoMese = !ultima ||
        oggi.getMonth() !== ultima.getMonth() ||
        oggi.getFullYear() !== ultima.getFullYear();

      setAttivita(prev => prev.map(att => {
        if (!att.completato) return att;
        if (att.frequenza === 'giornaliera') return { ...att, completato: false, completatoDa: null };
        if (att.frequenza === 'settimanale' && nuovaSettimana) return { ...att, completato: false, completatoDa: null };
        if (att.frequenza === 'mensile' && nuovoMese) return { ...att, completato: false, completatoDa: null };
        return att;
      }));

      localStorage.setItem('casaapp_ultimo_reset', oggiStr);
    };

    resetSeNecessario();

    // Riesegui il reset anche quando l'app torna in primo piano dopo una notte
    const handleVisibility = () => { if (!document.hidden) resetSeNecessario(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [setAttivita]);

  const aggiungiAttivita = (nuovaAttivita) => {
    setAttivita(prev => [...prev, { ...nuovaAttivita, id: Date.now(), completato: false }]);
  };

  const toggleAttivita = (id, utente) => {
    const att = attivita.find(a => a.id === id);
    if (!att) return;

    const nuovoStato = !att.completato;
    const oggi = oggiLocale();

    setAttivita(prev =>
      prev.map(a => a.id === id
        ? { ...a, completato: nuovoStato, completatoDa: nuovoStato ? utente : null }
        : a
      )
    );

    if (nuovoStato) {
      setStoricoCompletamenti(prev => [...prev, {
        id: Date.now(),
        taskId: id,
        taskTitolo: att.titolo,
        completatoDa: utente || 'sconosciuto',
        data: oggi,
      }]);
    } else {
      setStoricoCompletamenti(prev => {
        const idx = [...prev].reverse().findIndex(s => s.taskId === id);
        if (idx === -1) return prev;
        return prev.filter((_, i) => i !== prev.length - 1 - idx);
      });
    }
  };

  const eliminaAttivita = (id) => {
    setAttivita(prev => prev.filter(a => a.id !== id));
  };

  const modificaAttivita = (id, datiAggiornati) => {
    setAttivita(prev => prev.map(a => a.id === id ? { ...a, ...datiAggiornati } : a));
  };

  const aggiornaRiferimentiUtente = (vecchioNome, nuovoNome) => {
    setAttivita(prev => prev.map(a => ({
      ...a,
      assegnato: a.assegnato === vecchioNome ? nuovoNome : a.assegnato,
      completatoDa: a.completatoDa === vecchioNome ? nuovoNome : a.completatoDa,
    })));
    setStoricoCompletamenti(prev => prev.map(s => ({
      ...s,
      completatoDa: s.completatoDa === vecchioNome ? nuovoNome : s.completatoDa,
    })));
  };

  return (
    <AttivitaContext.Provider value={{ attivita, storicoCompletamenti, aggiungiAttivita, toggleAttivita, eliminaAttivita, modificaAttivita, aggiornaRiferimentiUtente }}>
      {children}
    </AttivitaContext.Provider>
  );
}

export function useAttivita() {
  const context = useContext(AttivitaContext);
  if (!context) throw new Error('useAttivita deve essere usato dentro AttivitaProvider');
  return context;
}
