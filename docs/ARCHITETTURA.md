# 🏗️ Architettura di CasaApp

## Panoramica

CasaApp è una Single Page Application (SPA) React che funziona interamente lato client. Non esiste un backend: tutti i dati sono persistiti in `localStorage` del browser. L'architettura è pensata per essere offline-first e installabile come PWA.

---

## Stack tecnologico

| Livello | Scelta | Versione |
|---|---|---|
| UI Framework | React | 19 |
| Component library | Material UI (MUI) | 9 |
| CSS-in-JS | Emotion (peer di MUI) | 11 |
| Routing | React Router DOM | 7 |
| State management | React Context API | — |
| Persistenza | `localStorage` | — |
| Test | Jest + React Testing Library | — |
| Build tool | Create React App (react-scripts) | 5 |
| CI/CD | GitHub Actions | — |
| Hosting | GitHub Pages | — |

---

## Architettura dei componenti

```
App.jsx
└── ErrorBoundary
    └── AppProvider (context utenti)
        └── SpeseProvider (context spese)
            └── AttivitaProvider (context attività)
                └── ImpostazioniProvider (context impostazioni)
                    └── BrowserRouter
                        └── AuthGuard (theme + routing guard)
                            ├── Navbar
                            ├── Routes → [pagine]
                            └── BottomNav
```

### AuthGuard

`AuthGuard` è il componente che gestisce:

1. **Autenticazione**: reindirizza a `/benvenuto` se non c'è un utente attivo
2. **Tema MUI**: crea dinamicamente il tema con il colore dell'utente attivo e la modalità chiara/scura
3. **Service Worker**: ascolta l'evento `swUpdateAvailable` e mostra uno Snackbar con il pulsante "Aggiorna"
4. **Responsive dark mode**: rileva la preferenza di sistema con `matchMedia` e la aggiorna in tempo reale

---

## Data Flow

```
localStorage
     │
     ▼
Context (AppContext / SpeseContext / AttivitaContext / ImpostazioniContext)
     │
     ▼
Pagine (Home, Spese, Attivita, ...)
     │
     ▼
Componenti (SpesaCard, TaskCard, Bilancio, ...)
```

Ogni Context:
- Inizializza lo stato leggendo da `localStorage` al mount
- Espone funzioni CRUD (aggiungi, modifica, elimina)
- Persiste automaticamente ogni modifica via `useLocalStorage` hook

---

## Schema localStorage

Tutte le chiavi usano il prefisso `casaapp_` per evitare conflitti.

| Chiave | Tipo | Descrizione |
|---|---|---|
| `casaapp_utenti` | `Utente[]` | Array di tutti gli utenti |
| `casaapp_utente` | `string` | ID dell'utente attivo (es. `"u_riccardo"`) |
| `casaapp_spese` | `Spesa[]` | Array di tutte le spese |
| `casaapp_attivita` | `Attivita[]` | Array di tutte le attività |
| `casaapp_storico_attivita` | `Completamento[]` | Storico completamenti attività |
| `casaapp_impostazioni` | `Impostazioni` | Nome casa, categorie, primo giorno settimana |
| `casaapp_ultimo_reset` | `string` | Data `YYYY-MM-DD` dell'ultimo reset attività |
| `casaapp_ultima_espansione_ricorrenti` | `string` | Mese `YYYY-MM` dell'ultima generazione ricorrenti |

---

## Struttura dei dati (TypeScript-like)

### Utente

```ts
interface Utente {
  id: string;             // es. "u_riccardo", "u_federico", "u_1234567890"
  nome: string;
  coloreAvatar: string;   // hex color, es. "#5C6BC0"
  coloreApp: string;      // hex color colore primario MUI
  coloreSecondario: string;
  modalita: 'light' | 'dark' | 'auto';
}
```

### Spesa

```ts
interface Spesa {
  id: number;             // timestamp Date.now()
  descrizione: string;
  importo: number;        // euro
  categoria: string;      // "spesa" | "bolletta" | "affitto" | "altro" | custom | "saldo"
  pagatore: string;       // nome utente
  altroUtente?: string;   // legacy: nome del secondo utente (2 persone)
  partecipanti?: string[]; // array nomi per multi-utente
  divisione: 'equa' | 'metà' | 'tutto_mio' | 'tutto_altro' | 'percentuale';
  percentuale: number;    // quota % del pagatore (usata solo con 'percentuale')
  data: string;           // "YYYY-MM-DD"
  ricorrente: boolean;
  tipo?: 'saldo';         // presente solo per le transazioni di pareggio
}
```

### Attivita

```ts
interface Attivita {
  id: number;             // timestamp Date.now()
  titolo: string;
  frequenza: 'giornaliera' | 'settimanale' | 'mensile' | 'specifica';
  giornoSettimana: number | null;  // 0=dom, 1=lun, ..., 6=sab
  giornoMese: number | null;       // 1-31
  dataSpecifica: string | null;    // "YYYY-MM-DD"
  assegnato: string;               // nome utente o "entrambi"
  completato: boolean;
  completatoDa: string | null;     // nome utente che ha completato
  priorita?: 'alta' | 'media' | 'bassa';
  dataFine?: string;               // "YYYY-MM-DD", per ricorrenti con scadenza
}
```

### Completamento (storico)

```ts
interface Completamento {
  id: number;
  taskId: number;
  taskTitolo: string;
  completatoDa: string;  // nome utente
  data: string;          // "YYYY-MM-DD"
}
```

### Impostazioni

```ts
interface Impostazioni {
  nomeCasa: string;
  primoGiornoSettimana: number;  // 0=dom, 1=lun
  categorie: { nome: string; icona: string }[];
}
```

