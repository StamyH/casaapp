# 🧩 Componenti CasaApp

## Context

### `AppContext.jsx`
Gestisce utenti e utente attivo con persistenza localStorage. Supporta aggiunta, modifica ed eliminazione utenti.

### `SpeseContext.jsx`
Gestisce la lista spese con persistenza localStorage. Espone: `aggiungiSpesa`, `modificaSpesa`, `eliminaSpesa`, `riassegnaCategoria`, `aggiornaRiferimentiUtente`.

### `AttivitaContext.jsx`
Gestisce la lista attività e lo storico completamenti con persistenza localStorage. Gestisce il reset automatico delle task ricorrenti all'avvio. Espone: `aggiungiAttivita`, `modificaAttivita`, `eliminaAttivita`, `toggleAttivita`, `aggiornaRiferimentiUtente`.

### `ImpostazioniContext.jsx`
Gestisce impostazioni per-utente (coloreApp, coloreAvatar, modalita) e globali (categorie, nomeCasa) con persistenza localStorage.

---

## Layout

### `Navbar.jsx`
Barra di navigazione superiore. Mostra il titolo della schermata corrente e l'avatar dell'utente attivo. Cliccando l'avatar apre il drawer impostazioni.

### `BottomNav.jsx`
Navigazione inferiore mobile con 5 tab: **Home**, **Spese**, **Attività**, **Calendario**, **Statistiche**.

### `ErrorBoundary.jsx`
Cattura errori JavaScript a runtime e mostra una schermata di errore con tasto "Riprova".

---

## Spese

### `SpesaCard.jsx`
Card che mostra una singola spesa: importo, descrizione, categoria con icona, pagatore, data, chip divisione.

### `AggiuntaSpesa.jsx`
Drawer bottom per aggiungere o modificare una spesa. Supporta selezione multi-utente per la divisione, chip partecipanti, anteprima quote.

### `Bilancio.jsx`
Card gradiente con riepilogo bilancio. Mostra tutte le coppie debitore/creditore (`tuttiDebiti`). Filtro per categoria tramite chip. Dialog di conferma saldo.

---

## Attività

### `TaskCard.jsx`
Card per una singola attività. Mostra titolo, frequenza, priorità, avatar utente con colore personale, checkbox completamento.

### `AggiuntaTask.jsx`
Drawer bottom per aggiungere o modificare un'attività. Campi: titolo, priorità, frequenza, giorno/data, data fine, assegnazione.

### `TaskList.jsx`
Lista attività raggruppate per frequenza (giornaliera, settimanale, mensile, specifica), ordinate per priorità. Nasconde task scadute e completate se richiesto.

### `RiepilogoAttivita.jsx`
Card gradiente con statistiche giornaliere e settimanali dell'utente attivo: completamenti oggi e questa settimana.

---

## Calendario

### `Calendario.jsx` (page)
Griglia mensile navigabile. Ogni cella mostra dot colorati (uno per utente coinvolto). Tap su un giorno mostra la lista delle attività di quel giorno con checkbox inline e modifica. FAB per aggiungere nuova attività. Esporta `getAttivitaPerData(attivita, dataStr)` usata anche da Home.

---

## Pages

### `Benvenuto.jsx`
Schermata di selezione utente all'avvio.

### `Home.jsx`
Schermata principale.
- Bilancio del mese cliccabile → /spese
- Riquadro statistiche rapide: totale speso mese + % attività di oggi
- Strip settimanale (Lun→Dom) con dot per utente, link al calendario
- Attività di oggi con checkbox, intestazione cliccabile → /attivita
- Prossime attività, intestazione cliccabile → /attivita

### `Spese.jsx`
Lista spese con ricerca, filtri, ordinamento e bilancio.

### `Attivita.jsx`
Lista attività con filtro utente, toggle nascondi completate, riepilogo e drawer aggiunta/modifica.

### `Calendario.jsx`
Pagina calendario (vedi sezione Calendario).

### `Statistiche.jsx`
Statistiche mensili navigabili: bilancio, spese per categoria, pagamenti per utente, completamenti, task trascurate, andamento 6 mesi.

### `Impostazioni.jsx`
Menu impostazioni con accesso alle sezioni: Profilo, Tema, Categorie, Casa, Utenti.

### `ImpostazioniProfilo.jsx`
Visualizza nome e avatar dell'utente attivo. Rimanda a Utenti per modificare il nome.

### `ImpostazioniTema.jsx`
Selettore modalità (chiara/auto/scura), colore app e colore avatar in tempo reale.

### `ImpostazioniCategorie.jsx`
Gestione categorie spese: aggiunta con icona, eliminazione con dialog di scelta categoria fallback.

### `ImpostazioniCasa.jsx`
Modifica il nome della casa condivisa.

### `ImpostazioniUtenti.jsx`
Aggiunta, modifica (nome + colori) ed eliminazione utenti. Aggiorna automaticamente i riferimenti in spese e attività.

---

## Utils

### `helpers.js`
- `oggiLocale()` — data odierna YYYY-MM-DD nel fuso locale (evita bug UTC di toISOString)
- `formattaImporto(n)` — formatta numero come importo in euro (it-IT)
- `formattaData(d)` — formatta data in italiano
- `calcolaQuote(importo, pagatore, partecipantiOrAltro, divisione, percentuale)` — calcola quote per una spesa; accetta stringa (legacy 2 utenti) o array
- `calcolaBilancio(spese, utenti)` — bilancio complessivo con algoritmo greedy; restituisce `{ debitore, creditore, importoDebito, bilancioPerUtente, tuttiDebiti }`
- `raggruppaPerMese(spese)` — raggruppa spese per chiave mese

---

## Test

### `src/utils/helpers.test.js`
`oggiLocale`, `formattaImporto`, `calcolaQuote` (2 e 3 utenti, tutte le divisioni), `calcolaBilancio` (2 e 3 utenti, `tuttiDebiti`).

### `src/context/SpeseContext.test.jsx`
Aggiunta, eliminazione, modifica spese, riassegnazione categoria.

### `src/context/AttivitaContext.test.jsx`
Aggiunta, eliminazione, modifica attività, toggle completamento con storico, doppio toggle.

### `src/context/ImpostazioniContext.test.jsx`
Gestione categorie e impostazioni tema.

---

## CI / Deploy

### `.github/workflows/ci.yml`
Eseguito su push e PR verso main: installa dipendenze, controlla vulnerabilità npm, esegue test, build.

### `.github/workflows/deploy.yml`
Eseguito su push a main: esegue test, build e deploy automatico su GitHub Pages (`gh-pages` branch).
