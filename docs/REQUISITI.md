# 📋 Requisiti CasaApp

## Utenti
- L'app supporta due o più utenti (configurabili)
- Ogni utente seleziona il proprio profilo all'avvio
- I dati sono salvati in locale su ogni dispositivo (localStorage)

---

## Modulo Spese

### Registrazione spesa
- [x] Inserire importo
- [x] Inserire descrizione
- [x] Selezionare categoria (spesa, bolletta, affitto, altro + personalizzate con icona)
- [x] Selezionare chi ha pagato (qualsiasi utente)
- [x] Selezionare come dividere la spesa:
  - **Equa** — quota uguale tra tutti i partecipanti
  - **Tutto a me** — chi paga si accolla tutto
  - **Tutto all'altro** — chi paga anticipa tutto per gli altri
  - **Percentuale custom** — slider per scegliere la percentuale (2 utenti)
- [x] Dividere tra più di 2 utenti
- [x] Data automatica

### Visualizzazione
- [x] Lista spese con ricerca, filtri e ordinamento
- [x] Totale spese
- [x] Spese ricorrenti

### Bilancio
- [x] Calcolo automatico di chi deve cosa a chi (algoritmo greedy multi-utente)
- [x] Saldo debito con conferma
- [x] Bilancio filtrato per categoria
- [x] Export CSV

---

## Modulo Attività

### Creazione attività
- [x] Titolo attività
- [x] Priorità (alta / media / bassa)
- [x] Frequenza:
  - **Giornaliera** — si ripete ogni giorno
  - **Settimanale** — si ripete un giorno specifico della settimana
  - **Mensile** — si ripete una data specifica del mese
  - **Data specifica** — una tantum, con data scelta
- [x] Data di fine per attività ricorrenti
- [x] Assegnazione: uno o tutti gli utenti

### Gestione
- [x] Spunta completamento con tracciamento di chi ha completato
- [x] Reset automatico alla scadenza per task ricorrenti
- [x] Modifica e eliminazione con conferma
- [x] Nascondi attività completate
- [x] Filtri collassabili per utente
- [x] Storico completamenti
- [ ] Notifica visiva se attività in ritardo

---

## Calendario

- [x] Pagina calendario con griglia mensile navigabile
- [x] Dot colorati per utente su ogni giorno con attività
- [x] Lista task del giorno selezionato con checkbox inline
- [x] Strip settimanale in Home con link al calendario
- [x] Mostra tutte le frequenze (giornaliere, settimanali, mensili, specifiche)

---

## Home

- [x] Data corrente visibile
- [x] Bilancio del mese (cliccabile → Spese)
- [x] Statistiche rapide: totale speso mese + % attività oggi
- [x] Strip settimanale con link al calendario
- [x] Attività di oggi con checkbox (cliccabile → Attività)
- [x] Prossime attività (cliccabile → Attività)

---

## Modulo Impostazioni

### Profili utente
- [x] Visualizzare nome e avatar utente
- [x] Scegliere colore avatar (da pagina Tema)
- [x] Menu utente con cambio profilo e logout
- [ ] Modificare il nome utente dalla pagina Profilo (rimanda alla sezione Utenti)

### Categorie spese
- [x] Visualizzare categorie con icona modificabile
- [x] Aggiungere nuova categoria personalizzata
- [x] Eliminare categorie con scelta categoria di fallback

### Tema
- [x] Scegliere il colore principale dell'app (applicato in tempo reale)
- [x] Scegliere il colore del proprio avatar (applicato in tempo reale)
- [x] Modalità chiara / scura / auto (segui impostazioni del telefono)

### Gestione casa
- [x] Modificare il nome della casa
- [x] Aggiungere e rimuovere utenti

---

## Statistiche

- [x] Bilancio per mese con navigazione
- [x] Spese per categoria con barre
- [x] Pagamenti per utente
- [x] Trend mensile (chip +/- rispetto al mese precedente)
- [x] Completamenti attività per utente
- [x] Task più frequentemente non completate
- [x] Andamento completamenti ultimi 6 mesi

---

## Requisiti tecnici
- [x] Deploy automatico su GitHub Pages (CI/CD)
- [x] Funziona offline (dati in localStorage)
- [x] Responsive mobile-first
- [x] Persistenza dati con localStorage
- [ ] PWA installabile su iPhone
- [ ] Sincronizzazione tra dispositivi
