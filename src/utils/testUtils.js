import React from 'react';
import { render } from '@testing-library/react';
import { AppContext } from '../context/AppContext';
import { SpeseProvider } from '../context/SpeseContext';
import { AttivitaProvider } from '../context/AttivitaContext';
import { ImpostazioniProvider } from '../context/ImpostazioniContext';

function ProviderCompleto({ children, utente = 'Riccardo' }) {
  return (
    <AppContext.Provider value={{ utente, setUtente: jest.fn() }}>
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