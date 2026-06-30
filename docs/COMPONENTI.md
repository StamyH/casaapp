# 🧩 Componenti CasaApp

Questo documento descrive in dettaglio tutti i moduli dell'applicazione: context, pagine, componenti, hook e utility.

---

## Context (stato globale)

I context sono wrappati in `App.jsx` nell'ordine `AppProvider → SpeseProvider → AttivitaProvider → ImpostazioniProvider`. Ogni provider legge da `localStorage` all'inizializzazione e persiste ogni modifica tramite il hook `useLocalStorage`.

---

### `AppContext.jsx`

**Responsabilità:** gestione degli utenti e dell'utente attivo.

**Stato:**

| Campo | Tipo | Descrizione |
|---|---|---|
| `utenti` | `Utente[]` | Array di tutti gli utenti registrati |
| `utenteAttivoId` | `string \| null` | ID dell'utente selezionato |
| `utenteAttivo` | `Utente \| null` | Oggetto utente attivo (derivato) |

**Funzioni esposte:**

| Funzione | Firma | Descrizione |
|---|---|---|
| `setUtenteAttivoId` | `(id: string \| null) => void` | Seleziona o deseleziona l'utente attivo |
| `aggiungiUtente` | `(nome: string) => string \| null` | Aggiunge un utente (max 6); restituisce il nuovo ID o null se limite raggiunto |
| `modificaUtente` | `(id: string, dati: Partial<Utente>) => void` | Aggiorna i campi di un utente |
| `eliminaUtente` | `(id: string) => void` | Rimuove un utente e fa logout se era attivo |

**Note:** alla prima installazione, inizializza gli utenti default (Riccardo e Federico) e li scrive subito in localStorage in modo sincrono, così gli altri context trovano i nomi reali al loro primo accesso.

---

### `SpeseContext.jsx`

**Responsabilità:** gestione CRUD delle spese e generazione automatica delle spese ricorrenti.

**Stato:**

| Campo | Tipo | Descrizione |
|---|---|---|
| `spese` | `Spesa[]` | Array di tutte le spese |

**Funzioni esposte:**

| Funzione | Firma | Descrizione |
|---|---|---|
| `aggiungiSpesa` | `(spesa: Omit<Spesa, 'id'>) => void` | Aggiunge una spesa con ID = `Date.now()` |
| `eliminaSpesa` | `(id: number) => void` | Rimuove una spesa per ID |
| `modificaSpesa` | `(id: number, dati: Partial<Spesa>) => void` | Aggiorna i campi di una spesa |
| `riassegnaCategoria` | `(vecchia: string, nuova: string) => void` | Cambia categoria su tutte le spese che usano quella vecchia |
| `aggiornaRiferimentiUtente` | `(vecchioNome: string, nuovoNome: string) => void` | Aggiorna nome pagatore/partecipanti dopo rinomina utente |

**Effetto automatico:** al mount, controlla se è un nuovo mese e, se sì, duplica le spese ricorrenti del mese precedente con data `YYYY-MM-01`.

---

### `AttivitaContext.jsx`

**Responsabilità:** gestione CRUD delle attività, storico completamenti e reset automatico.

**Stato:**

| Campo | Tipo | Descrizione |
|---|---|---|
| `attivita` | `Attivita[]` | Array di tutte le attività |
| `storicoCompletamenti` | `Completamento[]` | Storico di tutti i completamenti |

**Funzioni esposte:**

| Funzione | Firma | Descrizione |
|---|---|---|
| `aggiungiAttivita` | `(att: Omit<Attivita, 'id' \| 'completato'>) => void` | Aggiunge un'attività |
| `eliminaAttivita` | `(id: number) => void` | Rimuove un'attività |
| `modificaAttivita` | `(id: number, dati: Partial<Attivita>) => void` | Aggiorna i campi di un'attività |
| `toggleAttivita` | `(id: number, utente: string) => void` | Completa o de-completa; aggiorna storico |
| `aggiornaRiferimentiUtente` | `(vecchioNome: string, nuovoNome: string) => void` | Aggiorna nome assegnato/completatoDa dopo rinomina utente |

**Effetto automatico:** reset ricorrenti al mount e ad ogni ritorno in foreground (evento `visibilitychange`).

---

### `ImpostazioniContext.jsx`

**Responsabilità:** impostazioni globali della casa e delle categorie spese.

**Stato:**

| Campo | Tipo | Default |
|---|---|---|
| `nomeCasa` | `string` | `"Casa"` |
| `primoGiornoSettimana` | `number` | `1` (Lunedì) |
| `categorie` | `{ nome: string; icona: string }[]` | spesa 🛒, bolletta ⚡, affitto 🏠, altro 📦 |

