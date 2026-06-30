import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  loadBackendConfig,
  saveBackendConfig,
  getBackend,
  BACKEND_TYPES,
} from '../services/backend';

const BackendContext = createContext();

export function BackendProvider({ children }) {
  const [config, setConfig] = useState(() => loadBackendConfig());
  const [backend, setBackend] = useState(() => getBackend(loadBackendConfig()));

  const aggiornaConfig = useCallback((nuovaConfig) => {
    saveBackendConfig(nuovaConfig);
    setConfig(nuovaConfig);
    setBackend(getBackend(nuovaConfig));
  }, []);

  const testConnessione = useCallback(async () => {
    return backend.isAvailable();
  }, [backend]);

  return (
    <BackendContext.Provider value={{ config, backend, aggiornaConfig, testConnessione, BACKEND_TYPES }}>
      {children}
    </BackendContext.Provider>
  );
}

export function useBackend() {
  const ctx = useContext(BackendContext);
  if (!ctx) throw new Error('useBackend deve essere usato dentro BackendProvider');
  return ctx;
}
