/**
 * Seleziona il backend attivo in base alla configurazione salvata.
 *
 * La configurazione è salvata in localStorage con la chiave
 * 'casaapp_backend_config' e ha questa struttura:
 * {
 *   tipo: 'localStorage' | 'firebase' | 'raspberryPi',
 *   firebase: { apiKey, authDomain, projectId, ... },
 *   raspberryPi: { url, token }
 * }
 */

import localStorageBackend from './localStorageBackend';
import buildFirebaseBackend from './firebaseBackend';
import buildRaspberryPiBackend from './raspberryPiBackend';

export const BACKEND_TYPES = {
  LOCAL: 'localStorage',
  FIREBASE: 'firebase',
  RASPBERRY_PI: 'raspberryPi',
};

export function loadBackendConfig() {
  try {
    const raw = localStorage.getItem('casaapp_backend_config');
    return raw ? JSON.parse(raw) : { tipo: BACKEND_TYPES.LOCAL };
  } catch {
    return { tipo: BACKEND_TYPES.LOCAL };
  }
}

export function saveBackendConfig(config) {
  localStorage.setItem('casaapp_backend_config', JSON.stringify(config));
}

export function getBackend(config) {
  const tipo = config?.tipo || BACKEND_TYPES.LOCAL;

  switch (tipo) {
    case BACKEND_TYPES.FIREBASE:
      return buildFirebaseBackend(config.firebase || {});
    case BACKEND_TYPES.RASPBERRY_PI:
      return buildRaspberryPiBackend(config.raspberryPi || {});
    case BACKEND_TYPES.LOCAL:
    default:
      return localStorageBackend;
  }
}

export { localStorageBackend };
