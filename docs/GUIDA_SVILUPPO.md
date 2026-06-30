# 🛠️ Guida allo sviluppo — CasaApp

Questa guida è rivolta agli sviluppatori che vogliono lavorare sul codice di CasaApp: setup dell'ambiente, esecuzione dei test, flusso di deploy e convenzioni di codice.

---

## Prerequisiti

| Tool | Versione minima |
|---|---|
| Node.js | 18 |
| npm | 9 |
| Git | qualsiasi versione recente |

Verifica le versioni installate:
```bash
node -v
npm -v
```

---

## Setup iniziale

```bash
# 1. Clona il repository
git clone https://github.com/StamyH/casaapp.git
cd casaapp

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo
npm start
```

L'app si apre automaticamente su `http://localhost:3000`.

Il server di sviluppo include:
- **Hot Module Replacement** — le modifiche al codice si riflettono istantaneamente senza ricaricare la pagina
- **Proxy automatico** per le route SPA (tutte le route restituiscono `index.html`)
- **ESLint** integrato con output nel terminale e nel browser

---

## Script npm

### `npm start`
Avvia il server di sviluppo in modalità watch. Apre automaticamente il browser.

### `npm test`
Esegue la suite di test con Jest in modalità watch interattiva. Comandi utili durante la sessione test:

| Tasto | Azione |
|---|---|
| `a` | Esegui tutti i test |
| `f` | Esegui solo i test falliti |
| `p` | Filtra per nome file |
| `t` | Filtra per nome test |
| `q` | Esci |

Per eseguire i test una sola volta (come in CI):
```bash
npm test -- --watchAll=false
```

Per vedere la copertura del codice:
```bash
npm test -- --watchAll=false --coverage
```

### `npm run build`
Crea la build di produzione nella cartella `./build`. La build:
- Minimizza JavaScript e CSS
- Aggiunge hash ai nomi dei file per il busting della cache
- Genera il Service Worker Workbox
- È ottimizzata con tree-shaking e code splitting

### `npm run deploy`
Esegue `npm run build` e poi pubblica la cartella `./build` su GitHub Pages tramite `gh-pages`. Richiede i permessi di push sul repository.

---

## Struttura dei file di test

I test seguono la convenzione di CRA: file con estensione `.test.jsx` o `.test.js`, co-locati con il file testato o nella cartella `tests/`.

```
src/
├── utils/
│   └── helpers.test.js          # test funzioni pure
├── context/
│   ├── SpeseContext.test.jsx
│   ├── AttivitaContext.test.jsx
│   └── ImpostazioniContext.test.jsx
└── components/
    ├── Attivita/
    │   ├── AggiuntaTask.test.jsx
    │   └── TaskCard.test.jsx
    └── Spese/
        ├── AggiuntaSpesa.test.jsx
        ├── Bilancio.test.jsx
        └── SpesaCard.test.jsx
```

### Configurazione test

Il file `src/setupTests.js` importa `@testing-library/jest-dom` per le custom matchers (`.toBeInTheDocument()`, `.toHaveTextContent()`, ecc.).

`src/utils/testUtils.js` espone helper per wrappare i componenti con i provider necessari:

```js
import { renderWithProviders } from '../utils/testUtils';

test('mostra la spesa', () => {
  renderWithProviders(<SpesaCard spesa={mockSpesa} />);
  expect(screen.getByText('€ 85,50')).toBeInTheDocument();
});
```

### Mock di localStorage

Jest non ha `localStorage` nel DOM di test (JSDOM). Il setup lo mocka automaticamente tramite `@testing-library/jest-dom`. Per resettare lo stato tra test:

```js
beforeEach(() => {
  localStorage.clear();
});
```

---

## Aggiungere una nuova pagina

1. Crea il file in `src/pages/NuovaPagina.jsx`
2. Aggiungila alle route in `src/App.jsx`:
   ```jsx
   import NuovaPagina from './pages/NuovaPagina';
   // ...
   <Route path="/nuova-pagina" element={<NuovaPagina />} />
   ```
