import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [utente, setUtente] = useState(null);

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