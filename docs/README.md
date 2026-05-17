# 🏠 CasaApp

App per la gestione condivisa di **spese** e **attività domestiche** tra coinquilini.

## 👥 Utenti
- **Riccardo**
- **Federico**

## ✨ Funzionalità
- 📊 Registrazione spese mensili con calcolo automatico del bilancio
- ✅ Gestione attività domestiche giornaliere, settimanali e mensili
- 🎨 Tema personalizzabile (colore app, colore avatar, modalità chiara/scura)
- 💾 Dati salvati in locale su ogni dispositivo (localStorage)

## 🛠️ Tecnologie
- React 19
- Material UI (MUI)
- React Router DOM
- localStorage per la persistenza dei dati

## 📁 Struttura progetto
- `src/components/` — componenti riutilizzabili
- `src/pages/` — schermate principali
- `src/context/` — stato globale dell'app (AppContext, SpeseContext, AttivitaContext, ImpostazioniContext)
- `src/utils/` — funzioni di utilità
- `tests/` — test automatici
- `docs/` — documentazione

## 🚀 Avviare il progetto in locale
```bash
npm install
npm start

## 🧪 Eseguire i test
npm test

## 📱 Installare su iPhone
Apri Safari e vai sull'URL dell'app
Clicca il tasto Condividi
Seleziona "Aggiungi a schermata Home"