/**
 * Backend: Firebase Firestore
 *
 * Per attivare questo backend:
 * 1. Crea un progetto su https://console.firebase.google.com
 * 2. Abilita Firestore Database (modalità produzione o test)
 * 3. Copia le credenziali nell'oggetto `config` salvato nelle impostazioni
 * 4. Installa firebase: `npm install firebase`
 *
 * Struttura Firestore:
 *   /casaapp/{nomeCasa}/data/{key}  →  { value: <dati> }
 *
 * TODO: implementare autenticazione Firebase Auth per proteggere i dati.
 */

// Le importazioni Firebase sono lazy per non appesantire il bundle
// quando il backend non è attivo.
let _firestore = null;
let _app = null;

async function getFirestore(config) {
  if (_firestore) return _firestore;

  const { initializeApp, getApps } = await import('firebase/app');
  const { getFirestore: fsGet } = await import('firebase/firestore');

  const existingApp = getApps().find(a => a.name === 'casaapp');
  _app = existingApp || initializeApp(config, 'casaapp');
  _firestore = fsGet(_app);
  return _firestore;
}

function docPath(nomeCasa, key) {
  // Sanitize: Firestore non accetta '/' nei documenti
  const safeKey = key.replace(/\//g, '__');
  return `casaapp/${nomeCasa}/data/${safeKey}`;
}

function buildBackend(config) {
  const nomeCasa = config.nomeCasa || 'default';

  return {
    name: 'firebase',
    label: 'Firebase',

    async isAvailable() {
      try {
        await getFirestore(config);
        return true;
      } catch {
        return false;
      }
    },

    async get(key) {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const db = await getFirestore(config);
        const snap = await getDoc(doc(db, docPath(nomeCasa, key)));
        return snap.exists() ? snap.data().value : null;
      } catch (e) {
        console.error('[Firebase] get error:', e);
        return null;
      }
    },

    async set(key, value) {
      try {
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const db = await getFirestore(config);
        await setDoc(doc(db, docPath(nomeCasa, key)), {
          value,
          aggiornatoIl: serverTimestamp(),
        });
      } catch (e) {
        console.error('[Firebase] set error:', e);
        throw e;
      }
    },

    async remove(key) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const db = await getFirestore(config);
        await deleteDoc(doc(db, docPath(nomeCasa, key)));
      } catch (e) {
        console.error('[Firebase] remove error:', e);
        throw e;
      }
    },

    subscribe(key, callback) {
      let unsubscribe = () => {};
      (async () => {
        try {
          const { doc, onSnapshot } = await import('firebase/firestore');
          const db = await getFirestore(config);
          unsubscribe = onSnapshot(
            doc(db, docPath(nomeCasa, key)),
            (snap) => {
              callback(snap.exists() ? snap.data().value : null);
            },
            (err) => console.error('[Firebase] subscribe error:', err)
          );
        } catch (e) {
          console.error('[Firebase] subscribe setup error:', e);
        }
      })();
      return () => unsubscribe();
    },
  };
}

export default buildBackend;

/**
 * Struttura config Firebase attesa:
 * {
 *   apiKey: "...",
 *   authDomain: "....firebaseapp.com",
 *   projectId: "...",
 *   storageBucket: "....appspot.com",
 *   messagingSenderId: "...",
 *   appId: "...",
 *   nomeCasa: "casa_mia"   // namespace Firestore (opzionale, default: "default")
 * }
 */
