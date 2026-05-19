import React, { createContext, useContext, useState, useEffect } from 'react';

const AttivitaContext = createContext();

function inizioSettimana(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - (d.getDay() || 7) + 1);
  return d.toISOString().split('T')[0];
}

function attivitaIniziali() {
  const traUnMese = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

  let nomeA = 'Riccardo', nomeB = 'Federico';
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
  const [attivita, setAttivita] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_attivita');
      return saved ? JSON.parse(saved) : attivitaIniziali();
    } catch {
      return attivitaIniziali();
    }
  });

  const [storicoCompletamenti, setStoricoCompletamenti] = useState(() => {
    try {
      const saved = localStorage.getItem('casaapp_storico_attivita');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('casaapp_attivita', JSON.stringify(attivita));
  }, [attivita]);

  useEffect(() => {
    localStorage.setItem('casaapp_storico_attivita', JSON.stringify(storicoCompletamenti));
  }, [storicoCompletamenti]);

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
      if (att.frequenza === 'giornaliera') return { ...att, completato: false, completatoDa: null };
      if (att.frequenza === 'settimanale' && nuovaSettimana) return { ...att, completato: false, completatoDa: null };
      if (att.frequenza === 'mensile' && nuovoMese) return { ...att, completato: false, completatoDa: null };
      return att;
    }));

    localStorage.setItem('casaapp_ultimo_reset', oggiStr);
  }, []);

  const aggiungiAttivita = (nuovaAttivita) => {
    setAttivita(prev => [...prev, { ...nuovaAttivita, id: Date.now(), completato: false }]);
  };

  const toggleAttivita = (id, utente) => {
    const att = attivita.find(a => a.id === id);
    if (!att) return;

    const nuovoStato = !att.completato;
    const oggi = new Date().toISOString().split('T')[0];

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
