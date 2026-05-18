# 📋 Requisiti CasaApp

## Utenti
- L'app supporta due utenti: **Riccardo** e **Federico**
- Ogni utente seleziona il proprio profilo all'avvio
- I dati sono salvati in locale su ogni dispositivo (localStorage)

---

## Modulo Spese

### Registrazione spesa
- [x] Inserire importo
- [x] Inserire descrizione
- [x] Selezionare categoria (spesa, bolletta, affitto, altro + personalizzate)
- [x] Selezionare chi ha pagato (Riccardo / Federico)
- [x] Selezionare come dividere la spesa:
  - **Metà/Metà** — 50% ciascuno
  - **Tutto a me** — chi paga si accolla tutto
  - **Tutto all'altro** — chi paga anticipa tutto per l'altro
  - **Percentuale custom** — slider per scegliere la percentuale
- [x] Data automatica

### Visualizzazione
- [x] Lista spese
- [x] Totale spese

### Bilancio
- [x] Calcolo automatico di chi deve cosa a chi

---

## Modulo Attività

### Creazione attività
- [x] Titolo attività
- [x] Frequenza:
  - **Giornaliera** — si ripete ogni giorno
  - **Settimanale** — si ripete un giorno specifico della settimana
  - **Mensile** — si ripete una data specifica del mese
  - **Data specifica** — una tantum, con data scelta
- [x] Assegnazione: Riccardo, Federico, o entrambi

### Gestione
- [x] Spunta completamento
- [x] Reset automatico alla scadenza per task ricorrenti
- [ ] Notifica visiva se in ritardo

---

## Modulo Impostazioni

### Profili utente
- [x] Visualizzare nome e avatar utente
- [x] Scegliere colore avatar (da pagina Tema)
- [x] Menu utente con cambio profilo e logout
- [ ] Modificare il nome utente (attualmente solo dalla schermata di selezione)

### Categorie spese
- [x] Visualizzare categorie esistenti
- [x] Aggiungere nuova categoria personalizzata
- [x] Eliminare categorie

### Tema
- [x] Scegliere il colore principale dell'app (applicato in tempo reale)
- [x] Scegliere il colore del proprio avatar (applicato in tempo reale)
- [x] Modalità chiara / scura / auto (segui impostazioni del telefono)

### Gestione casa
- [x] Modificare il nome della casa

---

## Requisiti tecnici
- [ ] PWA installabile su iPhone
- [ ] Funziona offline
- [ ] Sincronizzazione tra dispositivi (attualmente i dati sono locali)
- [x] Responsive mobile-first
- [x] Persistenza dati con localStorage