**Funzioni esposte:**

| Funzione | Firma | Descrizione |
|---|---|---|
| `aggiornaImpostazioni` | `(dati: Partial<Impostazioni>) => void` | Merge parziale delle impostazioni |

---

## Layout

### `Navbar.jsx`

Barra superiore fissa. Mostra:
- Il titolo della pagina corrente (basato su `location.pathname`)
- L'avatar dell'utente attivo con le sue iniziali e il suo colore
- Cliccando sull'avatar apre `ImpostazioniDrawer`

### `BottomNav.jsx`

Navigazione a tab inferiore per mobile con 5 voci:

| Tab | Path | Icona |
|---|---|---|
| Home | `/` | HomeRounded |
| Spese | `/spese` | ReceiptLong |
| Attività | `/attivita` | ChecklistRounded |
| Calendario | `/calendario` | CalendarMonth |
| Statistiche | `/statistiche` | BarChart |

Rispetta l'area sicura iPhone con `paddingBottom: env(safe-area-inset-bottom)`.

### `ErrorBoundary.jsx`

Class component React che cattura eccezioni JavaScript a runtime tramite `componentDidCatch`. Mostra una schermata di errore con messaggio e pulsante "Ricarica" che esegue `window.location.reload()`.

### `ImpostazioniDrawer.jsx`

Drawer laterale o bottom sheet con:
- Avatar e nome dell'utente attivo
- Lista di tutti gli utenti per cambio rapido profilo
- Link alle impostazioni principali
- Pulsante logout

---

## Pagine

### `Benvenuto.jsx`

Schermata iniziale mostrata quando nessun utente è attivo. Mostra la lista degli utenti disponibili come card cliccabili. Dopo la selezione, naviga automaticamente a `/`.

### `Home.jsx`

Dashboard principale. Sezioni:
1. **Saluto** — nome utente e data corrente in italiano
2. **Bilancio mese** — card gradiente cliccabile con il riepilogo debiti; naviga a `/spese`
3. **Statistiche rapide** — griglia 2 colonne: totale speso mese e % attività completate oggi; entrambe cliccabili
4. **Strip settimanale** — 7 giorni con dot colorati per utente; ogni giorno cliccabile apre il calendario su quella data
5. **Attività di oggi** — lista con checkbox inline; intestazione cliccabile → `/attivita`
6. **In arrivo** — prossime 3 attività non giornaliere; intestazione cliccabile → `/attivita`

Usa `getAttivitaPerData` importata da `Calendario.jsx` per la strip settimanale.

### `Spese.jsx`

Pagina spese. Contiene:
- `Bilancio` in cima
- Barra di ricerca, filtro categoria e ordinamento (data, importo, categoria)
- Lista `SpesaCard` con opzioni di modifica/eliminazione su swipe o menu
- FAB per aggiungere nuova spesa (apre `AggiuntaSpesa`)
- Pulsante export CSV

### `Attivita.jsx`

Pagina attività. Contiene:
- `RiepilogoAttivita` in cima
- Filtro per utente (chip selezionabili)
- Toggle "Nascondi completate"
- `TaskList` con le attività filtrate
- FAB per aggiungere nuova attività (apre `AggiuntaTask`)

### `Calendario.jsx`

Pagina calendario. Esporta anche la funzione `getAttivitaPerData(attivita, dataStr)` usata da `Home.jsx`.

Struttura:
- Header con mese/anno e frecce di navigazione
- Griglia 7×N dei giorni del mese, con dot colorati per utente
- Pannello inferiore con la lista delle attività del giorno selezionato
- Checkbox inline per completare task
- FAB per aggiungere task nel giorno selezionato

**`getAttivitaPerData(attivita, dataStr)`:** restituisce tutte le attività attive per una data specifica, considerando tutte le frequenze (giornaliera, settimanale, mensile, specifica). Esclude le attività con `dataFine` passata.

### `Statistiche.jsx`

Pagina statistiche con navigazione per mese (frecce). Sezioni:
- **Bilancio mese** — chip debitore/creditore con importo
- **Spese per categoria** — barra `LinearProgress` con percentuale
- **Pagamenti per utente** — avatar + importo totale pagato
- **Trend mensile** — chip `TrendChip` con variazione % rispetto al mese precedente
- **Completamenti attività** — barre per utente
- **Task più trascurate** — attività con meno completamenti nel periodo
- **Andamento ultimi 6 mesi** — grafico a colonne (SVG inline)

### `Impostazioni.jsx`