3. Se deve comparire nella bottom nav, aggiorna `src/components/Layout/BottomNav.jsx`
4. Se deve comparire nella navbar, aggiorna il mapping `path → titolo` in `src/components/Layout/Navbar.jsx`

---

## Aggiungere un nuovo context

1. Crea `src/context/NuovoContext.jsx` seguendo il pattern degli altri context:
   ```jsx
   const NuovoContext = createContext();

   export function NuovoProvider({ children }) {
     const [stato, setStato] = useLocalStorage('casaapp_nuovo', () => []);
     // ...
     return (
       <NuovoContext.Provider value={{ stato, /* funzioni */ }}>
         {children}
       </NuovoContext.Provider>
     );
   }

   export function useNuovo() {
     const ctx = useContext(NuovoContext);
     if (!ctx) throw new Error('useNuovo deve essere usato dentro NuovoProvider');
     return ctx;
   }
   ```
2. Wrappa il provider in `App.jsx` nell'ordine corretto
3. Scegli una chiave `casaapp_*` univoca per localStorage

---

## Aggiungere una categoria spesa

Le categorie di default sono definite in `ImpostazioniContext.jsx`:

```js
const IMPOSTAZIONI_INIZIALI = {
  categorie: [
    { nome: 'spesa', icona: '🛒' },
    { nome: 'bolletta', icona: '⚡' },
    { nome: 'affitto', icona: '🏠' },
    { nome: 'altro', icona: '📦' },
  ],
};
```

Le categorie personalizzate si aggiungono dall'interfaccia (Impostazioni → Categorie). Non modificare i nomi delle categorie di default senza aggiornare i dati demo in `SpeseContext.jsx`.

---

## Aggiungere un colore tema

I colori disponibili sono definiti in due posti:

1. `src/utils/helpers.js` — array `COLORI_TEMA` (usato dai selettori tema)
2. `src/context/AppContext.jsx` — array `COLORI_DEFAULT` (usato per assegnare automaticamente il colore a nuovi utenti)

Entrambi devono essere allineati. Il numero massimo di utenti (`MAX_UTENTI`) è uguale alla lunghezza di `COLORI_DEFAULT`.

---

## Convenzioni di codice

### Naming

| Cosa | Convenzione | Esempio |
|---|---|---|
| Componenti React | PascalCase | `TaskCard.jsx` |
| Hook | camelCase con prefisso `use` | `useLocalStorage.js` |
| Context | PascalCase con suffisso `Context` | `AppContext.jsx` |
| Variabili / funzioni | camelCase | `aggiungiSpesa` |
| Costanti globali | UPPER_SNAKE_CASE | `MAX_UTENTI` |
| File CSS | camelCase o kebab-case | `animations.css` |

### Struttura dei componenti

Pattern consigliato per i componenti:

```jsx
// 1. Import React e hook
import React, { useState, useEffect } from 'react';

// 2. Import MUI
import { Box, Typography } from '@mui/material';

// 3. Import context / hook custom
import { useApp } from '../context/AppContext';

// 4. Import utility
import { formattaImporto } from '../utils/helpers';

// 5. Eventuali costanti del modulo
const STILE_CARD = { borderRadius: 3, p: 2 };

// 6. Componente
function MioComponente({ prop1, prop2 }) {
  // hooks prima di tutto
  const { utenteAttivo } = useApp();
  const [stato, setStato] = useState(false);

  // effetti
  useEffect(() => { /* ... */ }, []);

  // handlers
  const gestisciClick = () => { /* ... */ };

  // render
  return (
    <Box sx={STILE_CARD}>
      {/* JSX */}
    </Box>
  );
}

export default MioComponente;
```

### Stile (MUI `sx` prop)

