import React, { createContext, useContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [utente, setUtente] = useState(() => {
    try {
      return localStorage.getItem('casaapp_utente') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (utente) {
      localStorage.setItem('casaapp_utente', utente);
    } else {
      localStorage.removeItem('casaapp_utente');
    }
  }, [utente]);

  return (
    <AppContext.Provider value={{ utente, setUtente }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve essere usato dentro AppProvider');
  return context;
}