Menu principale impostazioni. Lista di voci con icona, titolo e descrizione breve che navigano alle sottopagine.

### `ImpostazioniProfilo.jsx`

Mostra nome e avatar dell'utente attivo. Rimanda a `/impostazioni/utenti` per modificare il nome.

### `ImpostazioniTema.jsx`

Permette di scegliere in tempo reale:
- Modalità: Chiara / Auto (sistema) / Scura
- Colore app primario (6 swatches)
- Colore avatar (6 swatches)

Le modifiche vengono applicate immediatamente via `modificaUtente` senza necessità di conferma.

### `ImpostazioniCategorie.jsx`

Gestione categorie spese:
- Lista categorie con icona emoji modificabile
- Aggiunta nuova categoria con picker icona
- Eliminazione categoria con dialog che chiede su quale categoria riassegnare le spese esistenti

### `ImpostazioniCasa.jsx`

Form per modificare il nome della casa (salvato in `ImpostazioniContext`).

### `ImpostazioniUtenti.jsx`

Gestione utenti:
- Lista utenti con avatar, nome e colori
- Aggiunta utente con nome (fino a max 6)
- Modifica nome utente (aggiorna automaticamente riferimenti in spese e attività)
- Eliminazione utente con dialog di conferma

---

## Componenti Spese

### `SpesaCard.jsx`

Card Material UI per una singola spesa. Mostra:
- Icona e nome categoria
- Descrizione e data
- Importo (grassetto)
- Chip con la modalità di divisione
- Nome del pagatore con avatar colorato
- Icona 🔁 se ricorrente

Azioni: modifica (apre `AggiuntaSpesa` in modalità edit) e eliminazione con dialog di conferma.

### `AggiuntaSpesa.jsx`

Bottom drawer per la creazione/modifica di una spesa. Campi:
- Importo (numerico)
- Descrizione
- Categoria (chip selezionabili)
- Pagatore (chip selezionabili tra tutti gli utenti)
- Partecipanti (chip multi-selezione)
- Modalità divisione: Equa / Tutto a me / Tutto all'altro / Percentuale custom
- Slider percentuale (visibile solo con divisione "Percentuale")
- Anteprima quote per ogni partecipante
- Data (default oggi)
- Toggle ricorrente

### `Bilancio.jsx`

