import React from 'react';
import { render } from '@testing-library/react';
import { AppContext } from '../context/AppContext';
import { SpeseProvider } from '../context/SpeseContext';
import { AttivitaProvider } from '../context/AttivitaContext';
import { ImpostazioniProvider } from '../context/ImpostazioniContext';

const UTENTI_TEST = [
  { id: 'u_riccardo', nome: 'Riccardo', coloreAvatar: '#5C6BC0', coloreApp: '#5C6BC0', coloreSecondario: '#26A69A', modalita: 'auto' },
  { id: 'u_federico', nome: 'Federico', coloreAvatar: '#26A69A', coloreApp: '#26A69A', coloreSecondario: '#5C6BC0', modalita: 'auto' },
];

function ProviderCompleto({ children, utente = 'Riccardo' }) {
  const utenteAttivo = UTENTI_TEST.find(u => u.nome === utente) || UTENTI_TEST[0];
  return (
    <AppContext.Provider value={{
      utenti: UTENTI_TEST,
      utenteAttivo,
      utenteAttivoId: utenteAttivo.id,
      setUtenteAttivoId: jest.fn(),
      aggiungiUtente: jest.fn(),
      modificaUtente: jest.fn(),
      eliminaUtente: jest.fn(),
    }}>
      <SpeseProvider>
        <AttivitaProvider>
          <ImpostazioniProvider>
            {children}
          </ImpostazioniProvider>
        </AttivitaProvider>
      </SpeseProvider>
    </AppContext.Provider>
  );
}

export function renderConContesti(ui, { utente = 'Riccardo' } = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ProviderCompleto utente={utente}>{children}</ProviderCompleto>
    ),
  });
}
