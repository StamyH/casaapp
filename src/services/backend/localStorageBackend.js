/**
 * Backend: localStorage (default)
 *
 * Tutte le operazioni sono sincrone ma wrappate in Promise
 * per rispettare la stessa interfaccia degli altri backend.
 */

const localStorageBackend = {
  name: 'localStorage',
  label: 'Locale (localStorage)',

  /** Verifica disponibilità */
  async isAvailable() {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return true;
    } catch {
      return false;
    }
  },

  /** Legge un valore (restituisce il valore parsed o null) */
  async get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /** Scrive un valore */
  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  /** Elimina un valore */
  async remove(key) {
    localStorage.removeItem(key);
  },

  /**
   * Sottoscrizione ai cambiamenti (localStorage non ha eventi nativi in-tab,
   * usiamo un polling leggero ogni 500ms come fallback)
   * Restituisce la funzione di unsubscribe.
   */
  subscribe(key, callback) {
    let last = localStorage.getItem(key);
    const interval = setInterval(() => {
      const current = localStorage.getItem(key);
      if (current !== last) {
        last = current;
        try { callback(current !== null ? JSON.parse(current) : null); } catch {}
      }
    }, 500);
    return () => clearInterval(interval);
  },
};

export default localStorageBackend;
