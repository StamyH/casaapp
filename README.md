# 🏠 CasaApp

**CasaApp** è una Progressive Web App (PWA) pensata per la gestione condivisa di una casa: tiene traccia delle spese comuni, organizza le attività domestiche e mostra statistiche aggregate per tutti i coinquilini.

🔗 **Live demo:** https://StamyH.github.io/casaapp

---

## Indice

- [Funzionalità](#funzionalità)
- [Stack tecnologico](#stack-tecnologico)
- [Installazione e avvio](#installazione-e-avvio)
- [Script disponibili](#script-disponibili)
- [Deploy](#deploy)
- [Struttura del progetto](#struttura-del-progetto)
- [Documentazione dettagliata](#documentazione-dettagliata)

---

## Funzionalità

### 💸 Gestione Spese
- Registrazione spese con importo, categoria, pagatore e modalità di divisione
- Divisione equa, tutto a sé, tutto all'altro, o percentuale custom
- Spese ricorrenti con generazione automatica mensile
- Export CSV
- Filtro per categoria, ricerca testuale e ordinamento

### 📊 Bilancio
- Calcolo automatico dei debiti con algoritmo greedy multi-utente
- Saldo debito con un click (registra una transazione di pareggio)
- Filtro bilancio per categoria
- Storico saldi con date

### ✅ Attività domestiche
- Task con frequenza giornaliera, settimanale, mensile o data specifica
- Reset automatico alla scadenza (giornaliero/settimanale/mensile)
- Storico completamenti per utente
- Assegnazione a uno o tutti gli utenti

### 📅 Calendario
- Griglia mensile navigabile
- Dot colorati per utente sui giorni con attività
- Checkbox inline per completare task dal calendario

### 📈 Statistiche
- Spese per categoria con barre comparative
- Andamento mensile con chip trend (+/- vs mese precedente)
- Completamenti attività per utente
- Grafico andamento ultimi 6 mesi

### ⚙️ Impostazioni
- Profilo utente con avatar colorato
- Tema per utente (colore primario, colore avatar, modalità chiara/scura/auto)
- Categorie spese personalizzabili con icona emoji
- Gestione utenti e nome della casa

---

## Stack tecnologico

| Layer | Tecnologia |
|---|---|
| Framework | React 19 |
| UI | Material UI (MUI) v9 + Emotion |
| Routing | React Router v7 |
| State | React Context API + `useLocalStorage` hook |
| Persistenza | `localStorage` (offline-first) |
| Testing | Jest + React Testing Library |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |
| Font | Inter / Roboto |

---

## Installazione e avvio

### Prerequisiti
- Node.js ≥ 18
- npm ≥ 9

### Setup

```bash
# Clona il repository
git clone https://github.com/StamyH/casaapp.git
cd casaapp

# Installa le dipendenze
npm install

# Avvia in modalità sviluppo
npm start
```

L'app sarà disponibile su `http://localhost:3000`.

---

## Script disponibili

| Comando | Descrizione |
|---|---|
| `npm start` | Avvia il server di sviluppo con hot-reload |
| `npm test` | Esegue la suite di test in modalità watch |
| `npm run build` | Crea la build di produzione ottimizzata in `./build` |
| `npm run deploy` | Esegue la build e pubblica su GitHub Pages |

---

## Deploy

Il deploy su **GitHub Pages** è completamente automatizzato tramite GitHub Actions.

**Flusso automatico:**
1. Ogni `push` sul branch `main` avvia la pipeline CI/CD
2. Il workflow installa le dipendenze, esegue i test e lancia la build
3. Se tutto passa, pubblica la cartella `./build` su GitHub Pages

**Deploy manuale:**
```bash
npm run deploy
```

La homepage dell'app è configurata nel `package.json`:
```json
"homepage": "https://StamyH.github.io/casaapp"
```

---

## Struttura del progetto

```
casaapp/
├── public/               # File statici (favicon, manifest PWA, 404.html)
├── src/
│   ├── App.jsx           # Root component: routing, theme, auth guard
│   ├── index.js          # Entry point React
│   ├── styles.css        # CSS globale + variabili animazioni
│   ├── index.css         # Reset / base styles
│   │
│   ├── pages/            # Pagine dell'app (una per route)
│   │   ├── Home.jsx
│   │   ├── Spese.jsx
│   │   ├── Attivita.jsx
│   │   ├── Calendario.jsx
│   │   ├── Statistiche.jsx
│   │   ├── Benvenuto.jsx
│   │   ├── Impostazioni.jsx
│   │   ├── ImpostazioniProfilo.jsx
│   │   ├── ImpostazioniTema.jsx
│   │   ├── ImpostazioniUtenti.jsx
│   │   ├── ImpostazioniCategorie.jsx
│   │   └── ImpostazioniCasa.jsx
│   │
│   ├── components/       # Componenti riutilizzabili
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── BottomNav.jsx
│   │   ├── Spese/
│   │   │   ├── AggiuntaSpesa.jsx
│   │   │   ├── Bilancio.jsx
│   │   │   └── SpesaCard.jsx
│   │   ├── Attivita/
│   │   │   ├── AggiuntaTask.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── RiepilogoAttivita.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── ImpostazioniDrawer.jsx
│   │
│   ├── context/          # React Context (stato globale)
│   │   ├── AppContext.jsx          # Utenti e utente attivo
│   │   ├── SpeseContext.jsx        # Lista spese + CRUD
│   │   ├── AttivitaContext.jsx     # Lista attività + CRUD + storico
│   │   └── ImpostazioniContext.jsx # Impostazioni casa/categorie
│   │
│   ├── hooks/            # Custom hooks
│   │   ├── useLocalStorage.js      # Persistenza reattiva in localStorage
│   │   └── useFilters.js           # Logica filtri e ordinamento
│   │
│   ├── utils/
│   │   └── helpers.js    # Funzioni pure: calcoli bilancio, formattazioni
│   │
│   └── styles/
│       └── animations.css # Keyframe CSS per le animazioni
│
├── docs/                 # Documentazione tecnica
│   ├── ARCHITETTURA.md
│   ├── COMPONENTI.md
│   ├── REQUISITI.md
│   └── GUIDA_SVILUPPO.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml        # Pipeline CI (test)
│       └── deploy.yml    # Pipeline CD (deploy su GitHub Pages)
│
└── package.json
```

---

## Documentazione dettagliata

| File | Contenuto |
|---|---|
| [docs/ARCHITETTURA.md](docs/ARCHITETTURA.md) | Architettura tecnica, data flow, schema localStorage |
| [docs/COMPONENTI.md](docs/COMPONENTI.md) | Tutti i componenti, pagine, hook e context |
| [docs/REQUISITI.md](docs/REQUISITI.md) | Requisiti funzionali e stato di implementazione |
| [docs/GUIDA_SVILUPPO.md](docs/GUIDA_SVILUPPO.md) | Setup sviluppo, test, convenzioni di codice |