- Usa sempre la `sx` prop di MUI invece di file CSS separati
- Per stili riusabili all'interno dello stesso file, definisci oggetti costanti fuori dal componente (evita ricalcoli a ogni render)
- Per animazioni usa le variabili CSS definite in `src/styles.css`:
  ```js
  sx={{
    animationName: 'itemEnter',
    animationDuration: 'var(--dur-md)',
    animationTimingFunction: 'var(--spring-gentle)',
    animationFillMode: 'both',
  }}
  ```

### Variabili CSS animazioni (`src/styles.css`)

| Variabile | Valore | Uso |
|---|---|---|
| `--dur-sm` | `180ms` | Animazioni brevi (tooltip, ripple) |
| `--dur-md` | `280ms` | Animazioni standard (card enter) |
| `--dur-lg` | `420ms` | Animazioni lente (hero card) |
| `--spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Spring con overshoot |
| `--spring-gentle` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Spring senza overshoot |
| `--ease-out` | `cubic-bezier(0.25, 1, 0.5, 1)` | Ease out classico |

### Date

Usa sempre:
- `oggiLocale()` per ottenere la data di oggi come stringa
- `formatoData(date)` per convertire un `Date` in stringa
- `new Date(dateStr + 'T00:00:00')` per parsare una stringa data (evita il bug UTC)

Non usare `new Date(dateStr)` o `toISOString()` per operazioni locali.

### ID

Gli ID delle entità (spese, attività, completamenti) sono generati con `Date.now()`. Questo è sufficiente per uso locale single-device ma non garantisce unicità in scenari multi-device.

---

## Debug e troubleshooting

### Resettare i dati

Per resettare tutti i dati dell'app (utile durante lo sviluppo):

```js
// Nella console del browser
Object.keys(localStorage)
  .filter(k => k.startsWith('casaapp_'))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

### Ispezionare lo stato dei context

Installa [React Developer Tools](https://react.dev/learn/react-developer-tools) per Chrome/Firefox. I context appaiono nell'albero dei componenti come `AppContext.Provider`, `SpeseContext.Provider`, ecc.

### Il Service Worker in sviluppo

In modalità sviluppo (`npm start`) il Service Worker è disabilitato per default (viene registrato solo in produzione). Per testare il comportamento offline, usa la build di produzione:

```bash
npm run build
npx serve -s build
```

Poi vai su DevTools → Application → Service Workers.

---

## Pipeline CI/CD

### Workflow CI (`.github/workflows/ci.yml`)

Si attiva su ogni push e pull request verso `main`.

Steps:
1. Checkout del codice
2. Setup Node 24 con cache npm
3. `npm ci` — installa le dipendenze in modo deterministico
4. `npm test -- --watchAll=false` — esegue tutti i test

### Workflow Deploy (`.github/workflows/deploy.yml`)

Si attiva solo su push al branch `main`.

Steps:
1. Checkout del codice
2. Setup Node 24 con cache npm
3. `npm ci`
4. `npm test -- --watchAll=false`
5. `npm run build`
6. Upload dell'artefatto `./build` tramite `actions/upload-pages-artifact`
7. Deploy su GitHub Pages tramite `actions/deploy-pages`

Il deploy usa le **GitHub Pages Actions native** (non `gh-pages` branch), che richiedono i permessi `pages: write` e `id-token: write` nel job.

### Variabile d'ambiente CI

Il workflow imposta `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` per forzare l'esecuzione delle Actions con Node 24, evitando avvisi di deprecazione di Node 16.

---

## Roadmap feature in sospeso

Queste feature sono progettate ma non ancora implementate (vedi anche `REQUISITI.md`):

| Feature | Priorità | Note |
|---|---|---|
| Notifica visiva task in ritardo | Media | Badge rosso su attività scadute non completate |
| Modifica nome utente da pagina Profilo | Bassa | Attualmente rimanda a ImpostazioniUtenti |
| PWA installabile su iPhone | Alta | Manca `apple-touch-startup-image` nel manifest |
| Sincronizzazione tra dispositivi | Alta | Richiederebbe un backend (Firebase Realtime DB / Firestore) |
