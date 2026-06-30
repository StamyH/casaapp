import '@testing-library/jest-dom';

// Polyfill per crypto.randomUUID() nell'ambiente Jest (jsdom non lo espone di default)
if (!globalThis.crypto?.randomUUID) {
  const nodeCrypto = require('crypto');
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...globalThis.crypto,
      randomUUID: () => nodeCrypto.randomUUID(),
    },
    writable: true,
    configurable: true,
  });
}