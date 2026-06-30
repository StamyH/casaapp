# 📋 Requisiti CasaApp

Documento di tracciamento dei requisiti funzionali e tecnici con stato di implementazione aggiornato.

Legenda: ✅ Implementato | 🔲 Non implementato | ⚠️ Parziale

---

## Utenti

- ✅ L'app supporta da 2 a 6 utenti (configurabili)
- ✅ Ogni utente seleziona il proprio profilo all'avvio dalla schermata Benvenuto
- ✅ I dati sono salvati in locale su ogni dispositivo (localStorage)
- ✅ Ogni utente ha un colore avatar e un colore app personalizzato
- ✅ Aggiunta, modifica ed eliminazione utenti da Impostazioni → Utenti
- ✅ Cambio rapido utente dal drawer (icona avatar in alto a destra)

---

## Modulo Spese

### Registrazione spesa

- ✅ Inserire importo
- ✅ Inserire descrizione
- ✅ Selezionare categoria (spesa 🛒, bolletta ⚡, affitto 🏠, altro 📦 + personalizzate con icona)
- ✅ Selezionare chi ha pagato (qualsiasi utente)
- ✅ Selezionare i partecipanti alla spesa (multi-utente)
- ✅ Selezionare come dividere la spesa:
  - ✅ **Equa** — quota uguale tra tutti i partecipanti
  - ✅ **Tutto a me** — chi paga si accolla tutto
  - ✅ **Tutto all'altro** — chi paga anticipa tutto per gli altri
  - ✅ **Percentuale custom** — slider per scegliere la percentuale (2 utenti)
- ✅ Dividere tra più di 2 utenti
- ✅ Anteprima quote prima di salvare
- ✅ Data automatica (oggi), modificabile
- ✅ Toggle spesa ricorrente

### Visualizzazione

- ✅ Lista spese con ricerca testuale
- ✅ Filtro per categoria
- ✅ Ordinamento per data, importo, categoria (ascendente/discendente)
- ✅ Indicatore visivo spese ricorrenti (icona 🔁)
- ✅ Totale spese del mese visibile in Home

### Bilancio

- ✅ Calcolo automatico di chi deve cosa a chi (algoritmo greedy multi-utente)
- ✅ Gestione multi-utente con più coppie debitore/creditore
- ✅ Saldo debito con conferma (registra transazione di pareggio)
- ✅ Filtro bilancio per categoria
- ✅ Storico saldi con date
- ✅ Sezione "Quote pagate" per utente (collassabile)
- ✅ Export CSV
- 🔲 Import CSV

---

## Modulo Attività

### Creazione attività

- ✅ Titolo attività
- ✅ Priorità (alta / media / bassa)
- ✅ Frequenza:
  - ✅ **Giornaliera** — si ripete ogni giorno
  - ✅ **Settimanale** — si ripete un giorno specifico della settimana
  - ✅ **Mensile** — si ripete una data specifica del mese
  - ✅ **Data specifica** — una tantum, con data scelta
- ✅ Data di fine per attività ricorrenti
- ✅ Assegnazione: uno specifico utente o tutti gli utenti ("entrambi")

### Gestione

- ✅ Spunta completamento con tracciamento di chi ha completato
- ✅ Reset automatico alla scadenza per task ricorrenti
- ✅ Modifica e eliminazione con conferma
- ✅ Nascondi attività completate (toggle)
- ✅ Filtri per utente (chip selezionabili)
- ✅ Storico completamenti
- ✅ Riepilogo completamenti (card gradiente con statistiche giornaliere/settimanali)
- ✅ Notifica visiva se attività in ritardo — badge su Home e bordo rosso su TaskCard

---

## Calendario

- ✅ Pagina calendario con griglia mensile navigabile
- ✅ Dot colorati per utente su ogni giorno con attività
- ✅ Lista task del giorno selezionato con checkbox inline
- ✅ Modifica task direttamente dalla vista giornaliera
- ✅ Strip settimanale in Home con link al calendario
- ✅ Click su un giorno nella strip Home → apre il calendario su quella data
- ✅ Mostra tutte le frequenze (giornaliere, settimanali, mensili, specifiche)
- ✅ FAB per aggiungere task nel giorno selezionato

---

## Home

- ✅ Saluto personalizzato con nome utente
- ✅ Data corrente in italiano
- ✅ Bilancio del mese (cliccabile → Spese)
- ✅ Statistiche rapide: totale speso mese + % attività oggi
- ✅ Strip settimanale con link al calendario
- ✅ Attività di oggi con checkbox (intestazione cliccabile → Attività)
- ✅ Prossime attività con data (intestazione cliccabile → Attività)

---

## Modulo Impostazioni

### Profili utente

- ✅ Visualizzare nome e avatar utente
- ✅ Scegliere colore avatar (dalla pagina Tema)
- ✅ Menu utente con cambio profilo rapido e logout
- ⚠️ Modificare il nome utente dalla pagina Profilo — *rimanda a Impostazioni → Utenti*

### Categorie spese

- ✅ Visualizzare categorie con icona emoji modificabile
- ✅ Aggiungere nuova categoria personalizzata
- ✅ Eliminare categorie con scelta categoria di fallback
- ✅ Le spese esistenti vengono riassegnate automaticamente alla categoria fallback

### Tema

- ✅ Scegliere il colore principale dell'app (6 opzioni, applicato in tempo reale)
- ✅ Scegliere il colore del proprio avatar (applicato in tempo reale)
- ✅ Modalità chiara / scura / auto (segue le impostazioni del sistema)
- ✅ Il tema è per-utente (ogni utente ha il suo colore)

### Gestione casa

- ✅ Modificare il nome della casa
- ✅ Aggiungere utenti (fino a 6)
- ✅ Rimuovere utenti
- ✅ Modificare nome utente (aggiorna automaticamente riferimenti in spese e attività)

---

## Statistiche

- ✅ Bilancio per mese con navigazione mese precedente/successivo
- ✅ Spese per categoria con barre proporzionali
- ✅ Pagamenti per utente (chi ha pagato quanto)
- ✅ Trend mensile (chip +/- rispetto al mese precedente)
- ✅ Completamenti attività per utente
- ✅ Task più frequentemente non completate
- ✅ Andamento completamenti ultimi 6 mesi (grafico a colonne)

---

## Requisiti tecnici

- ✅ Deploy automatico su GitHub Pages (CI/CD via GitHub Actions)
- ✅ Funziona offline (dati in localStorage)
- ✅ Responsive mobile-first
- ✅ Persistenza dati con localStorage
- ✅ Service Worker per cache asset statici (Workbox)
- ✅ Notifica aggiornamento disponibile con pulsante "Aggiorna"
- ✅ Supporto dark mode dinamico
- ✅ Animazioni fluide con variabili CSS spring
- ✅ Rispetto safe-area iPhone (notch e home indicator)
- ✅ Font Inter per leggibilità mobile
- ✅ PWA installabile su iPhone — manifest completo, apple-touch-startup-image aggiunto
- 🔲 Sincronizzazione tra dispositivi — *richiede backend (es. Firebase Firestore)*
- 🔲 Notifiche push — *richiede backend e permessi browser*