Card gradiente (colori dell'utente attivo) con il riepilogo bilancio:
- Toggle "Tutte" / "Seleziona categorie" per filtrare il calcolo
- Chip categorie selezionate con pulsante rimozione
- Per ogni coppia debitore/creditore: riga con importo e pulsante "Salda"
- Sezione collassabile "Quote pagate" per utente
- Sezione collassabile "Storico saldi" con date
- Dialog di conferma prima di registrare il saldo

---

## Componenti Attività

### `TaskCard.jsx`

Card per una singola attività. Mostra:
- Checkbox di completamento (con colore success se completata)
- Titolo con strikethrough se completata
- Badge frequenza (giornaliera / settimanale / mensile / specifica con data)
- Badge priorità (alta 🔴 / media 🟡 / bassa 🟢)
- Avatar dell'utente assegnato (o avatar multipli se "entrambi")
- Nome di chi ha completato il task (se completato)

Azioni: modifica (apre `AggiuntaTask`) e eliminazione con dialog di conferma.

### `AggiuntaTask.jsx`

Bottom drawer per la creazione/modifica di un'attività. Campi:
- Titolo
- Priorità (Alta / Media / Bassa)
- Frequenza (Giornaliera / Settimanale / Mensile / Data specifica)
- Giorno della settimana (se settimanale)
- Giorno del mese (se mensile)
- Data specifica (date picker, se specifica)
- Data di fine (opzionale, per ricorrenti)
- Assegnazione: utente specifico o "Entrambi"

### `TaskList.jsx`

Lista attività con raggruppamento per frequenza. Mostra le attività nell'ordine:
1. Giornaliere
2. Settimanali
3. Mensili
4. Data specifica

All'interno di ogni gruppo, le attività sono ordinate per priorità (alta → media → bassa). Le task completate appaiono in fondo al gruppo se "Nascondi completate" è disattivo.

### `RiepilogoAttivita.jsx`

Card gradiente con il riepilogo dell'utente attivo:
- Completamenti di oggi (N / tot)
- Completamenti di questa settimana
- Percentage bar

---

## Custom Hooks

### `useLocalStorage.js`

```js
function useLocalStorage(key, initializer)
// → [state, setState]
```

Hook che estende `useState` con persistenza automatica in `localStorage`. Al mount legge il valore salvato; ad ogni aggiornamento di stato scrive in localStorage via `useEffect`.

`initializer` è una funzione (lazy initializer) per evitare di eseguire il parsing JSON ad ogni render.

### `useFilters.js`

Hook per la gestione di filtri, ricerca testuale e ordinamento nella pagina Spese. Gestisce lo stato di: testo ricerca, categoria selezionata, campo di ordinamento, direzione (asc/desc).

Espone:
- `filtri` — stato corrente dei filtri
- `setFiltri` — setter
- `speseFiltrate` — array delle spese filtrate e ordinate

---

## Utility — `helpers.js`

Tutte le funzioni in `helpers.js` sono **pure** (nessun side effect, nessun accesso a localStorage).

### `COLORI_TEMA`

Array di 6 oggetti `{ valore, secondario, nome }` con i colori disponibili per il tema.

### `formatoData(date: Date) → string`

Converte un oggetto `Date` in stringa `"YYYY-MM-DD"` usando il fuso orario locale. Evita il bug UTC di `toISOString()`.

### `oggiLocale() → string`

Scorciatoia per `formatoData(new Date())`.

### `formattaImporto(n: number) → string`

Formatta un numero come valuta euro con `Intl.NumberFormat('it-IT')`. Es: `85.5` → `"€ 85,50"`.

### `formattaData(dateStr: string) → string`

Converte una stringa `"YYYY-MM-DD"` in formato leggibile italiano. Es: `"2024-01-15"` → `"15 gen 2024"`.

### `calcolaQuote(importo, pagatore, partecipantiOrAltro, divisione, percentuale) → Record<string, number>`

Calcola la quota di ogni utente per una spesa.

- `partecipantiOrAltro`: array di nomi (multi-utente) o stringa del secondo utente (compatibilità legacy)
- `divisione`: `'equa'` | `'metà'` | `'tutto_mio'` | `'tutto_altro'` | `'percentuale'`
- `percentuale`: quota % del pagatore (solo per divisione `'percentuale'`)

Restituisce un oggetto `{ nome: quota }` per ogni partecipante.

### `calcolaBilancio(spese, utenti) → BilancioResult`

Calcola il bilancio complessivo su un array di spese.

```ts
interface BilancioResult {
  debitore: string | null;
  creditore: string | null;
  importoDebito: number;
  bilancioPerUtente: Record<string, number>;  // saldo netto per utente
  tuttiDebiti: { debitore: string; creditore: string; importo: number }[];
}
```

Usa l'algoritmo greedy: ad ogni iterazione trova il creditore e il debitore con il saldo assoluto più alto e li accoppia per il minimo tra i due valori.

### `raggruppaPerMese(spese) → Record<string, Spesa[]>`

Raggruppa un array di spese per chiave mese in italiano (es. `"gennaio 2024"`).

---

## Test

### `src/utils/helpers.test.js`

Copertura completa delle funzioni in `helpers.js`:
- `oggiLocale` — formato corretto, fuso locale
- `formattaImporto` — valori positivi, zero, decimali
- `calcolaQuote` — tutte le modalità di divisione, 2 e 3 utenti
- `calcolaBilancio` — 2 e 3 utenti, caso in pari, `tuttiDebiti` con più transazioni

### `src/context/SpeseContext.test.jsx`

- Aggiunta spesa con ID automatico
- Eliminazione per ID
- Modifica campi
- `riassegnaCategoria` — aggiorna tutte le spese con quella categoria

### `src/context/AttivitaContext.test.jsx`

- Aggiunta attività
- Eliminazione
- Modifica
- `toggleAttivita` — completamento con aggiunta a storico
- Doppio toggle — de-completamento con rimozione da storico

### `src/context/ImpostazioniContext.test.jsx`

- Aggiornamento nome casa
- Aggiunta e rimozione categorie
- Cambio primo giorno settimana

### `src/components/Attivita/AggiuntaTask.test.jsx`

- Rendering del form
- Validazione campi obbligatori
- Invio dati al context

### `src/components/Attivita/TaskCard.test.jsx`

- Rendering dei dati della task
- Click checkbox → `toggleAttivita`
- Menu modifica/elimina

### `src/components/Spese/AggiuntaSpesa.test.jsx`

- Rendering del form
- Selezione categoria
- Calcolo anteprima quote

### `src/components/Spese/Bilancio.test.jsx`

- Rendering caso "in pari"
- Rendering caso con debito
- Dialog conferma saldo

### `src/components/Spese/SpesaCard.test.jsx`

- Rendering importo e descrizione
- Rendering icona categoria
- Azioni modifica/elimina
