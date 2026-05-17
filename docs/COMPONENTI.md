# 🧩 Componenti CasaApp

## Context

### `AppContext.jsx`
Gestisce l'utente attivo (Riccardo / Federico) con persistenza localStorage.

### `SpeseContext.jsx`
Gestisce la lista spese con persistenza localStorage.

### `AttivitaContext.jsx`
Gestisce la lista attività con persistenza localStorage.

### `ImpostazioniContext.jsx`
Gestisce le impostazioni (colore app, colore avatar, modalità, categorie, nome casa) con persistenza localStorage.

---

## Layout

### `Navbar.jsx` ✅
Barra di navigazione superiore.
- Mostra il titolo della schermata corrente
- Mostra l'avatar dell'utente attivo con il suo colore personale
- Cliccando l'avatar si torna alla schermata di selezione utente

### `BottomNav.jsx` ✅
Navigazione inferiore stile app mobile.
- 4 tab: **Home**, **Spese**, **Attività**, **Impostazioni**
- Evidenzia la tab attiva

### `ErrorBoundary.jsx` ✅
Cattura errori JavaScript a runtime e mostra una schermata di errore con tasto "Riprova".

---

## Spese

### `SpesaCard.jsx` ✅
Card che mostra una singola spesa.
- Importo, descrizione, categoria, pagatore, data

### `AggiuntaSpesa.jsx` ✅
Form per aggiungere una nuova spesa.
- Campi: importo, descrizione, categoria, chi ha pagato, divisione

### `Bilancio.jsx` ✅
Mostra il riepilogo del bilancio tra i due coinquilini.
- Chi deve quanto a chi, totale spese

---

## Attività

### `TaskCard.jsx` ✅
Card che mostra una singola attività.
- Titolo, frequenza, avatar utente assegnato con colore personale
- Checkbox completamento, bottone elimina

### `AggiuntaTask.jsx` ✅
Form per aggiungere una nuova attività.
- Campi: titolo, frequenza, giorno/data, assegnazione

### `TaskList.jsx` ✅
Lista attività raggruppate per frequenza.

---

## Pages

### `Benvenuto.jsx`
Schermata di selezione utente all'avvio.

### `Home.jsx`
Schermata principale.
- Riepilogo bilancio del mese
- Attività di oggi e prossime attività

### `Spese.jsx`
Schermata completa delle spese.
- Lista spese + bilancio

### `Attivita.jsx`
Schermata completa delle attività.

### `Impostazioni.jsx`
Menu impostazioni con accesso alle sezioni: Profilo, Tema, Categorie, Casa.

### `ImpostazioniProfilo.jsx`
Visualizza nome e avatar dell'utente attivo (sola lettura).
- Il colore avatar si cambia dalla pagina Tema.

### `ImpostazioniTema.jsx`
- Selettore modalità: Chiara / Auto / Scura
- Selettore colore dell'app (applicato in tempo reale)
- Selettore colore del proprio avatar (applicato in tempo reale)

### `ImpostazioniCategorie.jsx`
Gestione categorie spese personalizzate.
- Aggiunta e rimozione categorie

### `ImpostazioniCasa.jsx`
Modifica il nome della casa condivisa.

---

## Utils

### `helpers.js`
Funzioni di utilità per calcolo bilancio e formattazione dati.

---

## Test

### `tests/spese.test.js`
Test logica spese: calcolo bilancio, quote, divisione.

### `tests/attivita.test.js`
Test logica attività: completamento, reset.

### `tests/utils.test.js`
Test funzioni helper.