---

## Algoritmo di calcolo del bilancio

Implementato in `src/utils/helpers.js` — funzione `calcolaBilancio`.

**Step 1 — Calcolo saldi netti per utente:**

Per ogni spesa, si calcola la quota di ciascun partecipante tramite `calcolaQuote`. Il pagatore accumula un credito pari alla somma delle quote degli altri; gli altri accumulano un debito.

**Step 2 — Algoritmo greedy di minimizzazione transazioni:**

Con N utenti e saldi netti già calcolati:
1. Trova il creditore massimo e il debitore massimo
2. Il debitore paga il minimo tra il suo debito e il credito del creditore
3. Aggiorna i saldi e ripeti finché tutti i saldi sono vicini a zero (< 0.01 €)

Questo produce il numero minimo di transazioni necessarie per pareggiare tutti i debiti.

**Modalità di divisione:**

| `divisione` | Comportamento |
|---|---|
| `equa` / `metà` | Importo diviso equamente tra tutti i partecipanti |
| `tutto_mio` | Il pagatore si accolla tutto; gli altri devono 0 |
| `tutto_altro` | Gli altri si dividono l'intero importo; il pagatore deve 0 |
| `percentuale` | Il pagatore paga la sua %; il resto diviso tra gli altri |

---

## Reset automatico attività

Implementato in `AttivitaContext.jsx`.

Al mount del context (e ogni volta che l'app torna in primo piano via `visibilitychange`):

1. Si legge `casaapp_ultimo_reset` da localStorage
2. Se la data coincide con oggi, si esce senza fare nulla
3. Altrimenti:
   - Le attività **giornaliere** completate vengono resettate sempre
   - Le attività **settimanali** completate vengono resettate se è una nuova settimana (lunedì)
   - Le attività **mensili** completate vengono resettate se è un nuovo mese
4. Si scrive la data odierna in `casaapp_ultimo_reset`

Il parsing delle date usa sempre il suffisso `T00:00:00` per evitare il bug UTC di JavaScript (dove `new Date("2024-01-15")` viene interpretato come mezzanotte UTC, che in alcuni fusi diventa il giorno precedente).

---

## Generazione spese ricorrenti

Implementato in `SpeseContext.jsx`.

Al mount:
1. Si controlla `casaapp_ultima_espansione_ricorrenti` — se già uguale al mese corrente, si esce
2. Si trovano tutte le spese ricorrenti del mese precedente
3. Per ognuna, si verifica che non esista già una corrispondente nel mese corrente (per deduplicazione)
4. Le nuove spese vengono create con la data al `01` del mese corrente
5. Si salva il mese corrente in `casaapp_ultima_espansione_ricorrenti`

---

## Routing

| Path | Componente | Auth richiesta |
|---|---|---|
| `/benvenuto` | `Benvenuto` | No |
| `/` | `Home` | Sì |
| `/spese` | `Spese` | Sì |
| `/attivita` | `Attivita` | Sì |
| `/statistiche` | `Statistiche` | Sì |
| `/calendario` | `Calendario` | Sì |
| `/impostazioni` | `Impostazioni` | Sì |
| `/impostazioni/profilo` | `ImpostazioniProfilo` | Sì |
| `/impostazioni/tema` | `ImpostazioniTema` | Sì |
| `/impostazioni/utenti` | `ImpostazioniUtenti` | Sì |
| `/impostazioni/categorie` | `ImpostazioniCategorie` | Sì |
| `/impostazioni/casa` | `ImpostazioniCasa` | Sì |
| `*` | Redirect a `/` | — |

L'"autenticazione" è semplice: se `utenteAttivo` è `null` e il path non è `/benvenuto`, si viene reindirizzati alla schermata di selezione profilo.

---

## Tema e personalizzazione visiva

Il tema MUI viene ricreato a ogni cambio di `utenteAttivo` o di preferenza sistema tramite `useMemo`:

```js
createTheme({
  palette: {
    mode: modalitaEffettiva,           // 'light' | 'dark'
    primary: { main: utenteAttivo?.coloreApp },
    secondary: { main: '#26A69A' },
    background: { default: modalitaEffettiva === 'dark' ? '#121212' : '#F5F5F5' }
  },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
  shape: { borderRadius: 16 },
})
```

I **6 colori disponibili** per tema e avatar sono definiti in `helpers.js`:
- Indaco `#5C6BC0`, Verde acqua `#26A69A`, Arancione `#FF7043`
- Rosa `#EC407A`, Viola `#AB47BC`, Azzurro `#42A5F5`

Ogni utente occupa un colore univoco — il massimo di utenti è quindi 6 (`MAX_UTENTI = 6`).

---

## Service Worker e PWA

Il file `src/service-worker.js` (generato da CRA con Workbox) implementa una strategia **cache-first** per gli asset statici, permettendo l'uso offline dell'app.

La registrazione avviene in `src/serviceWorkerRegistration.js`. Quando è disponibile un aggiornamento, viene emesso l'evento custom `swUpdateAvailable` con il riferimento al nuovo service worker. `AuthGuard` lo intercetta e mostra uno Snackbar con il pulsante "Aggiorna".

---

## CI/CD

Due workflow GitHub Actions:

**`.github/workflows/ci.yml`** — si attiva su ogni push/PR:
- Checkout → Setup Node 24 → `npm ci` → `npm test`

**`.github/workflows/deploy.yml`** — si attiva solo su push al branch `main`:
- Checkout → Setup Node 24 → `npm ci` → `npm test` → `npm run build` → Upload artifact → Deploy su GitHub Pages
