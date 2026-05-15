# 🧩 Componenti CasaApp

## Layout

### `Navbar.jsx` ✅
Barra di navigazione superiore.
- Mostra il titolo della schermata corrente
- Mostra l'avatar dell'utente attivo (Riccardo / Federico)
- Cliccando l'avatar si torna alla schermata di benvenuto

### `BottomNav.jsx` ✅
Navigazione inferiore stile app mobile.
- 4 tab: **Home**, **Spese**, **Attività**, **Impostazioni**
- Evidenzia la tab attiva

---

## Spese

### `SpesaCard.jsx`
Card che mostra una singola spesa.
- Props: `importo`, `descrizione`, `categoria`, `pagatore`, `data`

### `AggiuntaSpesa.jsx`
Form per aggiungere una nuova spesa.
- Campi: importo, descrizione, categoria, chi ha pagato

### `Bilancio.jsx`
Mostra il riepilogo del bilancio tra i due coinquilini.
- Chi deve quanto a chi
- Totale spese del mese

---

## Attività

### `TaskCard.jsx`
Card che mostra una singola attività.
- Props: `titolo`, `frequenza`, `assegnato`, `completato`, `scadenza`
- Bottone per spuntare come completata

### `AggiuntaTask.jsx`
Form per aggiungere una nuova attività.
- Campi: titolo, frequenza, assegnazione

### `TaskList.jsx`
Lista di attività filtrate per frequenza.
- Sezioni: Oggi, Questa settimana, Questo mese

---

## Pages

### `Home.jsx`
Schermata principale.
- Riepilogo rapido spese del mese
- Attività in scadenza oggi
- Selezione utente attivo

### `Spese.jsx`
Schermata completa delle spese.
- Lista spese + bilancio

### `Attivita.jsx`
Schermata completa delle attività.
- Lista task divisi per frequenza

---

## Impostazioni

### `Impostazioni.jsx` (page)
Schermata impostazioni generale.
- Accesso alle sezioni: Profili, Tema, Categorie, Casa

### `ImpostazioniProfilo.jsx`
Modifica nome e avatar utente.

### `ImpostazioniTema.jsx`
Selezione colore tema e modalità chiara/scura.

### `ImpostazioniCategorie.jsx`
Gestione categorie spese personalizzate.